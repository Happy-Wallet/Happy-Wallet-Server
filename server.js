// server.js
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
const notificationRoutes = require("./routes/notification");

const fundTransactionRoutes = require("./routes/fundTransaction");

const postRoutes = require("./routes/post");
const commentRoutes = require("./routes/comment"); 
const fundActivityRoutes = require("./routes/fundActivity"); 

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/transactions", transactionRoutes);
app.use("/saving_goals", savingGoalRoutes);
app.use("/funds", fundRoutes);
app.use("/auth", authRoutes);
app.use("/docs", iconDocsRoutes);
app.use("/settings", settingRoutes);
app.use("/invitations", invitationRoutes);
app.use("/notifications", notificationRoutes);

app.use("/fund_transactions", fundTransactionRoutes);

app.use("/posts", postRoutes); 
app.use("/comments", commentRoutes);
app.use("/fund-activities", fundActivityRoutes); 


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});