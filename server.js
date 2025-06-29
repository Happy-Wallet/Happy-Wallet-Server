// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const transactionRoutes = require("./routes/transaction");
const savingGoalRoutes = require("./routes/savingGoal");
const fundRoutes = require("./routes/fund");
const authRoutes = require("./routes/auth");
const iconRoutes = require("./routes/icon");
const iconDocsRoutes = require("./routes/iconDocs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mount routes
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/transactions", transactionRoutes);
app.use("/saving_goals", savingGoalRoutes);
app.use("/funds", fundRoutes);
app.use("/auth", authRoutes);
app.use("/icons", iconRoutes);
app.use("/docs/icons", iconDocsRoutes);

app.use(express.json());

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
