const foundersfund_com = require('../foundersfund_com');

jest.setTimeout(5000);

describe('foundersfund', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await foundersfund_com.loadCompaniesList();

    expect(objsArray).toHaveLength(51);

    expect(objsArray[0]).toEqual({
      company: 'Airbnb',
      url: 'https://www.airbnb.com/',
      source: 'foundersfund.com',
    });

    expect(objsArray).toContainEqual({
      company: 'Built Robotics',
      url: 'https://www.builtrobotics.com',
      source: 'foundersfund.com',
    });

    expect(objsArray).toContainEqual({
      company: 'Spotify',
      url: 'https://www.spotify.com/',
      source: 'foundersfund.com',
    });
  });
});
