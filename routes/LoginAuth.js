const express = require("express");
const router = express.Router();
const User = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//signIn
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and Password are required" });

    //check email exist
    const user = await User.findOne({ email }).exec();
    if (user && (await bcrypt.compare(password, user.password))) {
      console.log("==== DEBUG INFO ====");
      console.log("User found:", user.email);
      console.log("roel:", user.role);
      console.log("role type:", typeof user.role);
      console.log("==== DEBUG INFO ====");

      const token = jwt.sign(
        { email, id: user._id, role: user.role },
        process.env.SECRET_KEY,
        {
          expiresIn: "1h",
        },
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      const redirectPath = user.role === "admin" ? "/admin" : "/";
      return res.status(200).json({
        message: "User logged in successfully",
        user: {
          name: user.name,
          email: user.email,
          id: user._id,
          role: user.role,
          redirect: redirectPath,
        },
        token,
      });
    } else {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    //check password is correct
    //json res
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
