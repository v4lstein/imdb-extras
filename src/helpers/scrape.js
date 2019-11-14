const request = require("request");
const cheerio = require("cheerio");

const scrape = (url, elementSelector) => {
  return new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      if (error) return reject("An error occurred while scraping");

      const $ = cheerio.load(html);

      const element = $(elementSelector);

      if (!element.attr()) {
        element.error = true;
      }
      return resolve(element);
    });
  });
};

module.exports = scrape;
