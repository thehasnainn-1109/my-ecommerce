const express = require("express");
const db = require("../utils/db");

const router = express.Router();

// GET /api/products  -> list all products (supports ?search= & ?category=)
router.get("/", (req, res) => {
  let products = db.getAllProducts();
  const { search, category } = req.query;

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  if (category) {
    products = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  res.json({ products });
});

// GET /api/products/:id -> single product detail
router.get("/:id", (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }
  res.json({ product });
});

module.exports = router;
