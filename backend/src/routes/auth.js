const express = require("express");
const { createId, readJsonArray, writeJsonArray } = require("../utils/db");

const router = express.Router();

router.post("/register", async (req, res) => {
  const name = req.body?.name?.trim();
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  const users = await readJsonArray("users.json");
  if (users.some((u) => u.email === email)) {
    return res.status(409).json({ message: "Email is already registered." });
  }

  const user = {
    id: createId("usr"),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeJsonArray("users.json", users);

  return res.status(201).json({
    message: "Registered successfully.",
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
  });
});

router.post("/login", async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const users = await readJsonArray("users.json");
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.status(200).json({
    message: "Login successful.",
    user: { id: user.id, name: user.name, email: user.email },
  });
});

module.exports = router;
