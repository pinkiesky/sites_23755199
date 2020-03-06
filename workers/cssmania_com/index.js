const request = require('request-promise-native');
const cheerio = require('cheerio');
const url = require('url');
const http = require('http');
const Queue = require('promise-queue');

const WORKER_NAME = 'cssmania.com';

const warn = (...args) => console.warn(WORKER_NAME, ':', ...args);
const info = (...args) => console.info(WORKER_NAME, ':', ...args);

const requestQueue = new Queue(1, Infinity);
async function cssmaniaRequest(url, opts) {
  return requestQueue.add(() =>
    request(url, {
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

const bitlyRequestQueue = new Queue(10, Infinity);
const bitlyHttpAgent = new http.Agent({ keepAlive: true });
async function bitlyRequest(fullUrl, opts) {
  return bitlyRequestQueue.add(() =>
    request(fullUrl, {
      followAllRedirects: false,
      followRedirect: false,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:73.0) Gecko/20100101 Firefox/73.0',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        Referer: 'http://www.cssmania.com/',
      },
      method: 'GET',
      agent: bitlyHttpAgent,
      pool: bitlyHttpAgent,
      simple: false,
      transform: (body, response) => {
        // Requested Link Warning
        if (response.statusCode === 302) {
          const parsedUrl = url.parse(response.headers.location, true);
          if (!parsedUrl.query.url) {
            throw new Error('Unexpected bitly error');
          }

          return parsedUrl.query.url;
        }

        if (response.statusCode === 301) {
          return response.headers.location;
        }

        throw new Error(`Wrong bitly code: ${response.statusCode}`);
      },
      ...opts,
    }),
  );
}

async function expandBitlyLink(link) {
  const location = await bitlyRequest(link);
  if (!location) {
    throw new Error(`Wrong bitly code: ${response.statusCode}`);
  }

  return location;
}

async function loadCompaniesListFromPage(pageUrl) {
  const html = await cssmaniaRequest(pageUrl);
  const $ = cheerio.load(html);

  const companyNodes = $('#content .item');
  if (!companyNodes || !companyNodes.length) {
    warn('company nodes is null');
    return [];
  }

  const companiesPromises = companyNodes.map(async (i, node) => {
    try {
      const name = $('.title_site', node).text() || null;
      let url = $('a', node).attr('href') || null;

      if (url && url.includes('://bit.ly/')) {
        url = await expandBitlyLink(url.trim());
      }

      return {
        company: name ? name.trim() : name,
        url: url,
        source: WORKER_NAME,
      };
    } catch (e) {
      warn(`cannot load company with index ${i}`, e);
    }
  });

  const resolved = await Promise.all(Array.from(companiesPromises));
  return resolved.filter((c) => !!c);
}

async function loadCompaniesList(limit = 1000) {
  info('started');

  const numberOfPages = await getNumberOfPages();
  if (!numberOfPages) {
    warn('cannot load number of pages');
    return [];
  }

  info('max pages count', numberOfPages);

  const pagePromises = new Array(numberOfPages)
    .fill(1)
    .map((v, i) => v + i)
    .map((page) =>
      loadCompaniesListFromPage(`http://www.cssmania.com/page/${page}/`),
    );

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
  bitlyRequestQueue.queue.length = 0;

  info('ended');
  return companiesResult;
}

async function getNumberOfPages() {
  const html = await cssmaniaRequest('http://www.cssmania.com/');
  const $ = cheerio.load(html);

  const pagesText = $('span.pages').text();
  if (!pagesText) {
    throw new Error('number of pages cannot be loaded');
  }

  const words = pagesText.trim().split(/\s+/);
  const lastWord = words[words.length - 1];
  if (!lastWord) {
    throw new Error('number of pages cannot be loaded (last word not found)');
  }

  const cleared = lastWord.replace(/[^\d]/, '');
  const pages = Number(cleared);
  if (!pages) {
    throw new Error('number of pages cannot be loaded (parse error)');
  }

  return pages;
}

module.exports = {
  getNumberOfPages,
  loadCompaniesList,
  loadCompaniesListFromPage,
  expandBitlyLink,
  name: WORKER_NAME,
};
