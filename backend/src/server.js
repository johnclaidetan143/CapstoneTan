const express = require("express");
const cors = require("cors");

const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
