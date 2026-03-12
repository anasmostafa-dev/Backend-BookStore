const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");

// 1. Database Connection
connectDB();

// 2. Global Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://book-store-ebon-ten-27.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  }),
);

app.options("*", cors());


app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Static Files
app.use("/images", express.static("public/images"));

// 4. Routes Imports
const userRouter = require("./routes/UserAuth");
const loginRouter = require("./routes/LoginAuth");
const getUserById = require("./routes/Users");
const booksRouter = require("./routes/Books");
const categoryRouter = require("./routes/Category");
const adminRouter = require("./routes/admin");
const cartsRouter = require("./routes/carts");
const orderRouter = require("./routes/order");
// 5. Routes Declaration
app.use("/api/register", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/users", getUserById);
app.use("/api/books", booksRouter);
app.use("/api/categories", categoryRouter);
app.use("/admin", adminRouter);
app.use("/carts", cartsRouter);
app.use("/orders", orderRouter);

// 6. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Running On http://localhost:${PORT}`);
});

module.exports = app;
