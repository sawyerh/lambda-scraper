var arrayContains = require('../utilities/array-contains');

/**
 * Find the parent(s) in the HTML and parse each one
 * @param {object} page - Info on the selectors we want to scrape on this page
 * @param {string} body - Request's response JSON
 * @param {array} savedState - URL's we've already scraped
 * @return {array} Items (which are objects) found for this particular request
 */
var parseJSON = function(page, body, savedState) {
  var results = [];
  body = JSON.parse(body);

  if (!body[page.parent]) {
    return [{
      page: page.url,
      error: "Couldn't find element(s) to scrape"
    }];
  }

  body[page.parent].forEach(entry => {
    var result = parseJSONEntry(page, entry, savedState);
    if (result) results.push(result);
  });

  return results;
};

/**
 * Parse a parent using the selectors we pass through
 * @param {object} page - Info on the selectors (object paths) we want to scrape
 * @param {object} entry - Array item from JSON
 * @param {array} savedState - URL's we've already scraped
 * @return {object} The scraped info from this entry. Returns null if this entry was
                    already scraped or if it doesn't match the keywords we passed through
 */
var parseJSONEntry = function(page, entry, savedState) {
  var keys = Object.getOwnPropertyNames(page.selectors);

  var result = {
    page: page.url,
    url: eval(page.selectors.url),
    title: eval(page.selectors.title)
  };

  if (arrayContains(savedState, result.url)) return;

  // If we specify keywords, only return the result
  // when the title contains one of the keywords
  if (page.keywords && page.keywords.length) {
    var rx = new RegExp(page.keywords.join('|'), 'ig');
    if (result.title.search(rx) < 0) return;
  }

  keys = keys.filter(key => (key !== "url" && key !== "title"));
  keys.forEach(key => {
    try {
      result[key] = eval(page.selectors[key]);
    } catch (e) {}
  });

  return result;
};

module.exports = parseJSON;
