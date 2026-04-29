const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "career-plateform",
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.log("DB error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
