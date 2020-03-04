const cssdesignawargs_com = require('../cssdesignawargs_com');

jest.setTimeout(50000);

describe('cssdesignawards', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await cssdesignawargs_com.loadCompaniesList();

    expect(objsArray).toHaveLength(1000);
    expect(objsArray).toContainEqual({
      company: 'Remington & Vernick Engineers',
      url: 'https://rve.com/',
      source: 'cssdesignawards.com',
    });
    expect(objsArray).toContainEqual({
      company: 'Alday',
      url: 'http://alday.co/',
      source: 'cssdesignawards.com',
    });
  });

  test('loadCompaniesListFromPage', async () => {
    const objsArray = await cssdesignawargs_com.loadCompaniesListFromPage(148);

    expect(objsArray).toHaveLength(18);
    expect(objsArray).toContainEqual({
      company: 'PITCH',
      url: 'http://pitch.ru/en/',
      source: 'cssdesignawards.com',
    });
    expect(objsArray).toContainEqual({
      company: 'Yoshihara Woodworking .Ltd',
      url: 'http://yoshiharawoodworks.com/',
      source: 'cssdesignawards.com',
    });
  });
});
