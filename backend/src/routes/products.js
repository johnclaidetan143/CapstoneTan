const express = require("express");
const products = require("../products");

const router = express.Router();

router.get("/", (_req, res) => {
  res.status(200).json({ products });
});

module.exports = router;
