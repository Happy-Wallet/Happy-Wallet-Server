// Load environment variables from .env
require('dotenv').config();

// Import mysql2 library
const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Debug logging
console.log("Connecting to MySQL with:");
console.log("DB user:", process.env.DB_USER);
console.log("DB password:", process.env.DB_PASSWORD ? "✅ set" : "❌ missing");

// Export promise-based pool for async/await use
module.exports = pool.promise();
