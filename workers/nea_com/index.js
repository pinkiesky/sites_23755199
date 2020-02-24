const request = require('request-promise-native');
const cheerio = require('cheerio');
const Queue = require('promise-queue');

const requestQueue = new Queue(35, Infinity);

const WORKER_NAME = 'nea.com';

const warn = (...args) => console.warn(WORKER_NAME, ':', ...args);
const info = (...args) => console.info(WORKER_NAME, ':', ...args);

async function neaRequest(url, opts, extraHeaders) {
  /**
   * If Cloudflare blocks your request: open in browser https://www.nea.com/, pass the CAPTCHA test if needed,
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

  return requestQueue.add(() =>
    request(url, {
      baseUrl: 'https://www.nea.com/',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:73.0) Gecko/20100101 Firefox/73.0',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'X-Requested-With': 'XMLHttpRequest',
        Referer:
          'https://www.nea.com/portfolio?keywords=&event=Portfolio+Bottom+Search',
        ...cookies,
        ...extraHeaders,
      },
      method: 'GET',
      ...opts,
    }),
  );
}

async function loadCompaniesList() {
  info('started');

  const html = await neaRequest(
    '/portfolio?keywords=&event=Portfolio+Bottom+Search&dataType=html',
  );

  const $ = cheerio.load(html);
  
  info('page is loaded');

  const companyNodes = $('.company a');
  if (!companyNodes || !companyNodes.length) {
    warn('company nodes is null');
    return [];
  }

  const companiesPromises = companyNodes.map(async (i, node) => {
    try {
      const href = node.attribs.href;
      if (!href) {
        return;
      }

      return {
        ...(await loadCompanyFromUrl(href.replace('https://www.nea.com', ''))),
        source: WORKER_NAME,
      };
    } catch (e) {
      warn(`cannot load company with index ${i}`, e);
    }
  });

  const resolved = await Promise.all(Array.from(companiesPromises));

  info('ended');
  return resolved.filter((c) => !!c);
}

async function loadCompanyFromUrl(pageUrl) {
  const html = await neaRequest(pageUrl);
  const $ = cheerio.load(html);

  const name = $('h1 img.centered').attr('alt') || null;
  const url =
    $('ul.padded li')
      .filter((i, node) => $('.label', node).text() === 'Website')
      .children('a')
      .attr('href') || null;

  info('loaded', pageUrl);

  return {
    company: name,
    url,
  };
}

module.exports = {
  loadCompanyFromUrl,
  loadCompaniesList,
  name: WORKER_NAME,
};
