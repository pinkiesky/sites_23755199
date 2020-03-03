const alexa_1m = require('../alexa_1m');

jest.setTimeout(30000);

describe('alexa', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await alexa_1m.loadCompaniesList();

    expect(objsArray).toHaveLength(10000);
    expect(objsArray[0]).toEqual({
      url: 'https://google.com/',
      company: null,
      source: 'alexa 1m',
    });

    expect(objsArray).toContainEqual({
      url: 'https://taobao.com/',
      company: null,
      source: 'alexa 1m',
    });
  });
});
