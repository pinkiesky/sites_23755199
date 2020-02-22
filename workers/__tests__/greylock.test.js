const greylock_com = require('../greylock_com');

jest.setTimeout(120000);

describe('greylock', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await greylock_com.loadCompaniesList();

    expect(objsArray).toHaveLength(86);
    expect(objsArray[0]).toEqual({
      company: 'Abnormal Security',
      url: 'https://abnormalsecurity.com',
      source: 'greylock.com',
    });
  });

  test('loadUrlFromRef', async () => {
    const url = await greylock_com.loadUrlFromRef('NTA5Mw==');
    expect(url).toBe('https://www.askspoke.com/');
  });
});
