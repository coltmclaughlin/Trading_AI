const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRouter = require("./routes/authRouter");
const photoRouter = require("./routes/photoRouter");
const ActivityRouter= require("./routes/activityRouter");
// Load environment variables from .env file
dotenv.config();

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error(err);
  });

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Route handlers
app.use("/api/auth", authRouter);
app.use("/api", photoRouter);
app.use("/api", ActivityRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
