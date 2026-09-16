(async function () {
  const container = document.getElementById("orders-container");

  const { user } = await apiRequest("/auth/me");
  if (!user) {
    window.location.href = "login.html?redirect=orders.html";
    return;
  }

  let orders;
  try {
    const data = await apiRequest("/orders");
    orders = data.orders;
  } catch (err) {
    container.innerHTML = `<p class="alert error">${err.message}</p>`;
    return;
  }

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>You haven't placed any orders yet.</p>
        <a href="index.html" class="btn">Start Shopping</a>
      </div>`;
    return;
  }

  container.innerHTML = orders
    .map(
      (o) => `
    <div class="order-card">
      <div class="order-head">
        <strong>Order #${o.id}</strong>
        <span>${new Date(o.createdAt).toLocaleString()}</span>
        <span class="status-badge">${o.status}</span>
      </div>
      <ul>
        ${o.items.map((i) => `<li>${escapeHtml(i.name)} × ${i.quantity} — ${formatPrice(i.price * i.quantity)}</li>`).join("")}
      </ul>
      <p style="margin:10px 0 0;font-weight:700;">Total: ${formatPrice(o.total)}</p>
      ${o.shipping ? `<p style="margin:6px 0 0;color:var(--muted);font-size:0.85rem;">Shipping to: ${escapeHtml(o.shipping.address)}, ${escapeHtml(o.shipping.city)}</p>` : ""}
    </div>`
    )
    .join("");
})();
