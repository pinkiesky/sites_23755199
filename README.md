### Run
`npm run example`


### About scrapers
Every scraper is module in `workers` folder.
For start scraping, you should import module and run `loadCompaniesList()` function. Every function return `Promise<Object[]>`.

If some page is broken, scraper creates a warning message to standard output.


Ex.:
```
const usv_com = require('./workers/usv_com');

const data = await usv_com.loadCompaniesList();
cosnole.log(data);
```
