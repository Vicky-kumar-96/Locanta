const dns = require("dns");
const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error(
      "MONGO_URI is not defined. Set it in the environment before starting the server.",
    );
    return;
  }

  if (process.env.MONGO_URI.startsWith("mongodb+srv://")) {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB Connected Successfully!");
  } catch (err) {
    console.error("Database connection error:", err.message);
    console.log(
      "The server will keep running, but database-backed routes will be unavailable until MongoDB is reachable.",
    );
    setTimeout(() => {
      connectDB();
    }, 10000);
  }
};

module.exports = connectDB;
