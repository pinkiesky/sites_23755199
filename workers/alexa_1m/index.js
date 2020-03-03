const request = require('request');
const unzipper = require('unzipper');
const { Transform } = require('stream');
const csvParse = require('csv-parse');

const WORKER_NAME = 'alexa 1m';

const warn = (...args) => console.warn(WORKER_NAME, ':', ...args);
const info = (...args) => console.info(WORKER_NAME, ':', ...args);

function alexaRequest(url, opts) {
  return request(url, {
    baseUrl: 'https://s3.amazonaws.com/alexa-static/',
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

async function loadCompaniesList(limit = 10000) {
  return new Promise((resolve, reject) => {
    info('started');

    const reqStream = alexaRequest('top-1m.csv.zip');

    reqStream.on('error', (err) => {
      reject(err);
    });

    reqStream.on('response', (response) => {
      const { statusCode } = response;
      if (!statusCode || Math.floor(statusCode / 100) !== 2) {
        return reject(
          new Error(
            `cannot load remote archive from '${url}': error code: ${statusCode}`,
          ),
        );
      }

      const unzipperStream = unzipper.ParseOne();
      unzipperStream.on('error', (err) => {
        if (result.length >= limit) {
          resolveResult();
          return;
        }

        reject(err);
      });

      const result = [];
      let resolved = false;
      const resolveResult = () => {
        if (resolved) {
          return;
        }

        info('ended with', result.length, 'items');
        resolve(result);
        resolved = true;
      };  

      const loader = response
        .pipe(unzipperStream)
        .pipe(csvParse())
        .pipe(
          new Transform({
            objectMode: true,
            transform(chunk, enc, cb) {
              if (result.length >= limit) {
                cb(null, null);
                reqStream.abort();

                resolveResult();
                return;
              }

              result.push({
                url: `https://${chunk[1]}/`,
                company: null,
                source: WORKER_NAME,
              });
              cb();
            },
          }),
        );

      loader.on('error', (err) => {
        if (result.length >= limit) {
          return;
        }

        reject(err);
      });

      loader.on('end', resolveResult);
    });

    reqStream.end();
  });
}

module.exports = {
  loadCompaniesList,
  WORKER_NAME,
};
