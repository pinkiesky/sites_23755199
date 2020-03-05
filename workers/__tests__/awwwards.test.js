const awwwards_com = require('../awwwards_com');

jest.setTimeout(640000);

describe('awwwards', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await awwwards_com.loadCompaniesList(1000);

    console.log(objsArray.length);
    expect(objsArray).toContainEqual({
      company: 'kern inc.',
      url: 'https://kern.inc',
      source: 'awwwards.com',
    });

    expect(objsArray).toContainEqual({
      company: 'Resn\'s Little Helper',
      url: 'http://littlehelper.resn.global',
      source: 'awwwards.com',
    });

    expect(objsArray).toContainEqual({
      company: 'MARINI 1897',
      url: 'http://www.marinimarmi.com/en/',
      source: 'awwwards.com',
    });
  });

  test('loadCompanyFromPage', async () => {
    const {
      companies,
      nextPageUrl,
    } = await awwwards_com.loadCompaniesListFromPage(
      '/websites/sites_of_the_day/?page=80',
    );

    expect(nextPageUrl).toBe('/websites/sites_of_the_day/?page=81');
    expect(companies).toHaveLength(32);

    expect(companies).toContainEqual({
      company: 'NASA: Prospect',
      url: 'http://nasaprospect.com',
      source: 'awwwards.com',
    });
  });

  test('loadCompanyFromPage last', async () => {
    const {
      companies,
      nextPageUrl,
    } = await awwwards_com.loadCompaniesListFromPage(
      '/websites/sites_of_the_day/?page=121',
    );

    expect(nextPageUrl).toBeFalsy();
    expect(companies).toHaveLength(31);

    expect(companies).toContainEqual({
      company: 'Helveticons',
      url: 'http://www.helveticons.ch',
      source: 'awwwards.com',
    });
  });
});
