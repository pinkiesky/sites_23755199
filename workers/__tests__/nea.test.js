const nea_com = require('../nea_com');

jest.setTimeout(120000);

describe('nea', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await nea_com.loadCompaniesList();

    expect(objsArray).toHaveLength(745);
    expect(objsArray[0]).toEqual({
      company: 'Box',
      url: 'https://www.box.com',
      source: 'nea.com',
    });

    expect(objsArray).toContainEqual({
      company: 'Trevena',
      url: 'http://www.trevenainc.com',
      source: 'nea.com',
    });
  });

  test('loadCompanyFromUrl', async () => {
    const { url, company } = await nea_com.loadCompanyFromUrl(
      '/portfolio/mojo-vision',
    );
    expect(url).toBe('https://mojo.vision/');
    expect(company).toBe('Mojo Vision');
  });
});
