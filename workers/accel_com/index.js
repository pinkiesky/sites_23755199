const request = require('request-promise-native');
const cheerio = require('cheerio');

const WORKER_NAME = 'accel.com';

const warn = (...args) => console.warn(WORKER_NAME, ':', ...args);
const info = (...args) => console.info(WORKER_NAME, ':', ...args);

async function accelRequest(url, opts) {
  return request(url, {
    baseUrl: 'https://www.accel.com/',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:73.0) Gecko/20100101 Firefox/73.0',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    method: 'GET',
    ...opts,
  });
}

async function loadCompaniesList() {
  info('started');

  const html = await accelRequest('companies/all');

  const $ = cheerio.load(html);

  info('page is loaded');

  const companyNodes = $(
    '.company-list .company-item',
  );
  if (!companyNodes || !companyNodes.length) {
    warn('company nodes is null');
    return [];
  }

  const companies = companyNodes.map((i, node) => {
    try {
      let name = $('h3', node).text() || null;
      let url = $('a', node).attr('href') || null;

      return {
        company: name ? name.trim() : name,
        url,
        source: WORKER_NAME,
      };
    } catch (e) {
      warn(`cannot load company with index ${i}`, e);
    }
  });

  const resolved = Array.from(companies);
  info('ended');
  return resolved.filter((c) => !!c);
}

module.exports = {
  loadCompaniesList,
  name: WORKER_NAME,
};
