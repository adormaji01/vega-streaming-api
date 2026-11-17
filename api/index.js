const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
  res.send('Vega Streaming API is Running Successfully!');
});

app.get('/api/stream', async (req, res) => {
  const { title, year, provider } = req.query;
  
  if (!title) {
    return res.status(400).json({ success: false, error: 'Movie title is required' });
  }

  try {
    console.log(`Fetching stream for: ${title} (${year}) via ${provider || 'VegaMovies'}`);

    // নিরাপদ ও নিশ্চিত স্ট্রিম লিংক, যা এরর ছাড়াই সাথে সাথে প্লে হবে
    // আপনি চাইলে এখানে আপনার পছন্দমতো অন্য কোনো রিয়েল স্ট্রিম বা ট্রেলার লিংকও বসাতে পারেন।
    const fallbackStream = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

    res.json({
      success: true,
      movie: title,
      year: year || '',
      provider: provider || 'VegaMovies',
      streams: [
        {
          quality: '1080p',
          url: fallbackStream
        }
      ]
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
