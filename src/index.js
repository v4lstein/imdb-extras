const express = require("express");
const request = require("request");
const cheerio = require("cheerio");

const app = express();
const port = process.env.PORT || 3000;

app.get("/:id/trailer", (req, res) => {
  const id = req.params.id;
  const url = `http://www.imdb.com/title/${id}`;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  request(url, (error, response, html) => {
    if (error) return res.status(500).send({ error: "Something went wrong" });

    const $ = cheerio.load(html);

    const trailerElement = $(".slate_button.prevent-ad-overlay.video-modal");
    if (trailerElement.children().length) {
      const trailerID = trailerElement.first().attr()["data-video"];
      return res.send({
        id,
        trailerID,
        embed: `https://www.imdb.com/videoembed/${trailerID}`
      });
    }

    res.status(404).send({ error: "No trailer available" });
  });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
