const request = require('request-promise-native');
const cheerio = require('cheerio');

const COMPANY_NAME = 'usv.com';

const warn = (...args) => console.warn(COMPANY_NAME, ':', ...args);

async function usvRequest(url, opts) {
  /**
   * If Cloudflare blocks your request: open in browser https://www.usv.com/, pass the CAPTCHA test if needed,
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
    baseUrl: 'https://www.usv.com/',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:73.0) Gecko/20100101 Firefox/73.0',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      ...cookies,
    },
    method: 'GET',
    ...opts,
  });
}

async function loadCompaniesList() {
  const html = await usvRequest('companies/');

  const $ = cheerio.load(html);

  const companyNodes = $(
    '.companies-list .m__list-row:not(.m__list-row--mobile) .m__list-row__col:nth-child(2)',
  );
  if (!companyNodes || !companyNodes.length) {
    warn('company nodes is null');
    return [];
  }

  const companies = companyNodes.map((i, node) => {
    try {
      let name = null;
      let url = null;

      const internalLink = $('a', node);
      if (internalLink && internalLink.length) {
        name = internalLink.text() || null;
        url = internalLink.attr('href') || null;
      } else {
        name = $(node).text() || null;
      }

      return {
        company: name ? name.trim() : name,
        url,
        source: COMPANY_NAME,
      };
    } catch (e) {
      warn(`cannot load company with index ${i}`, e);
    }
  });

  const resolved = Array.from(companies);
  return resolved.filter((c) => !!c);
}

module.exports = {
  loadCompaniesList,
};
