const cssmania_com = require('../cssmania_com');

jest.setTimeout(130000);

describe('cssmania', () => {
  test('loadCompaniesList', async () => {
    const companies = await cssmania_com.loadCompaniesList(1000);
    
    expect(companies).toHaveLength(1000);
    expect(companies).toContainEqual({
      company: 'R.Cole',
      url:
        'https://themeforest.net/item/rcole-life-business-coaching-theme/20905291?ref=cssmania',
      source: 'cssmania.com',
    });
    expect(companies).toContainEqual({
      company: 'Typo3 Agentur Ventzke Media',
      url:
        'http://typo3.ventzke-media.de/',
      source: 'cssmania.com',
    });

  });

  xtest('getNumberOfPages', async () => {
    const pages = await cssmania_com.getNumberOfPages();
    expect(pages).toBe(1556);
  });

  xtest('loadCompaniesListFromPage', async () => {
    const companies = await cssmania_com.loadCompaniesListFromPage(
      'http://www.cssmania.com/page/1/',
    );

    expect(companies).toHaveLength(20);
    expect(companies).toContainEqual({
      company: 'R.Cole',
      url:
        'https://themeforest.net/item/rcole-life-business-coaching-theme/20905291?ref=cssmania',
      source: 'cssmania.com',
    });
  });

  xtest('loadCompaniesListFromPage (old)', async () => {
    const companies = await cssmania_com.loadCompaniesListFromPage(
      'http://www.cssmania.com/page/1555/',
    );

    expect(companies).toHaveLength(20);
    expect(companies).toContainEqual({
      company: 'Critical Mass',
      url:
        'http://www.criticalmass.com',
      source: 'cssmania.com',
    });
  });

  xtest('expandBitlyLink', async () => {
    const link = await cssmania_com.expandBitlyLink('http://bit.ly/28J2dbS');
    expect(link).toBe('http://www.albert-holz.de/de');
  });

  xtest('expandBitlyLink warnings', async () => {
    const link = await cssmania_com.expandBitlyLink('http://bit.ly/15rw6qU');
    expect(link).toBe('http://www.benjaminmarc.net/');
  });
});
