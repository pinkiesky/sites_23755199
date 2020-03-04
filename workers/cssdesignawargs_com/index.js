const request = require('request-promise-native');
const cheerio = require('cheerio');
const Queue = require('promise-queue');
const https = require('https');
const httpsAgent = new https.Agent({ keepAlive: true });

const requestQueue = new Queue(5, Infinity);

const WORKER_NAME = 'cssdesignawards.com';

const warn = (...args) => console.warn(WORKER_NAME, ':', ...args);
const info = (...args) => console.info(WORKER_NAME, ':', ...args);

async function cssdaRequest(url, opts) {
  return requestQueue.add(() =>
    request(url, {
      baseUrl: 'https://www.cssdesignawards.com/',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:73.0) Gecko/20100101 Firefox/73.0',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      method: 'GET',
      agent: httpsAgent,
      pool: httpsAgent,
      ...opts,
    }),
  );
}

async function loadCompaniesListFromPage(page) {
  const html = await cssdaRequest(`wotd-award-nominees?page=${page}`);

  const $ = cheerio.load(html);

  const companyNodes = $('article.single-project');
  if (!companyNodes || !companyNodes.length) {
    warn('company nodes is null');
    return [];
  }

  const companies = companyNodes.map((i, node) => {
    try {
      const name = $('.single-project__title', node).text() || null;
      const url = $('a.sp__project-link', node).attr('href') || null;

      return {
        company: name ? name.trim() : name,
        url,
        source: WORKER_NAME,
      };
    } catch (e) {
      warn(`cannot load company with index ${i}`, e);
    }
  });

  return Array.from(companies).filter((c) => !!c);
}

async function loadCompaniesList(limit = 1000) {
  info('started');

  const html = await cssdaRequest('wotd-award-nominees');
  const $ = cheerio.load(html);

  const paginationLastPage = $(
    '.pagination__list .pagination__item:nth-last-child(2)',
  ).text();
  if (!paginationLastPage) {
    warn('cannot load number of pages');
    return [];
  }

  const numberOfPages = Number(paginationLastPage);
  if (!numberOfPages) {
    warn('cannot parse number of pages');
    return [];
  }

  const pagePromises = new Array(numberOfPages)
    .fill(1)
    .map((v, i) => v + i)
    .map((page) => loadCompaniesListFromPage(page));

  const companiesResult = [];
  for (const [index, pagePromise] of Object.entries(pagePromises)) {
    const companies = await pagePromise;
    info('page loaded', parseInt(index) + 1);

    companiesResult.splice(companiesResult.length, 0, ...companies);

    if (companiesResult.length >= limit) {
      companiesResult.length = limit;
      break;
    }
  }

  // drop all other requests
  requestQueue.queue.length = 0;

  info('ended');
  return companiesResult;
}

module.exports = {
  loadCompaniesList,
  loadCompaniesListFromPage,
  name: WORKER_NAME,
};
