const fs = require('fs').promises;
const { join } = require('path');

const usv_com = require('./workers/usv_com');
const greylock_com = require('./workers/greylock_com');

async function example() {
  const usvData = await usv_com.loadCompaniesList();
  await fs.writeFile(
    join(__dirname, 'example_out', 'usv.json'),
    JSON.stringify(usvData, null, 2),
  );

  const glData = await greylock_com.loadCompaniesList();
  await fs.writeFile(
    join(__dirname, 'example_out', 'greylock.json'),
    JSON.stringify(glData, null, 2),
  );
}

example().catch(console.error);
