const request = require('request-promise-native');
const cheerio = require('cheerio');
const Queue = require('promise-queue');

const requestQueue = new Queue(35, Infinity);

const COMPANY_NAME = 'sequoiacap.com';

const warn = (...args) => console.warn(COMPANY_NAME, ':', ...args);
const info = (...args) => console.info(COMPANY_NAME, ':', ...args);

async function sequoiacapRequest(url, opts) {
  return requestQueue.add(() =>
    request(url, {
      baseUrl: 'https://www.sequoiacap.com/',
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

async function loadCompaniesList() {
  const html = await sequoiacapRequest('companies');

  const $ = cheerio.load(html);

  const companyNodes = $('.js-company-li ._company');
  if (!companyNodes || !companyNodes.length) {
    warn('company nodes is null');
    return [];
  }

  const companiesPromises = companyNodes.map(async (i, node) => {
    try {
      const nameNodes = $('._name', node);
      const name = nameNodes.text() || null;

      const partialLink = node.attribs['data-partial'];
      const partialHtml = await sequoiacapRequest(partialLink);

      const partial$ = cheerio.load(partialHtml);
      const linkNodes = partial$('.company-holder a.social-link:first-child');
      const url = linkNodes.attr('href') || null;

      info('load company', i, name);
      return {
        company: name,
        url,
        source: COMPANY_NAME,
      };
    } catch (e) {
      warn(`cannot load company with index ${i}`, e);
    }
  });

  const resolved = await Promise.all(Array.from(companiesPromises));
  return resolved.filter((c) => !!c);
}

async function loadUrlFromPartialPage(partialLink) {
  const partialHtml = await sequoiacapRequest(partialLink);

  const partial$ = cheerio.load(partialHtml);
  const linkNodes = partial$('.company-holder a.social-link:first-child');
  return linkNodes.attr('href') || null;
}

module.exports = {
  loadUrlFromPartialPage,
  loadCompaniesList,
};
