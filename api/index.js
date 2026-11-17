const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const TMDB_BASE = 'https://api.themoviedb.org/3';
// Vercel-এ TMDB_API_KEY ভেরিয়েবল দিলে সেটাই ব্যবহার হবে, না দিলে নিচের key কাজ করবে
const TMDB_API_KEY = process.env.TMDB_API_KEY || '70c8fdc8c1c720034bcf2e0a5d1700da';

// প্রক্সি করার অনুমতিপ্রাপ্ত হোস্ট (ওপেন প্রক্সি যাতে কেউ অপব্যবহার না করে)
// নতুন সোর্স যোগ করলে এখানে তার ডোমেইন যোগ করুন, অথবা Vercel-এ ALLOWED_HOSTS দিন (কমা দিয়ে আলাদা)
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || 'test-streams.mux.dev')
  .split(',')
  .map(h => h.trim().toLowerCase())
  .filter(Boolean);

function isAllowed(u) {
  try {
    const url = new URL(u);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    return ALLOWED_HOSTS.some(h => host === h || host.endsWith('.' + h));
  } catch (e) {
    return false;
  }
}

app.get('/', (req, res) => {
  res.send('Vega Streaming API is Running Successfully!');
});

// ---------- TMDB (API key লুকানো থাকবে) ----------
async function tmdb(path, params, res) {
  if (!TMDB_API_KEY) {
    return res.status(500).json({ success: false, error: 'TMDB_API_KEY is not set on server' });
  }
  try {
    const qs = new URLSearchParams({ api_key: TMDB_API_KEY, ...params });
    const r = await fetch(`${TMDB_BASE}${path}?${qs}`);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

app.get('/api/tmdb/trending', (req, res) => tmdb('/trending/movie/week', {}, res));

app.get('/api/tmdb/search', (req, res) => {
  const q = (req.query.query || '').toString().trim();
  if (!q) return res.status(400).json({ success: false, error: 'query is required' });
  tmdb('/search/movie', { query: q }, res);
});

// ---------- Stream ----------
app.get('/api/stream', async (req, res) => {
  const { title, year, provider } = req.query;

  if (!title) {
    return res.status(400).json({ success: false, error: 'Movie title is required' });
  }

  try {
    console.log(`Fetching stream for: ${title} (${year}) via ${provider || 'VegaMovies'}`);

    // টেস্ট স্ট্রিম। আসল সোর্স পেলে এখানে বসান (headers লাগলে stream-এ headers: { Referer: '...' } দিন)
    const fallbackStream = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

    res.json({
      success: true,
      movie: title,
      year: year || '',
      provider: provider || 'VegaMovies',
      streams: [{ quality: '1080p', url: fallbackStream }]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------- Proxy (m3u8 + সেগমেন্ট) ----------
app.get('/api/proxy', async (req, res) => {
  const target = (req.query.url || '').toString();
  const referer = (req.query.referer || '').toString();

  if (!isAllowed(target)) {
    return res.status(403).json({ success: false, error: 'Host not allowed' });
  }

  try {
    const headers = { 'User-Agent': 'Mozilla/5.0' };
    if (referer) headers.Referer = referer;
    if (req.headers.range) headers.Range = req.headers.range;

    const upstream = await fetch(target, { headers });
    const ctype = upstream.headers.get('content-type') || '';
    const isPlaylist = /mpegurl/i.test(ctype) || /\.m3u8(\?|$)/i.test(target);

    res.status(upstream.status);

    if (isPlaylist) {
      const text = await upstream.text();
      const base = new URL(target);
      const self = '/api/proxy?referer=' + encodeURIComponent(referer) + '&url=';
      const rewritten = text
        .split('\n')
        .map(line => {
          const l = line.trim();
          if (!l) return line;
          if (l.startsWith('#')) {
            // #EXT-X-KEY / #EXT-X-MAP এর URI="..." প্রক্সি করা
            return line.replace(/URI="([^"]+)"/g, (m, uri) =>
              `URI="${self}${encodeURIComponent(new URL(uri, base).href)}"`);
          }
          return self + encodeURIComponent(new URL(l, base).href);
        })
        .join('\n');
      res.set('Content-Type', 'application/vnd.apple.mpegurl');
      return res.send(rewritten);
    }

    if (ctype) res.set('Content-Type', ctype);
    const cr = upstream.headers.get('content-range');
    if (cr) res.set('Content-Range', cr);
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.send(buf);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = app;
