const express = require("express");
const router = express.Router();
const User = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//registeration

router.post("/", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name)
      return res
        .status(400)
        .json({ message: "Name and Email, Password are required" });
    const user = await User.findOne({ email: req.body.email }).exec();

    if (user) {
      return res.status(400).json({ message: "this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });
    await newUser.save();
    const token = jwt.sign(
      { email, id: newUser._id, role: newUser.role },
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
    res.header("x-auth-token", token);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        id: newUser._id,
        role: newUser.role,
      },
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
