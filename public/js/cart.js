(async function () {
  const container = document.getElementById("cart-container");

  async function render() {
    const cart = getCart();

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Your cart is empty.</p>
          <a href="index.html" class="btn">Continue Shopping</a>
        </div>`;
      return;
    }

    container.innerHTML = `<p>Loading cart...</p>`;

    // Fetch full product info for each cart line (keeps price/stock accurate)
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
      <table class="cart-table">
        <thead>
          <tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>
        </thead>
        <tbody>
          ${lines
            .map(
              (l) => `
            <tr>
              <td class="cart-item-name">
                <img src="${l.product.image}" alt="${escapeHtml(l.product.name)}" />
                <a href="product.html?id=${l.product.id}">${escapeHtml(l.product.name)}</a>
              </td>
              <td>${formatPrice(l.product.price)}</td>
              <td><input type="number" min="1" max="${l.product.stock}" value="${l.quantity}" data-id="${l.product.id}" class="qty-input" /></td>
              <td>${formatPrice(l.product.price * l.quantity)}</td>
              <td><button class="remove-link" data-id="${l.product.id}">Remove</button></td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <div class="cart-summary">
        <div class="row"><span>Subtotal</span><span>${formatPrice(total)}</span></div>
        <div class="row"><span>Shipping</span><span>Free</span></div>
        <div class="row total"><span>Total</span><span>${formatPrice(total)}</span></div>
        <a href="checkout.html" class="btn block" style="margin-top:14px;">Proceed to Checkout</a>
      </div>
    `;

    container.querySelectorAll(".qty-input").forEach((input) => {
      input.addEventListener("change", () => {
        const id = Number(input.dataset.id);
        const qty = Math.max(1, Number(input.value) || 1);
        updateCartItem(id, qty);
        render();
      });
    });

    container.querySelectorAll(".remove-link").forEach((btn) => {
      btn.addEventListener("click", () => {
        removeFromCart(Number(btn.dataset.id));
        render();
      });
    });
  }

  render();
})();
