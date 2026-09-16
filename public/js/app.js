// ---------------------------------------------------------------------------
// Shared helpers used across every page: talking to the API, reading/writing
// the cart (kept in localStorage on the client, validated server-side at
// checkout), and rendering the header (logged-in state + cart count).
// ---------------------------------------------------------------------------

const API_BASE = "/api";

async function apiRequest(path, { method = "GET", body } = {}) {
  const res = await fetch(API_BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

function formatPrice(n) {
  return "$" + Number(n).toFixed(2);
}

// ---------------- Cart (localStorage) ----------------
const CART_KEY = "codealpha_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const existing = cart.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  saveCart(cart);
}

function updateCartItem(productId, quantity) {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter((i) => i.productId !== productId);
  } else {
    const item = cart.find((i) => i.productId === productId);
    if (item) item.quantity = quantity;
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter((i) => i.productId !== productId);
  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function cartItemCount() {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (badge) badge.textContent = cartItemCount();
}

// ---------------- Header (auth state) ----------------
async function renderHeaderAuth() {
  const slot = document.getElementById("auth-slot");
  if (!slot) return;
  try {
    const { user } = await apiRequest("/auth/me");
    if (user) {
      slot.innerHTML = `
        <a href="orders.html">My Orders</a>
        <span style="opacity:.85">Hi, ${escapeHtml(user.name.split(" ")[0])}</span>
        <button id="logout-btn" class="btn secondary" style="padding:6px 12px;">Logout</button>
      `;
      document.getElementById("logout-btn").addEventListener("click", async () => {
        await apiRequest("/auth/logout", { method: "POST" });
        window.location.href = "index.html";
      });
    } else {
      slot.innerHTML = `
        <a href="login.html">Login</a>
        <a href="register.html">Register</a>
      `;
    }
  } catch {
    slot.innerHTML = `<a href="login.html">Login</a>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Wire up the search form present in the header (if any)
function initHeaderSearch() {
  const form = document.getElementById("search-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = form.elements["q"].value.trim();
    window.location.href = "index.html" + (q ? `?search=${encodeURIComponent(q)}` : "");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderHeaderAuth();
  initHeaderSearch();
});
