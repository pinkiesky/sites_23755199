const kleinerperkins_com = require('../kleinerperkins_com');

jest.setTimeout(60000);

describe('kleinerperkins', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await kleinerperkins_com.loadCompaniesList();

    expect(objsArray).toHaveLength(288);

    expect(objsArray).toContainEqual({
      company: 'ArcSight',
      source: 'kleinerperkins.com',
      url: 'http://www.arcsight.com/',
    });
    expect(objsArray).toContainEqual({
      company: 'Twitter',
      source: 'kleinerperkins.com',
      url: 'http://www.twitter.com/',
    });

    expect(objsArray).toContainEqual({
      company: 'Xendit',
      source: 'kleinerperkins.com',
      url: 'https://www.xendit.co/en/',
    });

    expect(objsArray).toContainEqual({
      company: 'Desktop Metal',
      source: 'kleinerperkins.com',
      url: 'https://www.desktopmetal.com/',
    });

    expect(objsArray).toContainEqual({
      company: 'Helix',
      source: 'kleinerperkins.com',
      url: 'https://www.helix.com/',
    });
  });

  test('loadUrlFromPartialPage', async () => {
    const url = await kleinerperkins_com.loadUrlFromPartialPage(
      '/case-studies/figma-design',
    );
    expect(url).toBe('https://www.figma.com/');
  });
});
