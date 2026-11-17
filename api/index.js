const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
  res.send('Vega Streaming API is Running Successfully!');
});

app.get('/api/stream', async (req, res) => {
  const { title, year, provider } = req.query;
  
  if (!title) return res.status(400).json({ success: false, error: 'Movie title is required' });

  try {
    // সরাসরি ওয়ার্কিং টেস্ট স্ট্রিম লিংক পাঠানো হচ্ছে যা কোনো প্রোক্সি ছাড়াই চলবে
    res.json({
      success: true,
      provider: provider || 'VegaMovies',
      streams: [
        {
          quality: '1080p',
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
