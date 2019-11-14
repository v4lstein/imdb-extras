const express = require("express");
const scrape = require("./helpers/scrape");
const app = express();
const port = process.env.PORT || 3000;

// Set response headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  next();
});

app.get("/:id/trailer", async (req, res) => {
  const id = req.params.id;
  const url = `http://www.imdb.com/title/${id}`;

  let trailerElement;

  try {
    trailerElement = await scrape(
      url,
      ".slate_button.prevent-ad-overlay.video-modal"
    );
  } catch (e) {
    return res.status(500).send("Something went wrong");
  }

  if (trailerElement.error) {
    return res.status(404).send({ error: "No trailer available" });
  }

  const trailerID = trailerElement.first().attr()["data-video"];
  return res.send({
    id,
    trailerID,
    embed: `https://www.imdb.com/videoembed/${trailerID}`
  });
});

app.get("/:id/poster", async (req, res) => {
  const id = req.params.id;
  const url = `http://www.imdb.com/title/${id}`;
  let posterElement;

  try {
    posterElement = await scrape(url, ".poster img");
  } catch (e) {
    return res.status(500).send("Something went wrong");
  }

  if (posterElement.error) {
    return res.status(404).send({ error: "No poster available" });
  }
  const elementAttributes = posterElement.first().attr();
  const posterLocation = elementAttributes["src"];
  const posterAlt = elementAttributes["alt"];
  return res.send({
    id,
    posterAlt,
    posterLocation
  });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
