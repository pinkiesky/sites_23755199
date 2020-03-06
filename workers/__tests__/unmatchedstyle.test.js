const unmatchedstyle_com = require('../unmatchedstyle_com');

jest.setTimeout(120000);

describe.skip('unmatchedstyle', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await unmatchedstyle_com.loadCompaniesList(100);
    expect(objsArray).toHaveLength(100);

    expect(list).toContainEqual({
      company: 'HAWRAF',
      url: 'http://www.hawraf.com/',
      source: 'unmatchedstyle.com'
    });
  });

  test('loadUrlFromPartialPage', async () => {
    const url = await unmatchedstyle_com.loadUrlFromPartialPage(
      '/gallery/morethan20-com.php',
    );
    expect(url).toBe('http://www.morethan20.com');
  });

  test('loadCompaniesListByPage', async () => {
    const list = await unmatchedstyle_com.loadCompaniesListByPage(
      '1',
    );

    expect(list).toHaveLength(33);
    expect(list).toContainEqual({
      company: 'HAWRAF',
      url: 'http://www.hawraf.com/',
      source: 'unmatchedstyle.com'
    });
  });
});
