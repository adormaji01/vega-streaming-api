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

// রিয়েল মুভির নাম অনুযায়ী স্ট্রিম খোঁজার রাউট
app.get('/api/stream', async (req, res) => {
  const { title, year, provider } = req.query;
  
  if (!title) {
    return res.status(400).json({ success: false, error: 'Movie title is required' });
  }

  try {
    console.log(`Searching for movie: ${title} (${year}) on provider: ${provider}`);

    // এখানে vega-providers বা থার্ড-পার্টি স্ক্র্যাপিং লজিক কাজ করবে।
    // ইউজারের সিলেক্ট করা মুভির নাম দিয়ে ডায়নামিক রেসপন্স তৈরি করা হচ্ছে:
    
    res.json({
      success: true,
      movie: title,
      year: year || '',
      provider: provider || 'VegaMovies',
      streams: [
        {
          quality: '1080p',
          // মুভির নাম অনুযায়ী লাইভ বা ডায়নামিক স্ট্রিম হ্যান্ডেল করার জন্য প্রস্তুত
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' 
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
