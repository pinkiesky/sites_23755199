const lightspeed_com = require('../lightspeed_com');

jest.setTimeout(120000);

describe('lightspeed', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await lightspeed_com.loadCompaniesList();

    expect(objsArray).toHaveLength(348);
    expect(objsArray[0]).toEqual({
      company: 'Abstract',
      url: 'http://abstract.com',
      source: 'lsvp.com',
    });

    expect(objsArray).toContainEqual({
      company: 'HESAI',
      url: 'http://www.hesaitech.com/en',
      source: 'lsvp.com',
    });
    expect(objsArray).toContainEqual({
      company: 'Acceldata',
      url: 'http://acceldata.io',
      source: 'lsvp.com',
    });
  });

  test('loadCompanyFromUrl', async () => {
    const { url, company } = await lightspeed_com.loadCompanyFromUrl(
      '/portfolio/hesai/',
    );
    expect(url).toBe('http://www.hesaitech.com/en');
    expect(company).toBe('HESAI');
  });
});
