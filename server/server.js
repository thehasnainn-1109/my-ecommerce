const path = require("path");
const express = require("express");
const session = require("express-session");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "codealpha-ecommerce-secret-key", // in production, load from an env variable
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Serve the frontend (static HTML/CSS/JS)
app.use(express.static(path.join(__dirname, "..", "public")));

// Fallback 404 for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found." });
});

app.listen(PORT, () => {
  console.log(`🛒 CodeAlpha E-commerce server running at http://localhost:${PORT}`);
});
