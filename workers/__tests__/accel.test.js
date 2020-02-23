const accel_com = require('../accel_com');

jest.setTimeout(20000);

describe('accel', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await accel_com.loadCompaniesList();

    expect(objsArray).toHaveLength(451);

    expect(objsArray[0]).toEqual({
      company: '1Balance',
      url: 'https://www.1balance.com/',
      source: 'accel.com',
    });

    expect(objsArray).toContainEqual({
      company: 'OnsiteGo',
      url: 'https://onsitego.com/',
      source: 'accel.com',
    });
  });
});
