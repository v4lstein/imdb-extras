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
    return res.status(500).send({ error: "Something went wrong" });
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
    return res.status(500).send({ error: "Something went wrong" });
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

app.get("/:id/photos", async (req, res) => {
  const id = req.params.id;
  const url = `http://www.imdb.com/title/${id}/mediaindex`;
  let limit = parseInt(req.query.limit);
  // Ensure that the limit param is an int
  if (isNaN(limit)) {
    limit = 48;
  }

  let photoElements;
  try {
    photoElements = await scrape(url, "#media_index_thumbnail_grid img");
  } catch (e) {
    return res.status(500).send({ error: "Something went wrong" });
  }

  if (photoElements.error) {
    return res.status(404).send({ error: "No photos available" });
  }

  const photos = [];

  for (let i = 0; i < photoElements.length && i < limit; i++) {
    const photoAttribs = photoElements[i].attribs;
    photos.push({
      photoLocation: photoAttribs.src,
      photoAlt: photoAttribs.alt
    });
  }

  return res.send({
    id,
    photos
  });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
