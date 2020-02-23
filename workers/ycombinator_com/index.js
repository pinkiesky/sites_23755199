const request = require('request-promise-native');
const safeEval = require('safe-eval');

const COMPANY_NAME = 'ycombinator.com';

const warn = (...args) => console.warn(COMPANY_NAME, ':', ...args);

async function ycRequest(url, opts) {
  /**
   * If Cloudflare blocks your request: open in browser https://www.ycombinator.com/, pass the CAPTCHA test if needed,
   * and copy the value of `__cfduid` cookie from browser storage. Then create environment variable with name `CFUID`
   * and rerun parser.
   * !! Instead enviroment variable you may create line below like:
   *    process.env.SITE_CFUID = 'a996c7bc23d765f521fe0027778c1d85d1551613354';
   */
  const cookies = process.env.CFUID
    ? {
        Cookie: `__cfduid=${process.env.CFUID}`,
      }
    : null;

  return request(url, {
    baseUrl: 'https://api.ycombinator.com/',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:73.0) Gecko/20100101 Firefox/73.0',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      Referer: 'https://www.ycombinator.com/companies',
      ...cookies,
    },
    method: 'GET',
    ...opts,
  });
}

function setupCompanies(rawCompaniesArray) {
  return rawCompaniesArray
    .map((cmp) => {
      if (!cmp) {
        return;
      }

      return {
        company: cmp.name || null,
        url: cmp.url || null,
        source: COMPANY_NAME,
      };
    })
    .filter((c) => !!c);
}

async function loadCompaniesList() {
  const js = await ycRequest(
    `companies/export.json?callback=true&_=${Date.now()}`,
  );

  return safeEval(js, { setupCompanies });
}

module.exports = {
  loadCompaniesList,
};
