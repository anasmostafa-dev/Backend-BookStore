const express = require("express");
const router = express.Router();
const User = require("../models/UserSchema");
const { cookieAuth } = require("../middlewares/AuthMWPermision");

router.get("/verify", cookieAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }
    res.status(200).json({
      message: "Token Valid",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
});



router.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(400).json({ message: err });
  }
});



router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User Not Found");
    return res.status(200).send(user.name);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
