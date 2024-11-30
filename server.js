
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
// const bodyparser = require('bodyparser');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/lists');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/lists', listRoutes);

app.get("/warm-up", (req, res) => {
  res.json({msg: "You are hitting the warm-up route"});
})

// MongoDB Connection

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
