const fs = require('fs').promises;
const { join } = require('path');

const a16z = require('./workers/a16z_com');
const accel = require('./workers/accel_com');
const foundersfund = require('./workers/foundersfund_com');
const greylock = require('./workers/greylock_com');
const indiehackers = require('./workers/indiehackers_com');
const kleinerperkins = require('./workers/kleinerperkins_com');
const lightspeed = require('./workers/lightspeed_com');
const nea = require('./workers/nea_com');
const sequoiacap = require('./workers/sequoiacap_com');
const usv = require('./workers/usv_com');
const ycombinator = require('./workers/ycombinator_com');
const cssdesignawargs = require('./workers/cssdesignawargs_com');

async function executeLoader(loader, filename) {
  const data = await loader.loadCompaniesList();
  await fs.writeFile(
    join(__dirname, 'example_out', `${filename}.json`),
    JSON.stringify(data, null, 2),
  );
}

async function example() {
  let loaders = [
    executeLoader(a16z, 'a16z'),
    executeLoader(accel, 'accel'),
    executeLoader(foundersfund, 'foundersfund'),
    executeLoader(greylock, 'greylock'),
    executeLoader(indiehackers, 'indiehackers'),
    executeLoader(kleinerperkins, 'kleinerperkins'),
    executeLoader(lightspeed, 'lightspeed'),
    executeLoader(nea, 'nea'),
    executeLoader(sequoiacap, 'sequoiacap'),
    executeLoader(usv, 'usv'),
    executeLoader(ycombinator, 'ycombinator'),
    executeLoader(cssdesignawargs, 'cssdesignawargs'),
  ];

  loaders = loaders.map((promise) => promise.catch(console.error));
  await Promise.all(loaders);
}

example().catch(console.error);
