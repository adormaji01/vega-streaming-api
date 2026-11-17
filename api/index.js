const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
  res.send('Vega Streaming API is Running Successfully!');
});

// রিয়েল মুভির নাম অনুযায়ী স্ট্রিম বা ভিডিও খোঁজার রাউট
app.get('/api/stream', async (req, res) => {
  const { title, year, provider } = req.query;
  
  if (!title) {
    return res.status(400).json({ success: false, error: 'Movie title is required' });
  }

  try {
    console.log(`Processing stream for: ${title} (${year}) via ${provider}`);

    // এখানে আমরা মুভির নাম অনুযায়ী একটি সুন্দর পাবলিক ভিডিও বা ট্রেলার লিংক সেট করতে পারি
    // যাতে টেস্ট ভিডিওর বদলে মুভির নাম অনুযায়ী প্লেব্যাক রেসপন্স যায়:
    let streamUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'; // ডিফল্ট ফলব্যাক

    // আপনি চাইলে এখানে মুভির নাম চেক করে আলাদা ভিডিও দিতে পারেন, 
    // অথবা vega-providers এর মূল স্ক্র্যাপিং লجিক এখানে যুক্ত করতে পারেন।

    res.json({
      success: true,
      movie: title,
      year: year || '',
      provider: provider || 'VegaMovies',
      streams: [
        {
          quality: '1080p',
          url: streamUrl
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
