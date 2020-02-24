const indiehackers_com = require('../indiehackers_com');

jest.setTimeout(120000);

describe('indiehackers', () => {
  test('loadCompaniesList', async () => {
    const objsArray = await indiehackers_com.loadCompaniesList();

    expect(objsArray).toHaveLength(6647);
    expect(objsArray).toContainEqual({
      company: 'MoxyScript',
      url: 'http://www.moxyscript.com/',
      source: 'indiehackers.com',
    });

    expect(objsArray).toContainEqual({
      company: 'Pennypult II',
      url: 'https://apptivus.net/pennypult2',
      source: 'indiehackers.com',
    });
  });

  test('loadCompaniesByCategory', async () => {
    const objsArray = await indiehackers_com.loadCompaniesByCategory([
      'vertical-ai',
      '-vertical-travel',
    ]);

    expect(objsArray).toHaveLength(421);
    expect(objsArray).toContainEqual({
      company: 'MoxyScript',
      url: 'http://www.moxyscript.com/',
      source: 'indiehackers.com',
    });
  });

  describe.each([
    ...indiehackers_com.AVAILABLE_CATEGORIES,
    indiehackers_com.COMPANIES_WITHOUT_ANY_CATEGORY,
  ])('%s', (category) => {
    const searchPromise = indiehackers_com.searchInIndex(category, 0, 10);

    it('not be empty', async () => {
      const { hits } = await searchPromise;
      expect(hits).not.toHaveLength(0);
    });

    it('count must not be more than 1000', async () => {
      const { nbHits } = await searchPromise;
      expect(nbHits).toBeLessThan(1000);
    });
  });
});
