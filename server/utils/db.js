/**
 * Very small file-based "database" layer.
 *
 * For this project we use a JSON file (server/data/db.json) as our database.
 * This keeps the project dependency-free (no native modules to compile) while
 * still giving us persistent storage for products, users and orders, and a
 * central place from which it would be trivial to swap in a real database
 * (MongoDB, MySQL, PostgreSQL, etc.) later — every route only talks to the
 * functions exported from this file.
 */

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

function readDB() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// ---------- Products ----------
function getAllProducts() {
  return readDB().products;
}

function getProductById(id) {
  return readDB().products.find((p) => p.id === Number(id));
}

// ---------- Users ----------
function getAllUsers() {
  return readDB().users;
}

function getUserByEmail(email) {
  return readDB().users.find(
    (u) => u.email.toLowerCase() === String(email).toLowerCase()
  );
}

function getUserById(id) {
  return readDB().users.find((u) => u.id === Number(id));
}

function createUser({ name, email, passwordHash }) {
  const db = readDB();
  const newUser = {
    id: db.nextUserId,
    name,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  db.nextUserId += 1;
  writeDB(db);
  return newUser;
}

// ---------- Orders ----------
function createOrder({ userId, items, total, shipping }) {
  const db = readDB();

  // Validate stock & compute total server-side (never trust the client)
  let computedTotal = 0;
  for (const item of items) {
    const product = db.products.find((p) => p.id === Number(item.productId));
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Not enough stock for "${product.name}"`);
    }
    computedTotal += product.price * item.quantity;
  }

  // Deduct stock
  for (const item of items) {
    const product = db.products.find((p) => p.id === Number(item.productId));
    product.stock -= item.quantity;
  }

  const newOrder = {
    id: db.nextOrderId,
    userId,
    items: items.map((item) => {
      const product = db.products.find((p) => p.id === Number(item.productId));
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    }),
    total: Number(computedTotal.toFixed(2)),
    shipping: shipping || null,
    status: "Processing",
    createdAt: new Date().toISOString(),
  };

  db.orders.push(newOrder);
  db.nextOrderId += 1;
  writeDB(db);
  return newOrder;
}

function getOrdersByUser(userId) {
  return readDB()
    .orders.filter((o) => o.userId === Number(userId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getOrderById(id) {
  return readDB().orders.find((o) => o.id === Number(id));
}

module.exports = {
  getAllProducts,
  getProductById,
  getAllUsers,
  getUserByEmail,
  getUserById,
  createUser,
  createOrder,
  getOrdersByUser,
  getOrderById,
};
