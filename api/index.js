const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(cors());

// Root route
app.get('/', (req, res) => {
  res.send('Vega Streaming API is Running Successfully!');
});

// Stream fetching route
app.get('/api/stream', async (req, res) => {
  const { title, year, provider } = req.query;
  
  if (!title) return res.status(400).json({ success: false, error: 'Movie title is required' });

  try {
    // Working test HLS stream that will play immediately in your Artplayer
    res.json({
      success: true,
      provider: provider || 'VegaMovies',
      streams: [
        {
          quality: '1080p',
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          headers: { Referer: 'https://google.com/' }
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Proxy route
app.get('/api/proxy', async (req, res) => {
  const { url, referer } = req.query;
  if (!url) return res.status(400).send('URL required');

  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        ...(referer && { 'Referer': referer })
      }
    });
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/vnd.apple.mpegurl');
    response.data.pipe(res);
  } catch (err) {
    res.status(500).send('Proxy Stream Error');
  }
});

module.exports = app;
