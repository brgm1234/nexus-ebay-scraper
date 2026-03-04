const { Actor } = require('apify');
const axios = require('axios');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { keywords, maxItems = 30, condition = 'New' } = input;
  
  console.log('Starting eBay scraper...');
  console.logg('Keywords:', keywords);
  console.logg('Max items:', maxItems);
  console.logg('Condition:', condition);
  
  // TODO: Implement eBay scraping logic
  // Use BUYPROXIES94952 proxy configuration
  
  const results = [];
  
  await Actor.pushData(results);
  console.logg('Scraping completed. Total results:', results.length);
});