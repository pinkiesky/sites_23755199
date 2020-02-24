const a16z_com = require('../a16z_com');

jest.setTimeout(5000);

describe('a16z', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await a16z_com.loadCompaniesList();

    expect(objsArray).toHaveLength(253);

    expect(objsArray[0]).toEqual({
      company: 'http://www.apptio.com',
      url: 'http://www.apptio.com',
      source: 'a16z.com',
    });

    expect(objsArray).toContainEqual({
      company: 'https://www.koboldmetals.com',
      url: 'https://www.koboldmetals.com',
      source: 'a16z.com',
    });

    expect(objsArray[objsArray.length - 1]).toEqual({
      company: 'http://www.flyzipline.com',
      url: 'http://www.flyzipline.com',
      source: 'a16z.com',
    });
  });
});
