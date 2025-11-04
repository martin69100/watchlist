require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sql } = require('@vercel/postgres');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// GET all data needed for initial app load
app.get('/api/data', async (req, res) => {
  try {
    const [anime, ratings, watchlists, users] = await Promise.all([
      sql`SELECT * FROM anime;`,
      sql`SELECT * FROM ratings;`,
      sql`SELECT * FROM watchlists;`,
      sql`SELECT id, username, is_admin FROM users;`,
    ]);
    res.json({
      anime: anime.rows.map(a => ({...a, tags: a.tags ? a.tags.split(',') : []})),
      ratings: ratings.rows,
      watchlists: watchlists.rows,
      users: users.rows.map(u => ({...u, isAdmin: u.is_admin})),
    });
  } catch (error) {
    console.error('Failed to fetch data:', error);
    res.status(500).json({ message: 'Failed to fetch data' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await sql`SELECT * FROM users WHERE username = ${username} AND password = ${password};`;
    const user = rows[0];
    if (user) {
      res.json({ id: user.id, username: user.username, isAdmin: user.is_admin });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (username.toLowerCase() === 'admin') {
      return res.status(400).json({ message: 'Username is unavailable' });
  }
  try {
    const { rows: existingUsers } = await sql`SELECT * FROM users WHERE username = ${username};`;
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username is unavailable' });
    }
    
    const userId = `user-${uuidv4()}`;
    const { rows } = await sql`
      INSERT INTO users (id, username, password, is_admin)
      VALUES (${userId}, ${username}, ${password}, false)
      RETURNING id, username, is_admin;
    `;
    const newUser = rows[0];
    res.status(201).json({ id: newUser.id, username: newUser.username, isAdmin: newUser.is_admin });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/anime (Admin only)
app.post('/api/anime', async (req, res) => {
  const { title, description, imageUrl, tags } = req.body;
  try {
    const animeId = `anime-${uuidv4()}`;
    const { rows } = await sql`
      INSERT INTO anime (id, title, description, image_url, tags)
      VALUES (${animeId}, ${title}, ${description}, ${imageUrl}, ${tags.join(',')})
      RETURNING *;
    `;
    const newAnime = rows[0];
    res.status(201).json({...newAnime, tags: newAnime.tags.split(',')});
  } catch (error) {
    console.error('Failed to add anime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/ratings
app.post('/api/ratings', async (req, res) => {
  const { userId, animeId, score } = req.body;
  try {
    await sql`
      INSERT INTO ratings (user_id, anime_id, score)
      VALUES (${userId}, ${animeId}, ${score})
      ON CONFLICT (user_id, anime_id)
      DO UPDATE SET score = EXCLUDED.score;
    `;
    res.json({ userId, animeId, score });
  } catch (error) {
    console.error('Failed to update rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/watchlists
app.post('/api/watchlists', async (req, res) => {
    const { userId, animeId, status } = req.body;
    try {
        if (status === 0) { // WatchStatus.None -> Delete
            await sql`DELETE FROM watchlists WHERE user_id = ${userId} AND anime_id = ${animeId};`;
        } else {
            await sql`
                INSERT INTO watchlists (user_id, anime_id, status)
                VALUES (${userId}, ${animeId}, ${status})
                ON CONFLICT (user_id, anime_id)
                DO UPDATE SET status = EXCLUDED.status;
            `;
        }
        res.json({ userId, animeId, status });
    } catch (error) {
        console.error('Failed to update watchlist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = app;