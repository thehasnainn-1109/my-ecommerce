const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../utils/db");

const router = express.Router();

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  if (db.getUserByEmail(email)) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = db.createUser({ name, email, passwordHash });

  req.session.userId = user.id;

  return res.status(201).json({
    message: "Account created successfully.",
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = db.getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  req.session.userId = user.id;

  return res.json({
    message: "Logged in successfully.",
    user: { id: user.id, name: user.name, email: user.email },
  });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully." });
  });
});

// GET /api/auth/me  -> currently logged in user (or null)
router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.json({ user: null });
  }
  const user = db.getUserById(req.session.userId);
  if (!user) {
    return res.json({ user: null });
  }
  return res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

module.exports = router;
