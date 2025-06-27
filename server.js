// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

<<<<<<< Updated upstream
app.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/users', async (req, res) => {
  const { email, username, role } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO users (email, username, role, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [email, username, role]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
=======
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const transactionRoutes = require('./routes/transaction');
const savingGoalRoutes = require('./routes/savingGoal');
const fundRoutes = require('./routes/fund');

// Mount routes
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/transactions', transactionRoutes);
app.use('/saving_goals', savingGoalRoutes);
app.use('/funds', fundRoutes);
>>>>>>> Stashed changes

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
