const ycombinator_com = require('../ycombinator_com');

jest.setTimeout(10000);

describe('ycombinator', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await ycombinator_com.loadCompaniesList();

    expect(objsArray).toHaveLength(2047);

    expect(objsArray[0]).toEqual({
      company: 'Parakey',
      url: 'http://parakey.com',
      source: 'ycombinator.com',
    });

    expect(objsArray[objsArray.length - 1]).toEqual({
      company: 'Shift Health',
      url: 'https://www.shifthealth.io',
      source: 'ycombinator.com',
    });
  });
});
