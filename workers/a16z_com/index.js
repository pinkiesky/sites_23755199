const request = require('request-promise-native');
const cheerio = require('cheerio');

const COMPANY_NAME = 'a16z.com';

const warn = (...args) => console.warn(COMPANY_NAME, ':', ...args);

async function a16zRequest(url, opts) {
  return request(url, {
    baseUrl: 'https://a16z.com/',
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
  const html = await a16zRequest('portfolio/');

  const $ = cheerio.load(html);

  const companyNodes = $(
    '.company a',
  );
  if (!companyNodes || !companyNodes.length) {
    warn('company nodes is null');
    return [];
  }

  const companies = companyNodes.map((i, node) => {
    try {
      const url = node.attribs.href;

      return {
        company: url,
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
