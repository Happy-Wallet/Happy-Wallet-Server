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
  "email": "new@example.com",
  "username": "newuser",
  "role": "user"
}</pre>

        <h2>📂 Categories</h2>
        <p><span class="method">GET</span> <span class="endpoint">/categories</span></p>
        <p><span class="method">POST</span> <span class="endpoint">/categories</span></p>
        <pre>{
  "user_id": 1,
  "icon_id": 2,
  "name": "Một category",
  "is_default": 0
}</pre>

        <h2>💸 Transactions</h2>
        <p><span class="method">GET</span> <span class="endpoint">/transactions</span></p>
        <p><span class="method">POST</span> <span class="endpoint">/transactions</span></p>
        <pre>{
  "user_id": 1,
  "category_id": 6,
  "icon_id": 3,
  "amount": 150.75,
  "description": "Mua cà phê",
  "date": "2025-06-29 10:30:00"
}</pre>

        <h2>🎯 Saving Goals</h2>
        <p><span class="method">GET</span> <span class="endpoint">/saving_goals</span></p>
        <p><span class="method">POST</span> <span class="endpoint">/saving_goals</span></p>
        <pre>{
  "user_id": 1,
  "icon_id": 2,
  "name": "Mua laptop",
  "current_amount": 3000000,
  "target_amount": 20000000
}</pre>

        <h2>👥 Funds</h2>
        <p><span class="method">GET</span> <span class="endpoint">/funds</span></p>
        <p><span class="method">POST</span> <span class="endpoint">/funds</span></p>
        <pre>{
  "name": "Quỹ nhóm",
  "amount": 100000,
  "members": ["user1", "user2"],
  "description": "Du lịch Đà Lạt"
}</pre>

      </body>
    </html>
  `);
});

module.exports = router;
