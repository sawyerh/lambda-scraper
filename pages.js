module.exports = [
  {
    "url": "https://www.etsy.com/careers",
    "keywords": ["sales", "interior", "engagement", "jewlery", "marketing", "designer"],
    "parent": ".all-positions .category li",
    "selectors": {
      "title": "a",
      "url": "a"
    }
  },
  {
    "url": "https://twitter.com/sawyerh",
    "keywords": [],
    "parent": ".tweet",
    "selectors": {
      "title": ".tweet-text",
      "url": ".js-permalink",
      "name": ".fullname"
    }
  }
];