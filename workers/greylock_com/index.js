const request = require('request-promise-native');
const cheerio = require('cheerio');
const Queue = require('promise-queue');

const requestQueue = new Queue(10, Infinity);

const WORKER_NAME = 'greylock.com';

const warn = (...args) => console.warn(WORKER_NAME, ':', ...args);
const info = (...args) => console.info(WORKER_NAME, ':', ...args);

async function greylockRequest(url, opts, extraHeaders) {
  return requestQueue.add(() =>
    request(url, {
      baseUrl: 'https://www.greylock.com/',
      headers: {
        Origin: 'https://www.greylock.com',
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

  const html = await greylockRequest('greylock-companies/');

  const $ = cheerio.load(html);

  const companyNodes = $(
    '.container_current .citem.type-segment, .container_past .citem.type-segment',
  );
  if (!companyNodes || !companyNodes.length) {
    warn('company nodes is null');
    return [];
  }

  const companiesPromises = companyNodes.map(async (i, node) => {
    try {
      const nameNodes = $('h5', node);
      const name = nameNodes.text() || null;

      let url = null;
      try {
        const ref = $('a.testit', node).attr('ref');
        if (!ref) {
          throw new Error(`Empty ref for ${name}`);
        }

        url = (await loadUrlFromRef(ref)) || null;
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

  const resolved = await Promise.all(Array.from(companiesPromises));
  info('ended');
  return resolved.filter((c) => !!c);
}

async function loadUrlFromRef(ref) {
  const partialHtml = await greylockRequest(
    '/wp-admin/admin-ajax.php',
    {
      method: 'POST',
      body: `action=swd&sn=cpt&fn=company&fl=${encodeURIComponent(ref)}`,
    },
    {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Referer: 'https://www.greylock.com/greylock-companies/',
    },
  );

  const partial$ = cheerio.load(partialHtml);
  info('load partial page', ref);
  const linkNodes = partial$('a.right.link:first-child');
  return linkNodes.attr('href') || null;
}

module.exports = {
  loadUrlFromRef,
  loadCompaniesList,
  name: WORKER_NAME,
};
