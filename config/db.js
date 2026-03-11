const mongoose = require("mongoose");
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("database connected");
  });
};

module.exports = connectDB;
