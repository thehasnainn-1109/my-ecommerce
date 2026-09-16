(async function () {
  const container = document.getElementById("checkout-container");
  const msgBox = document.getElementById("checkout-msg");

  // Must be logged in to check out
  const { user } = await apiRequest("/auth/me");
  if (!user) {
    window.location.href = "login.html?redirect=checkout.html";
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Your cart is empty.</p>
        <a href="index.html" class="btn">Continue Shopping</a>
      </div>`;
    return;
  }

  let lines;
  try {
    lines = await Promise.all(
      cart.map(async (item) => {
        const { product } = await apiRequest(`/products/${item.productId}`);
        return { ...item, product };
      })
    );
  } catch (err) {
    container.innerHTML = `<p class="alert error">${err.message}</p>`;
    return;
  }

  const total = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);

  container.innerHTML = `
    <div class="checkout-grid">
      <div class="form-card" style="max-width:none;">
        <h1 style="margin-top:0;">Shipping Details</h1>
        <form id="checkout-form">
          <div class="field">
            <label for="fullName">Full Name</label>
            <input type="text" id="fullName" value="${escapeHtml(user.name)}" required />
          </div>
          <div class="field">
            <label for="address">Address</label>
            <input type="text" id="address" required />
          </div>
          <div class="field">
            <label for="city">City</label>
            <input type="text" id="city" required />
          </div>
          <div class="field">
            <label for="postalCode">Postal Code</label>
            <input type="text" id="postalCode" required />
          </div>
          <div class="field">
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone" required />
          </div>
          <button type="submit" class="btn block" id="place-order-btn">Place Order</button>
        </form>
      </div>

      <div class="cart-summary" style="margin:0;">
        <h3 style="margin-top:0;">Order Summary</h3>
        ${lines
          .map(
            (l) => `<div class="row"><span>${escapeHtml(l.product.name)} × ${l.quantity}</span><span>${formatPrice(l.product.price * l.quantity)}</span></div>`
          )
          .join("")}
        <div class="row total"><span>Total</span><span>${formatPrice(total)}</span></div>
      </div>
    </div>
  `;

  document.getElementById("checkout-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("place-order-btn");
    btn.disabled = true;
    btn.textContent = "Placing order...";

    const shipping = {
      fullName: document.getElementById("fullName").value.trim(),
      address: document.getElementById("address").value.trim(),
      city: document.getElementById("city").value.trim(),
      postalCode: document.getElementById("postalCode").value.trim(),
      phone: document.getElementById("phone").value.trim(),
    };

    const items = cart.map((i) => ({ productId: i.productId, quantity: i.quantity }));

    try {
      const { order } = await apiRequest("/orders", { method: "POST", body: { items, shipping } });
      clearCart();
      msgBox.innerHTML = `<div class="alert success">Order #${order.id} placed successfully! Redirecting to your orders...</div>`;
      setTimeout(() => (window.location.href = "orders.html"), 900);
    } catch (err) {
      msgBox.innerHTML = `<div class="alert error">${err.message}</div>`;
      btn.disabled = false;
      btn.textContent = "Place Order";
    }
  });
})();
