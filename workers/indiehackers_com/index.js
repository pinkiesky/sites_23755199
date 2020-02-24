const algoliasearch = require('algoliasearch');
const Queue = require('promise-queue');

const requestQueue = new Queue(7, Infinity);

const COMPANY_NAME = 'indiehackers.com';

// Limit of non-admin API is 1000 results per category. We may reduce rows count via params (tag Filters)
// Sounds like a hack, but it's working!
const AVAILABLE_CATEGORIES = [
  'vertical-advertising',
  'vertical-ai',
  'vertical-analytics',
  'vertical-apis',
  'vertical-art',
  'vertical-books',
  'vertical-bots',
  'vertical-calendar',
  'vertical-clothing',
  'vertical-communication',
  ['vertical-community', '-revenue-model-subscription'],
  ['vertical-community', 'revenue-model-subscription'],
  'vertical-content',
  'vertical-cryptocurrency',
  'vertical-design',
  'vertical-e-commerce',
  'vertical-education',
  'vertical-email-marketing',
  'vertical-events',
  'vertical-fashion',
  'vertical-finance',
  'vertical-food-drinks',
  'vertical-games',
  'vertical-growth',
  'vertical-hardware',
  'vertical-health-fitness',
  'vertical-home-automation',
  'vertical-investing',
  'vertical-jobs-hiring',
  'vertical-kids',
  'vertical-legal',
  'vertical-mailing-lists',
  ['vertical-marketing', 'revenue-model-subscription'],
  ['vertical-marketing', '-revenue-model-subscription'],
  'vertical-marketplaces',
  'vertical-medical',
  'vertical-movies-video',
  'vertical-music-audio',
  'vertical-news-magazines',
  'vertical-open-source',
  'vertical-outdoors',
  'vertical-payments',
  'vertical-photography',
  'vertical-podcasting',
  'vertical-politics',
  [
    'vertical-productivity',
    '-revenue-model-free',
    '-revenue-model-subscription',
  ],
  ['vertical-productivity', 'revenue-model-free', 'revenue-model-subscription'],
  'vertical-programming',
  'vertical-sales',
  'vertical-shopping',
  'vertical-social-media',
  'vertical-sports',
  'vertical-task-management',
  'vertical-transportation',
  'vertical-travel',
  ['vertical-utilities', 'revenue-model-subscription'],
  ['vertical-utilities', '-revenue-model-subscription'],
  'vertical-wearables',
  'vertical-weather',
  'vertical-wordpress',
  'vertical-writing',
];

const COMPANIES_WITHOUT_ANY_CATEGORY = AVAILABLE_CATEGORIES.map((c) => `-${c}`);

const warn = (...args) => console.warn(COMPANY_NAME, ':', ...args);

const client = algoliasearch('N86T1R3OWZ', '5140dac5e87f47346abbda1a34ee70c3');
const prodIndex = client.initIndex('products');

async function searchInIndex(category, page, hitsPerPage = 400) {
  return requestQueue.add(() =>
    prodIndex.search('', {
      hitsPerPage,
      page,
      attributesToRetrieve: ['name', 'websiteUrl'],
      tagFilters: category,
      facets: [],
    }),
  );
}

async function loadCompaniesByCategory(category) {
  let page = 0;
  const companies = [];
  while (true) {
    const { hits } = await searchInIndex(category, page);
    if (!hits || !hits.length) {
      break;
    }

    page++;

    hits.forEach((hit) => {
      companies.push({
        company: hit.name,
        url: hit.websiteUrl,
        source: COMPANY_NAME,
      });
    });
  }

  return companies.filter((c) => !!c);
}

async function loadCompaniesList() {
  const companiesByUrl = {};

  const loadPromises = [
    ...AVAILABLE_CATEGORIES,
    COMPANIES_WITHOUT_ANY_CATEGORY,
  ].map(async (category) => {
    const companies = await loadCompaniesByCategory(category);
    companies.forEach((company) => {
      companiesByUrl[company.url + company.company] = company;
    });
  });
  // loadCompaniesWithoutCategory
  await Promise.all(loadPromises);

  return Object.values(companiesByUrl).filter((c) => !!c);
}

module.exports = {
  loadCompaniesList,
  loadCompaniesByCategory,
  AVAILABLE_CATEGORIES,
  COMPANIES_WITHOUT_ANY_CATEGORY,
  searchInIndex,
};
