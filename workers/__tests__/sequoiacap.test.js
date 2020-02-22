const sequoiacap_com = require('../sequoiacap_com');

jest.setTimeout(120000);

describe('sequoiacap', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await sequoiacap_com.loadCompaniesList();

    expect(objsArray).toHaveLength(530);
    expect(objsArray[0]).toEqual({
      company: '100 Thieves',
      url: 'https://www.100thieves.com/',
      source: 'sequoiacap.com',
    });
  });

  test('loadUrlFromPartialPage', async () => {
    const url = await sequoiacap_com.loadUrlFromPartialPage(
      '/companies/admob/partial.html',
    );
    expect(url).toBe('http://www.admob.com');
  });

  test('loadUrlFromPartialPage: empty link', async () => {
    const url = await sequoiacap_com.loadUrlFromPartialPage(
      '/companies/aspect-development/partial.html',
    );
    expect(url).toBeNull();
  });
});
