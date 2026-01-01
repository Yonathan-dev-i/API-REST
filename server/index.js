import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());

const NEWS_API_KEY = process.env.NEWS_API_KEY;
if (!NEWS_API_KEY) {
  console.warn('Warning: NEWS_API_KEY not set. /api/news endpoints will return 400.');
}

app.get('/api/news/top-headlines', async (req, res) => {
  if (!NEWS_API_KEY) return res.status(400).json({ error: 'NEWS_API_KEY not configured on server' });
  const { category = 'general', country = 'us' } = req.query;
  const url = `https://newsapi.org/v2/top-headlines?category=${encodeURIComponent(category)}&country=${encodeURIComponent(country)}`;
  try {
    const r = await fetch(url, { headers: { 'X-Api-Key': NEWS_API_KEY } });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.get('/api/news/search', async (req, res) => {
  if (!NEWS_API_KEY) return res.status(400).json({ error: 'NEWS_API_KEY not configured on server' });
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'q query param required' });
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}`;
  try {
    const r = await fetch(url, { headers: { 'X-Api-Key': NEWS_API_KEY } });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// TMDB proxy endpoints
const TMDB_API_KEY = process.env.TMDB_API_KEY;
if (!TMDB_API_KEY) {
  console.warn('Warning: TMDB_API_KEY not set. /api/movies endpoints will return 400.');
}

app.get('/api/movies/popular', async (req, res) => {
  if (!TMDB_API_KEY) return res.status(400).json({ error: 'TMDB_API_KEY not configured on server' });
  const { page = 1 } = req.query;
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&page=${encodeURIComponent(page)}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

app.get('/api/movies/search', async (req, res) => {
  if (!TMDB_API_KEY) return res.status(400).json({ error: 'TMDB_API_KEY not configured on server' });
  const { q, page = 1 } = req.query;
  if (!q) return res.status(400).json({ error: 'q query param required' });
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&page=${encodeURIComponent(page)}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  if (!TMDB_API_KEY) return res.status(400).json({ error: 'TMDB_API_KEY not configured on server' });
  const { id } = req.params;
  const url = `https://api.themoviedb.org/3/movie/${encodeURIComponent(id)}?api_key=${TMDB_API_KEY}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// Genres and movies by genre
app.get('/api/movies/genres', async (req, res) => {
  if (!TMDB_API_KEY) return res.status(400).json({ error: 'TMDB_API_KEY not configured on server' });
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

app.get('/api/movies/genre/:id', async (req, res) => {
  if (!TMDB_API_KEY) return res.status(400).json({ error: 'TMDB_API_KEY not configured on server' });
  const { id } = req.params;
  const { page = 1 } = req.query;
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${encodeURIComponent(id)}&page=${encodeURIComponent(page)}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies by genre' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`News proxy listening on port ${PORT}`);
});
