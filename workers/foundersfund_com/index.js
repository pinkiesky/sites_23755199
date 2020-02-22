const request = require('request-promise-native');
const cheerio = require('cheerio');

const COMPANY_NAME = 'foundersfund.com';

const warn = (...args) => console.warn(COMPANY_NAME, ':', ...args);

async function ffRequest(url, opts) {
  return request(url, {
    baseUrl: 'https://foundersfund.com/',
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
  const json = await ffRequest('wp-json/wp/v2/company?per_page=100');
  const rawCompanies = JSON.parse(json);
  if (!rawCompanies || !rawCompanies.length) {
    warn('empty company array');
    return [];
  }

  // no need paging right now, because of only 51 companies in DB
  if (rawCompanies.length >= 100) {
    warn('current page overflow');
  }

  const companies = rawCompanies.map((rawCompany) => {
    try {
      let url = null;
      try {
        const $ = cheerio.load(rawCompany.profiles);
        url = $('a:first-child').attr('href');
      } catch (e) {
        warn(`cannot load link for company ${i}`, e);
      }

      return {
        company: (rawCompany.title && rawCompany.title.rendered) || null,
        url,
        source: COMPANY_NAME,
      };
    } catch (e) {
      warn(`cannot load company with index ${i}`, e);
    }
  });

  return companies.filter((c) => !!c);
}

module.exports = {
  loadCompaniesList,
};
