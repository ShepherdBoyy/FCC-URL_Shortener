require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const urlParser = require('url');
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

let urlDatabase = []
let idCounter = 1

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// POST to /api/shorturl to shorten a URL
app.post('/api/shorturl', function(req, res) {
  let originalUrl = req.body.url;

  // Regular expression to validate the URL format
  const urlRegex = /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/;

  // If URL does not match the regex, return error
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  const urlObj = urlParser.parse(originalUrl);

  // Check if the hostname is valid using dns.lookup
  dns.lookup(urlObj.hostname, (err, address) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Store the URL and assign a unique short_url
    let shortUrl = idCounter++;
    urlDatabase.push({ original_url: originalUrl, short_url: shortUrl });

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);

  // Find the original URL
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);

  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
