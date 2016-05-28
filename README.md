# Install

1. Create an S3 bucket and verify an SES sending domain
1. Set the config variables in `config.js` (see `config.example.js`)
1. Define the pages and their selectors in `page.js`

## HTML pages

```html
<ul>
  <li class="posting">
    <h1>Hello world</h1>
    <a class="more" href="http://example.com">Read more</a>
    <span class="location">NYC</span>
  </li>

  <li class="posting">
    <h1>Hello world</h1>
    <a class="more" href="http://example.com">Read more</a>
    <span class="location">NYC</span>
  </li>
</ul>
```

In `pages.js`:

```json
{
  "url": "https://example.com/listing",
  "keywords": ["sales", "marketing", "fashion", "jewlery"],
  "parent": ".posting",
  "selectors": {
    "title": "h1",
    "url": ".more",
    "location": ".location"
  }
}
```

## JSON pages

Use `$` as the top-level object within the `parent` array

```json
{
  "postings": [{
    "title": "Hello world",
    "link": "http://example.com",
    "location": { "title": "NYC" }
  }]
}
```

In `pages.js`:

```json
{
  "url": "https://example.com/listing.json",
  "json": true,
  "keywords": ["sales", "marketing", "fashion", "jewlery"],
  "parent": "postings",
  "selectors": {
    "title": "$.title",
    "url": "$.link",
    "center": "$.location.title"
  }
}
```

# Deploy


**Create the zip package**

```
$ npm install
$ npm run zip
```

(You can ignore the `.env` file this creates in your root directory)

**Create the Lambda function**

- Start with the "canary" blueprint
- Create a CloudWatch event and set the rate to 1 day, or use a cron expression (ie. `20 2 * * ? *` to run once a day at 2:20 UTC)
- Runtime: Node.js 4.3
- Handler: `index.handler`
- Memory: 128mb should be enough
- Timeout: 2 minutes should be plenty (Mine hasn't gone beyond 15 seconds)