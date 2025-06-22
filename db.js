// db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Tonydarkness',
  database: 'financialtrackingapp',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool.promise();
