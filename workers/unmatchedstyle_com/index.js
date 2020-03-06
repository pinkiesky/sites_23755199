const request = require('request-promise-native');
const cheerio = require('cheerio');
const Queue = require('promise-queue');
const https = require('https');

const httpsAgent = new https.Agent({ keepAlive: true });

// !! Increasing the concurrency may cause downloading errors!
const requestQueue = new Queue(2, Infinity);

const WORKER_NAME = 'unmatchedstyle.com';

const warn = (...args) => console.warn(WORKER_NAME, ':', ...args);
const info = (...args) => console.info(WORKER_NAME, ':', ...args);

async function unmatchedstyleRequest(url, opts) {
  /**
   * If Cloudflare blocks your request: open in browser http://unmatchedstyle.com/, pass the CAPTCHA test if needed,
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

  return requestQueue.add(async () => {
    return request(url, {
      baseUrl: 'https://unmatchedstyle.com/',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'If-Modified-Since': 'Tue, 01 Mar 2018 15:50:07 GMT',
        Referer: 'https://unmatchedstyle.com/gallery',
        Connection: 'keep-alive',
        ...cookies,
      },
      pool: httpsAgent,
      agent: httpsAgent,
      method: 'GET',
      ...opts,
    });
  });
}

function getPageSafeLinkOrThrow(node, $) {
  const dsqsLink = $('a.comments-link span', node).data('dsqidentifier');
  if (typeof dsqsLink !== 'string') {
    throw new Error('no dsqs links found');
  }

  const match = dsqsLink.match(/\/\?p=\d+/gi);
  if (!match || !match.length) {
    throw new Error('wrong dsqs link');
  }

  return match[0];
}

async function loadCompaniesListByPage(page) {
  const html = await unmatchedstyleRequest(`gallery/page/${page}`);

  const $ = cheerio.load(html);

  info('loaded page', page);

  const companyNodes = $('#gallery > article');
  const companies = companyNodes.map(async (i, node) => {
    try {
      const name = $('h3', node).text() || null;

      try {
        const pageSafeLink = getPageSafeLinkOrThrow(node, $);
        url = await loadUrlFromPartialPage(pageSafeLink);
      } catch (err) {
        warn('cannot load url for ', name);
      }

      return {
        company: name ? name.trim() : name,
        url,
        source: WORKER_NAME,
      };
    } catch (e) {
      warn(`cannot load company with index ${i}`, e);
    }
  });

  const resolved = await Promise.all(Array.from(companies));

  info('ended page', page);
  return resolved;
}

async function loadUrlFromPartialPage(partialLink) {
  const partialHtml = await unmatchedstyleRequest(partialLink);

  console.log('load', partialLink);

  const partial$ = cheerio.load(partialHtml);
  const linkNodes = partial$('header .visit a');
  return linkNodes.attr('href') || null;
}

async function loadCompaniesList(limit = 1000) {
  info('started');

  const companiesReduced = [];
  let page = 1;
  while (true) {
    const companies = await loadCompaniesListByPage(page);
    if (!companies || !companies.length) {
      break;
    }

    companiesReduced.splice(companiesReduced.length, 0, ...companies);
    if (companiesReduced.length >= limit) {
      companiesReduced.length = limit;
    }

    page++;
  }

  info('ended');
  return companiesReduced;
}

// Work in progress
// Not be loaded, because unmatchedstyle under wordfence protection (free advertise)

// module.exports = {
//   loadUrlFromPartialPage,
//   loadCompaniesListByPage,
//   loadCompaniesList,
//   name: WORKER_NAME,
// };
