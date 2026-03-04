const { Actor } = require('apify');
const axios = require('axios');
const cheerio = require('cheerio');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { keywords, maxItems = 30, condition = 'New' } = input;
  
  console.log('Starting eBay scraper...');
  console.log('Keywords:', keywords);
  console.log('Max items:', maxItems);
  console.log('Condition:', condition);
  
  const results = [];
  const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL']
  });
  
  const conditionMap = {
    'New': 1000,
    'Used': 3000,
    'Open Box': 1500,
    'Certified Refurbished': 2000,
    'Seller Refurbished': 2500
  };
  
  for (const keyword of keywords) {
    if (results.length >= maxItems) break;
    
    try {
      const conditionParam = conditionMap[condition] ? `&LH_ItemCondition=${conditionMap[condition]}` : '';
      const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(keyword)}${conditionParam}&_sop=12`;
      
      const response = await axios.get(searchUrl, {
        proxy: proxyConfiguration.createProxyUrl(),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      const $ = cheerio.load(response.data);
      const items = $('.s-item');
      
      items.each((i, el) => {
        if (results.length >= maxItems) return false;
        if (i === 0) return; // Skip the first item as it's usually a header
        
        const title = $(el).find('.s-item__title').text().trim() || '';
        if (title.includes('Shop on eBay')) return; // Skip ads
        
        const price = $(el).find('.s-item__price').text().trim() || '';
        const condition = $(el).find('.s-item__subtitle').text().trim() || '';
        const bids = $(el).find('.s-item__bids').text().trim() || '';
        const timeLeft = $(el).find('.s-item__time-left').text().trim() || '';
        const imageUrl = $(el).find('.s-item__image img').attr('src') || '';
        const itemUrl = $(el).find('.s-item__link').attr('href') || '';
        const shipping = $(el).find('.s-item__shipping').text().trim() || '';
        const seller = $(el).find('.s-item__seller-info-text').text().trim() || '';
        
        results.push({
          title,
          price,
          condition,
          bids,
          timeLeft,
          imageUrl,
          itemUrl,
          shipping,
          seller,
          keyword
        });
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error scraping keyword "${keyword}":`, error.message);
    }
  }
  
  await Actor.pushData(results);
  console.log('Scraping completed. Total results:', results.length);
});