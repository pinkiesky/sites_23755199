const request = require('request-promise-native');
const cheerio = require('cheerio');
const Queue = require('promise-queue');

const requestQueue = new Queue(35, Infinity);

const WORKER_NAME = 'kleinerperkins.com';

const warn = (...args) => console.warn(WORKER_NAME, ':', ...args);
const info = (...args) => console.info(WORKER_NAME, ':', ...args);

async function kleinerperkinsRequest(url, opts) {
  return requestQueue.add(() =>
    request(url, {
      baseUrl: 'https://kleinerperkins.com/',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:73.0) Gecko/20100101 Firefox/73.0',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      method: 'GET',
      ...opts,
    }),
  );
}

async function loadCompaniesListByName(name) {
  const html = await kleinerperkinsRequest(`partnerships/${name}`);

  const $ = cheerio.load(html);

  info('loaded page', name);

  const companyNodes = $('a.tile--company:not(.open-case-study)');
  const companies = companyNodes.map((i, node) => {
    try {
      const url = $(node).attr('href') || null;

      let name = null;
      const imgRawString = $('img.tile__img', node).attr('alt');
      if (imgRawString) {
        name = imgRawString.toLowerCase().endsWith('logo')
          ? imgRawString.substr(0, imgRawString.length - 'logo'.length).trim()
          : imgRawString.trim();
      }

      return {
        company: name,
        url,
        source: WORKER_NAME,
      };
    } catch (e) {
      warn(`cannot load company with index ${i}`, e);
    }
  });

  const companyCaseNodes = $('a.tile--company.open-case-study');
  const companiesCase = companyCaseNodes.map(async (i, node) => {
    try {
      let name = null;
      const imgRawString = $('img.tile__img', node).attr('alt');
      if (imgRawString) {
        name = imgRawString.toLowerCase().endsWith('logo')
          ? imgRawString.substr(0, imgRawString.length - 'logo'.length).trim()
          : imgRawString.trim();
      }

      let url = null;
      try {
        const partialUrl = $(node).attr('href');
        url = await loadUrlFromPartialPage(partialUrl);
      } catch (e) {
        warn(`cannot load link for company ${i}`, e);
      }

      return {
        company: name,
        url,
        source: WORKER_NAME,
      };
    } catch (e) {
      warn(`cannot load company with index ${i}`, e);
    }
  });

  const resolved = Array.from(companies);
  const resolvedCase = await Promise.all(Array.from(companiesCase));

  info('ended page', name);
  return [...resolved, ...resolvedCase];
}

async function loadUrlFromPartialPage(partialLink) {
  const partialHtml = await kleinerperkinsRequest(partialLink);

  const partial$ = cheerio.load(partialHtml);
  const linkNodes = partial$('.article__logo a');
  return linkNodes.attr('href') || null;
}

async function loadCompaniesList() {
  info('started');

  const lists = await Promise.all([
    loadCompaniesListByName(''), // alumni
    loadCompaniesListByName('consumer/'),
    loadCompaniesListByName('enterprise/'),
    loadCompaniesListByName('hardtech/'),
    loadCompaniesListByName('health-care/'),
  ]);

  info('ended');
  return lists.reduce((arr, companies) => [...arr, ...companies], []);
}

module.exports = {
  loadUrlFromPartialPage,
  loadCompaniesList,
  name: WORKER_NAME,
};
