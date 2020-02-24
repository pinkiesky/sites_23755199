const request = require('request-promise-native');
const cheerio = require('cheerio');
const Queue = require('promise-queue');

// !! Increasing the concurrency may cause downloading errors!
const requestQueue = new Queue(15, Infinity);

const WORKER_NAME = 'lsvp.com';

const warn = (...args) => console.warn(WORKER_NAME, ':', ...args);
const info = (...args) => console.info(WORKER_NAME, ':', ...args);

async function lsvpRequest(url, opts, extraHeaders) {
  return requestQueue.add(() =>
    request(url, {
      baseUrl: 'https://www.lsvp.com/',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:73.0) Gecko/20100101 Firefox/73.0',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        ...extraHeaders,
      },
      method: 'GET',
      ...opts,
    }),
  );
}

async function loadCompaniesList() {
  info('started');

  const html = await lsvpRequest('/portfolio/');

  const $ = cheerio.load(html);
  info('page is loaded');

  const companyNodes = $('.portfolio-list li a');
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
        ...(await loadCompanyFromUrl(href.replace('https://lsvp.com', ''))),
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
  const html = await lsvpRequest(pageUrl);
  const $ = cheerio.load(html);

  const name = $('.portfolio-content h2').text() || null;
  const url = $('.portfolio-content a.cta').attr('href') || null;

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
