const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const UserModel = require("../Model/userModel");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

const userRoute = express.Router();

userRoute.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Incomplete User Details" });
    }

    const userExsist = await UserModel.findOne({ email: email });

    if (userExsist) {
      return res.status(400).json({ error: "User Already Registered" });
    }

    if (
      !/[A-Z]/.test(password) ||
      !/[1-9]/.test(password) ||
      !/[!@#$%^&*_?":]/.test(password) ||
      password.length < 8
    ) {
      return res.status(401).json({
        error:
          "Password must have One uppercase, One number, and One Special Character",
      });
    }

    const user = new UserModel({ email, firstName, lastName });

    bcrypt.hash(password, 10, async function (err, hash) {
      if (err) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
      user.password = hash;

      await user.save();

      res
        .status(201)
        .json({ message: "User Successfully Registered", user: user });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

userRoute.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please Provide Email and Password" });
    }

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(402).json({ error: "User Does Not Exist" });
    }

    bcrypt.compare(password, user.password, function (err, result) {
      if (!result) {
        return res.status(403).json({ error: "Invalid Password" });
      }

      const token = jwt.sign(
        { userID: user._id, userName: user.name, userEmail: user.email },
        "1234"
      );

      res.json({
        message: "User Successfully Logged In",
        token: token,
        firstName: user.firstName,
        lastName: user.lastName,
        userEmail: user.email,
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

userRoute.patch("/update", async (req, res) => {
  try {
    const { userId, firstName, lastName, email } = req.body;

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { firstName, lastName, email },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

userRoute.get("/info", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, "1234");

    let user;
    if (decoded.googleId) {
      user = await UserModel.findOne({ googleId: decoded.googleId });
    } else {
      user = await UserModel.findById(decoded.userID);
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});


userRoute.post("/auth-google", async (req, res) => {
  const { googleId, firstName, lastName, email, avatar } = req.body;

  try {
    let user = await UserModel.findOne({ email });

    if (!user) {
      user = new UserModel({
        googleId,
        firstName,
        lastName,
        email,
        avatar,
      });
      await user.save();
    }

    const token = jwt.sign(
      {
        googleId: user.googleId,
        userName: user.firstName,
        lastName: user.lastName,
        userEmail: user.email,
        avatar: user.avatar,
      },
      "1234"
    );

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(400).json({ message: "Google authentication failed", error });
  }
});

module.exports = userRoute;
