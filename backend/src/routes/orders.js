const express = require("express");
const { createId, readJsonArray, writeJsonArray } = require("../utils/db");

const router = express.Router();

router.get("/", async (req, res) => {
  const email = req.query.email?.toString().trim().toLowerCase();
  const orders = await readJsonArray("orders.json");

  if (!email) {
    return res.status(200).json({ orders });
  }

  const filtered = orders.filter((o) => o.customerEmail.toLowerCase() === email);
  return res.status(200).json({ orders: filtered });
});

router.post("/", async (req, res) => {
  const customerName = req.body?.customerName?.trim();
  const customerEmail = req.body?.customerEmail?.trim().toLowerCase();
  const phone = req.body?.phone?.trim();
  const address = req.body?.address?.trim();
  const city = req.body?.city?.trim();
  const payment = req.body?.payment?.trim() || "gcash";
  const items = Array.isArray(req.body?.items) ? req.body.items : [];

  if (!customerName || !customerEmail || !phone || !address || !city || items.length === 0) {
    return res.status(400).json({ message: "Customer info and at least one item are required." });
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const order = {
    id: createId("ord"),
    orderNumber: `CCH-${Date.now().toString().slice(-6)}`,
    customerName,
    customerEmail,
    phone,
    address,
    city,
    payment,
    items,
    total,
    createdAt: new Date().toISOString(),
  };

  const orders = await readJsonArray("orders.json");
  orders.push(order);
  await writeJsonArray("orders.json", orders);

  return res.status(201).json({ message: "Order placed.", order });
});

module.exports = router;
