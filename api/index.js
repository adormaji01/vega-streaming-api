const express = require('express');
const cors = require('cors');
const app = express();

// vega-providers প্যাকেজ রিকোয়ার করা
const vega = require('vega-providers');

app.use(cors());

app.get('/', (req, res) => {
  res.send('Vega Streaming API with vega-providers is Running!');
});

// রিয়েল মুভির নাম অনুযায়ী vega-providers থেকে স্ট্রিম খোঁজার রাউট
app.get('/api/stream', async (req, res) => {
  const { title, year, provider } = req.query;
  
  if (!title) {
    return res.status(400).json({ success: false, error: 'Movie title is required' });
  }

  try {
    const selectedProvider = provider || 'vegamovies';
    console.log(`Searching on ${selectedProvider} for: ${title} (${year})`);

    // vega-providers ব্যবহার করে সার্চ করা
    let streams = [];
    
    try {
      // vega-providers এর সাধারণত search এবং sources ফাংশন থাকে
      const searchResults = await vega.search(selectedProvider, title);
      
      if (searchResults && searchResults.length > 0) {
        // প্রথম মুভি বা রেজাল্ট থেকে স্ট্রিম সোর্স ফেচ করা
        const mediaId = searchResults[0].id || searchResults[0].url;
        const fetchedStreams = await vega.getStream(selectedProvider, mediaId);
        
        if (fetchedStreams && fetchedStreams.length > 0) {
          streams = fetchedStreams;
        }
      }
    } catch (scrapeErr) {
      console.error("Scraping Error:", scrapeErr.message);
    }

    // যদি vega-providers থেকে লিংক পাওয়া যায়
    if (streams.length > 0) {
      res.json({
        success: true,
        provider: selectedProvider,
        streams: streams
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'No streams found from this provider. Try another provider.' 
      });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
