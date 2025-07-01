const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>API Test - Documentation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f8f8f8;
            padding: 20px;
            line-height: 1.6;
          }
          h1 {
            color: #2c3e50;
          }
          h2 {
            color: #2980b9;
            margin-top: 30px;
          }
          pre {
            background: #ecf0f1;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
          }
          .method {
            font-weight: bold;
            color: #27ae60;
          }
          .endpoint {
            font-family: monospace;
            color: #e74c3c;
          }
        </style>
      </head>
      <body>
        <h1>📘 Happy Wallet - Test API Documentation</h1>

        <h2>🔐 Auth</h2>
        <p><span class="method">POST</span> <span class="endpoint">/auth/register</span></p>
        <pre>{
  "email": "test@example.com",
  "username": "tester",
  "password": "123456"
}</pre>

        <p><span class="method">POST</span> <span class="endpoint">/auth/login</span></p>
        <pre>{
  "email": "test@example.com",
  "password": "123456"
}</pre>

        <p><span class="method">POST</span> <span class="endpoint">/auth/forgot-password</span></p>
        <pre>{
  "email": "test@example.com"
}</pre>

        <p><span class="method">POST</span> <span class="endpoint">/auth/reset-password</span></p>
        <pre>{
  "token": "jwt_token_here",
  "newPassword": "newpass123"
}</pre>

        <h2>🎨 Icons</h2>
        <p><span class="method">GET</span> <span class="endpoint">/icons</span></p>

        <p><span class="method">POST</span> <span class="endpoint">/icons</span></p>
        <pre>{
  "color_id": "blue"
}</pre>

        <p><span class="method">PUT</span> <span class="endpoint">/icons/:id</span></p>
        <pre>{
  "color_id": "green"
}</pre>

        <p><span class="method">DELETE</span> <span class="endpoint">/icons/:id</span></p>

        <h2>👤 Users</h2>
        <p><span class="method">GET</span> <span class="endpoint">/users</span></p>
        <p><span class="method">POST</span> <span class="endpoint">/users</span></p>
        <pre>{
  "email": "testuser@example.com",
  "username": "testuser",
  "password": "1234",
  "date_of_birth": "2009-09-20"
}</pre>

        <pre>{
    "email": "tonydarkness@gmail.com",
    "username": "Tonydarkness",
    "password": "844852duy",
    "date_of_birth": "2004-08-01"
}</pre>
        <h2>📂 Categories</h2>
        <p><span class="method">GET</span> <span class="endpoint">/categories</span></p>
        <p><span class="method">POST</span> <span class="endpoint">/categories</span></p>
        <pre>{
    "user_id" : 1,
    "name" : "Ăn uống",
    "type" : "expense",
    "icon_res" : "123",
    "color_res" : "21",
    "is_default" : true
}</pre>

<pre>{
    "user_id" : 2,
    "name" : "Mua sắm",
    "type" : "expense",
    "icon_res" : "231",
    "color_res" : "211",
    "is_default" : true
}</pre>

<pre>{
    "user_id" : 2,
    "name" : "Giải trí",
    "type" : "expense",
    "icon_res" : "222",
    "color_res" : "156",
    "is_default" : true
}</pre>

<pre>{
    "user_id" : 2,
    "name" : "Lương",
    "type" : "income",
    "icon_res" : "250",
    "color_res" : "623",
    "is_default" : true
}</pre>

        <h2>💸 Transactions</h2>
        <p><span class="method">GET</span> <span class="endpoint">/transactions</span></p>
        <p><span class="method">POST</span> <span class="endpoint">/transactions</span></p>
        <pre>{
  "user_id": 1,
  "category_id": 1,
  "amount": 150000,
  "description": "Ăn trưa",
  "date": "2025-06-29 10:30:00",
  "type" : "expense"
}</pre>

<pre>{
  "user_id" : 3,
  "category_id" : 1,
  "amount" : 150000,
  "date" : "2025-07-01",
  "type" : "expense"
}</pre>

<pre>{
  "user_id" : 3,
  "category_id" : 4,
  "amount" : 200000,
  "description": "Lương",
  "date" : "2025-07-01",
  "type" : "income"
}</pre>

        <h2>🎯 Saving Goals</h2>
        <p><span class="method">GET</span> <span class="endpoint">/saving_goals</span></p>
        <p><span class="method">POST</span> <span class="endpoint">/saving_goals</span></p>
        <pre>{
  "user_id" : 2,
  "category_id" : 4,
  "name" : "Tiền mua nhà",
  "description": "Nhịn uống trà sữa để mua nhà!",
  "current_amount" : 20000,
  "target_amount" : 1000000000,
  "target_date" : "2027-01-01"
}</pre>

        <h2>👥 Funds</h2>
        <p><span class="method">GET</span> <span class="endpoint">/funds</span></p>
        <p><span class="method">POST</span> <span class="endpoint">/funds</span></p>
        <pre>{
  "category_id" : 4,
  "name" : "Quỹ đi Đà Lạt",
  "description": "Đi Đà Lạt thôi nào mọi người!",
  "current_amount" : 20000,
  "has_target" : true,
  "target_amount" : 1000000000
}</pre>

      </body>
    </html>
  `);
});

module.exports = router;
