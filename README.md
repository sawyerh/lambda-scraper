# What?

Lambda Scraper is an [AWS Lambda](https://aws.amazon.com/lambda/) function that: Scrapes any number of web pages you define, searching for new links on the page, and (optionally) filters the results by keyword. If it finds results, it sends an email to you via [AWS SES](https://aws.amazon.com/ses/). 

The initial use case was as a Careers page scraper for my 👫, cause it's hard out there for fashion students, and a lot of Careers pages offer no way of being notified of new postings. I'm not sure what else you might use this for, but if you come up with something good, [let me know](https://twitter.com/sawyerh).

![](https://dl.dropboxusercontent.com/u/74524/nodelete/lambda-scraper.png)

# Install

Experience working with AWS will be super handy if you want to set this up for yourself. If my instructions are unclear and you'd like to get this setup, ping me and I _might_ put together a video walkthrough if you pressure me enough.

1. Download this repo and create a `config.js` file (see `config.example.js` as an example of the initial format of this file). Go ahead and set the `email_to` (your email here), `email_subject`, and AWS API key and secret. You'll set the other values in the next steps.
1. Create an S3 bucket, then enter the bucket name in `config.js` from step 1.
1. Create and [verify an SES sending email or domain](http://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-addresses-and-domains.html), then enter the sending email address (`email_from`) in `config.js`. Set the `aws_region` in your `config.js` to the region you used for your SES email.
1. Define the pages and their selectors in `page.js` (See below)
1. Locally, run `npm install`
1. Zip your project folder and upload to Lambda (See below)

## HTML pages

As an example, if the HTML you're trying to scrape from a page (ie. `https://example.com/listing`) looks like below:

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

In `pages.js`, you'd enter:

```js
{
  url: "https://example.com/listing", // required
  keywords: ["sales", "marketing", "fashion", "jewlery"], // optional
  parent: ".posting", // required
  selectors: {
    title: "h1", // required
    url: ".more", // required
    location: ".location" // optional key/value (title/selector)
  }
}
```

## JSON pages

For JSON endpoints, use `$` as the top-level object within the `parent` array

For example, given a JSON endpoint (ie. `https://example.com/listing.json`) with a response of:

```json
{
  "postings": [{
    "title": "Hello world",
    "link": "http://example.com",
    "location": { "title": "NYC" }
  }]
}
```

In `pages.js` you'd enter:

```js
{
  url: "https://example.com/listing.json",
  json: true, // required for JSON
  keywords: ["sales", "marketing", "fashion", "jewlery"],
  parent: "postings",
  selectors: {
    title: "$.title",
    url: "$.link",
    center: "$.location.title"
  }
}
```

# Deploy

**Create the zip package**

You can zip the package as you normally would, or you can run the `zip` npm script: 

```
$ npm install
$ npm run zip
```

(You can ignore the `.env` file this creates in your root directory)

**Create the Lambda function**

1. Start with the "canary" blueprint
1. Create a CloudWatch event and set the rate (ie. `20 2 * * ? *` to run once a day at 2:20 UTC)

Lambda settings:

- Runtime: Node.js 4.3
- Handler: `index.handler`
- Memory: 128mb should be enough
- Timeout: 2 minutes should be plenty (Mine hasn't gone beyond 15 seconds)

# Debugging

In `index.js`, set `var debug` to `true`.

In your termainal, you can then run the below (from the root of the project) to see what results are found for the pages you've defined:

```
$ node
 > require('./index').handler()
 Found results for...
```
