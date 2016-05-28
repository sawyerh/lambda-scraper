var arrayContains = require('../utilities/array-contains')
  , cheerio = require('cheerio');

/**
 * Find the parent(s) in the HTML and parse each one
 * @param {object} page - Info on the selectors we want to scrape on this page
 * @param {string} html - Request's response HTML
 * @param {array} savedState - URL's we've already scraped
 * @return {array} Items (which are objects) found for this particular request
 */
var parseHTML = function(page, html, savedState) {
  var $ = cheerio.load(html);
  var $parents = $(page.parent);
  var results = [];

  if(!$parents.length) {
    return [{
      page: page.url,
      error: "Couldn't find element(s) to scrape"
    }];
  }

  $parents.each((i, elem) => {
    var result = parseHTMLParent(page, elem, $, savedState);

    if(result)
      results.push(result);
  });

  return results;
};

/**
 * Parse a parent using the selectors we pass through
 * @param {object} page - Info on the selectors we want to scrape on this page
 * @param {string} elem - Parent's HTML
 * @param {function} $ - Cheerio
 * @param {array} savedState - URL's we've already scraped
 * @return {object} The scraped info from this parent. Returns null if this parent was
                    already scraped or if it doesn't match the keywords we passed through
 */
var parseHTMLParent = function(page, elem, $, savedState) {
  var $parent = $(elem)
    , keys = Object.getOwnPropertyNames(page.selectors);

  var result = {
    "page":  page.url,
    "url":   $parent.find(page.selectors.url).attr('href'),
    "title": $parent.find(page.selectors.title).text().trim()
  };

  if(arrayContains(savedState, result.url)) return;

  // If we specify keywords, only return the result
  // when the title contains one of the keywords
  if(page.keywords && page.keywords.length){
    var rx = new RegExp(page.keywords.join('|'), 'ig');
    if(result.title.search(rx) < 0) return;
  }

  keys = keys.filter((key) => (key !== "url" && key !== "title") );
  keys.forEach((key) => {
    var selector = page.selectors[key];
    var val = $parent.find(selector).text().trim();
    result[key] = val;
  });

  return result;
};

module.exports = parseHTML;