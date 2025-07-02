const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const transactionRoutes = require("./routes/transaction");
const savingGoalRoutes = require("./routes/savingGoal");
const fundRoutes = require("./routes/fund");
const authRoutes = require("./routes/auth");
const iconDocsRoutes = require("./routes/Docs"); 
const settingRoutes = require("./routes/setting");
const invitationRoutes = require("./routes/invitation"); 

const app = express();
app.use(cors());

app.use(express.json()); 

// Mount routes
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/transactions", transactionRoutes);
app.use("/saving_goals", savingGoalRoutes);
app.use("/funds", fundRoutes);
app.use("/auth", authRoutes);
app.use("/docs", iconDocsRoutes);
app.use("/settings", settingRoutes);
app.use("/invitations", invitationRoutes); 

const PORT = 3000; 
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});