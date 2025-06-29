const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send(`
    <h1>Icon API Documentation</h1>

    <h2>1. Get All Icons</h2>
    <p><strong>GET</strong> http://localhost:3000/icons</p>

    <h2>2. Create Icon</h2>
    <p><strong>POST</strong> http://localhost:3000/icons</p>
    <pre>{
  "color_id": "red"
}</pre>

    <h2>3. Update Icon</h2>
    <p><strong>PUT</strong> http://localhost:3000/icons/:id</p>
    <pre>{
  "color_id": "blue"
}</pre>

    <h2>4. Delete Icon</h2>
    <p><strong>DELETE</strong> http://localhost:3000/icons/:id</p>
  `);
});

module.exports = router;
