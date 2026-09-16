const express = require("express");
const db = require("../utils/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/orders  -> place a new order (checkout). Requires login.
// body: { items: [{ productId, quantity }], shipping: { fullName, address, city, postalCode, phone } }
router.post("/", requireAuth, (req, res) => {
  const { items, shipping } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }

  try {
    const order = db.createOrder({
      userId: req.session.userId,
      items,
      shipping,
    });
    return res.status(201).json({ message: "Order placed successfully.", order });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/orders -> order history for the logged in user
router.get("/", requireAuth, (req, res) => {
  const orders = db.getOrdersByUser(req.session.userId);
  res.json({ orders });
});

// GET /api/orders/:id -> a single order (must belong to logged in user)
router.get("/:id", requireAuth, (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order || order.userId !== req.session.userId) {
    return res.status(404).json({ error: "Order not found." });
  }
  res.json({ order });
});

module.exports = router;
