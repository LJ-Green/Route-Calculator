const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001; // Choose a different port from your React app

// Use the cors middleware
app.use(cors());

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'route_data',
  password: '090701Lj',
  port: 5432,
});

// Middleware
app.use(bodyParser.json());

app.post('/', async (req, res) => { 
  let client; // Declare a variable to hold the client

  try {
    const { startNode, chosenNode, weight, shortestPathArray, calculationTime } = req.body;

    // Acquire a client from the connection pool
    client = await pool.connect();

    // Update PostgreSQL table
    await client.query(
      'INSERT INTO route_data (start_node, chosen_node, weight, checkpoints, calculation_time) VALUES ($1, $2, $3, $4, $5)',
      [startNode, chosenNode, weight, shortestPathArray, calculationTime]
    );

    res.status(200).json({ message: 'Data updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (client) {
      client.release(); // Release the client back to the pool
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});