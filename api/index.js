const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
  res.send('Vega Streaming API is Running Successfully!');
});

// রিয়েল মুভির নাম অনুযায়ী স্ট্রিম খোঁজার রাউট
app.get('/api/stream', async (req, res) => {
  const { title, year, provider } = req.query;
  
  if (!title) return res.status(400).json({ success: false, error: 'Movie title is required' });

  try {
    // এখানে আপনি চাইলে vega-providers এর স্ক্র্যাপিং কোড যুক্ত করতে পারেন।
    // বর্তমানে এটি ডায়নামিকভাবে ইউজারের সিলেক্ট করা মুভির নাম কনসোল বা প্রসেস করবে:
    console.log(`Searching stream for: ${title} (${year}) on ${provider}`);

    // ডেমো হিসেবে রিয়েল মুভির নামের সাথে মিল রেখে একটিভ স্ট্রিম বা ফলব্যাক লিংক পাঠানো হচ্ছে
    // আপনি চাইলে এখানে vega-providers এর ফাংশন কল করে আসল লিংক বসাতে পারেন।
    res.json({
      success: true,
      provider: provider || 'VegaMovies',
      streams: [
        {
          quality: '1080p',
          // মুভি অনুযায়ী ডায়নামিক লিংক বা টেস্ট স্ট্রিম
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' 
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
