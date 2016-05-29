var async = require('async');
var aws = require('aws-sdk');
var config = require('./config');
var request = require('request');
var pages = require('./pages');
var parseHTML = require('./parsers/html');
var parseJSON = require('./parsers/json');

var debug = false;
var savedState;
var awsConfig = new aws.Config({
  accessKeyId: config.aws_key,
  secretAccessKey: config.aws_secret,
  region: config.aws_region
});
var s3 = new aws.S3(awsConfig);

exports.handler = function() {
  var params = {
    Bucket: config.aws_bucket,
    Key: config.filename
  };

  s3.getObject(params, function(err, data) {
    if (err) console.log(err.code, config.filename);
    savedState = (err && err.code === "NoSuchKey") ? [] : JSON.parse(data.Body);
    var results = [];

    async.eachSeries(pages, (page, cb) => {
      request(page.url, (error, response, body) => {
        var pageResults = page.json ? parseJSON(page, body, savedState) : parseHTML(page, body, savedState);

        if (debug)
          console.log(`Found results for ${page.url}`, pageResults);

        results = results.concat(pageResults);
        cb();
      });
    }, () => {
      if (results.length) {
        sendResults(results);
      } else {
        console.log("No matching results");
      }

      updateState(results);
    });
  });
};

/**
 * Email the found results through SES to the email specified in the config
 * @param {array} results - The new results we've found
 */
var sendResults = function(results) {
  if (debug) return;

  var ses = new aws.SES(awsConfig);

  var params = {
    Destination: {
      ToAddresses: [config.email_to]
    },
    Message: {
      Body: {
        Html: {
          Data: getResultsEmailHTML(results)
        },
        Text: {
          Data: JSON.stringify(results)
        }
      },
      Subject: {
        Data: config.email_subject
      }
    },
    Source: config.email_from
  };

  ses.sendEmail(params, function(err) {
    if (err) console.log(err, err.stack);
    else console.log(`Emailed ${results.length} results`);
  });
};

/**
 * Creates the email HTML for the given results
 * @param {array} results - The new results we've found
 * @return {string} The email's HTML
 */
var getResultsEmailHTML = function(results) {
  return results.map(result => {
    return Object.getOwnPropertyNames(result).map(key => {
      return `<strong>${key}</strong>: ${result[key]}`;
    }).join('<br />');
  }).join('<br /><br />');
};

/**
 * Update S3 state file with the new URL's scraped
 * @param {array} results - The new results we've found
 */
var updateState = function(results) {
  if (!results.length || debug) return;
  var pendingState = results
                      .map(r => r.url)
                      .filter(url => !!url);

  s3.putObject({
    Bucket: config.aws_bucket,
    Key: config.filename,
    Body: JSON.stringify(savedState.concat(pendingState))
  }, function(err) {
    if (err) console.log(err, err.stack);
    else console.log(`Added ${pendingState.length} items to saved state`);
  });
};
