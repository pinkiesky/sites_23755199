const request = require('request-promise-native');
const cheerio = require('cheerio');
const https = require('https');
const httpsAgent = new https.Agent({ keepAlive: true });

const WORKER_NAME = 'awwwards.com';

const warn = (...args) => console.warn(WORKER_NAME, ':', ...args);
const info = (...args) => console.info(WORKER_NAME, ':', ...args);

async function awwwRequest(url, opts) {
  return request(url, {
    baseUrl: 'https://www.awwwards.com/',
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
  });
}

async function loadCompaniesListFromPage(pageUrl) {
  const html = await awwwRequest(pageUrl);

  const $ = cheerio.load(html);

  const companyNodes = $('ul li.js-collectable');
  if (!companyNodes || !companyNodes.length) {
    warn('company nodes is null');
    return [];
  }

  const companies = companyNodes.map((i, node) => {
    try {
      const name = $('h3', node).text() || null;
      const url = $('.bottom a.js-visit-item', node).attr('href') || null;

      return {
        company: name ? name.trim() : name,
        url,
        source: WORKER_NAME,
      };
    } catch (e) {
      warn(`cannot load company with index ${i}`, e);
    }
  });

  return {
    companies: Array.from(companies).filter((c) => !!c),
    nextPageUrl: $('a.item.more').attr('href'),
  };
}

async function loadCompaniesList(limit = 1000) {
  info('started');

  const companiesResult = [];

  let currentPageUrl = '/websites/sites_of_the_day/?page=1';
  while (currentPageUrl) {
    const { companies, nextPageUrl } = await loadCompaniesListFromPage(
      currentPageUrl,
    );

    companiesResult.splice(companiesResult.length, 0, ...companies);
    if (companiesResult.length >= limit) {
      companiesResult.length = limit;
      break;
    }
    info('load page', currentPageUrl);

    currentPageUrl = nextPageUrl;
  }

  info('ended');
  return companiesResult;
}

module.exports = {
  loadCompaniesList,
  loadCompaniesListFromPage,
  name: WORKER_NAME,
};
