const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper functions to read/write from/to the JSON database
const readDB = () => {
  const dbData = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(dbData);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// API Routes

// GET all data needed for initial app load
app.get('/api/data', (req, res) => {
  const db = readDB();
  res.json({
    anime: db.anime,
    ratings: db.ratings,
    watchlists: db.watchlists,
    users: db.users.map(({ password, ...user }) => user), // Exclude passwords
  });
});

// POST /api/login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username && u.password === password);
  
  if (user) {
    const { password, ...userToReturn } = user;
    res.json(userToReturn);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// POST /api/register
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();

  if (username.toLowerCase() === 'admin' || db.users.some(u => u.username === username)) {
    return res.status(400).json({ message: 'Username is unavailable' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    username,
    password,
    isAdmin: false,
  };

  db.users.push(newUser);
  writeDB(db);

  const { password: _, ...userToReturn } = newUser;
  res.status(201).json(userToReturn);
});

// POST /api/anime (Admin only)
app.post('/api/anime', (req, res) => {
  const { title, description, imageUrl, tags } = req.body;
  const db = readDB();
  
  const newAnime = {
    id: `anime-${Date.now()}`,
    title,
    description,
    imageUrl,
    tags,
  };

  db.anime.push(newAnime);
  writeDB(db);

  res.status(201).json(newAnime);
});

// POST /api/ratings
app.post('/api/ratings', (req, res) => {
  const { userId, animeId, score } = req.body;
  const db = readDB();
  
  let updatedRating;
  const existingRatingIndex = db.ratings.findIndex(r => r.userId === userId && r.animeId === animeId);

  if (existingRatingIndex > -1) {
    db.ratings[existingRatingIndex].score = score;
    updatedRating = db.ratings[existingRatingIndex];
  } else {
    updatedRating = { userId, animeId, score };
    db.ratings.push(updatedRating);
  }

  writeDB(db);
  res.json(updatedRating);
});

// POST /api/watchlists
app.post('/api/watchlists', (req, res) => {
    const { userId, animeId, status } = req.body;
    const db = readDB();
    
    let updatedItem;
    const existingIndex = db.watchlists.findIndex(item => item.userId === userId && item.animeId === animeId);
    
    if (existingIndex > -1) {
        if (status === 0) { // WatchStatus.None
            db.watchlists.splice(existingIndex, 1);
            updatedItem = { userId, animeId, status: 0 }; // Simulate deletion for client
        } else {
            db.watchlists[existingIndex].status = status;
            updatedItem = db.watchlists[existingIndex];
        }
    } else {
        updatedItem = { userId, animeId, status };
        db.watchlists.push(updatedItem);
    }
    
    writeDB(db);
    res.json(updatedItem);
});


// Serve static assets from the React app
app.use(express.static(path.join(__dirname, '..')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});