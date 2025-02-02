const express = require('express');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const multer = require('multer');
const path = require('path');

dotenv.config();
const app = express();

app.use(express.json());
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
const db = require('./config/db');

app.get('/', (req, res) => {
  res.send('Welcome to the Backend API!');
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SHOW TABLES');
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // Save files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Use the original file name and extension
    const extension = file.originalname.split('.').pop();
    cb(null, `${Date.now()}-${file.originalname}.${extension}`);
  },
});

const upload = multer({ storage });

// Use this middleware in your routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files statically
