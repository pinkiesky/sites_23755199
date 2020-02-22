const usv_com = require('../usv_com');

jest.setTimeout(5000);

describe('usv', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await usv_com.loadCompaniesList();

    expect(objsArray).toHaveLength(124);

    expect(objsArray[0]).toEqual({
      company: 'Leap',
      url: 'http://leap.energy',
      source: 'usv.com',
    });

    expect(objsArray[21]).toEqual({
      company: 'Autonomous Partners',
      url: null,
      source: 'usv.com',
    });

    expect(objsArray[objsArray.length - 1]).toEqual({
      company: 'Tacoda',
      url: 'http://tacoda.com',
      source: 'usv.com',
    });
  });
});
