(async function () {
  const container = document.getElementById("product-detail-container");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    container.innerHTML = `<p class="alert error">No product specified.</p>`;
    return;
  }

  let product;
  try {
    const data = await apiRequest(`/products/${id}`);
    product = data.product;
  } catch (err) {
    container.innerHTML = `<p class="alert error">${err.message}</p>`;
    return;
  }

  container.innerHTML = `
    <div class="product-detail">
      <img src="${product.image}" alt="${escapeHtml(product.name)}" />
      <div>
        <span class="category-tag">${escapeHtml(product.category)}</span>
        <h1>${escapeHtml(product.name)}</h1>
        <div class="price">${formatPrice(product.price)}</div>
        <p>${escapeHtml(product.description)}</p>
        <p class="stock-note ${product.stock > 0 ? "in-stock" : "out"}">
          ${product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
        <div class="qty-row">
          <label for="qty">Quantity:</label>
          <input type="number" id="qty" min="1" max="${product.stock}" value="1" ${
    product.stock === 0 ? "disabled" : ""
  } />
        </div>
        <button id="add-btn" class="btn" ${product.stock === 0 ? "disabled" : ""}>
          ${product.stock === 0 ? "Out of stock" : "Add to Cart"}
        </button>
        <a href="index.html" class="btn secondary" style="margin-left:10px;">Back to Shop</a>
        <p id="add-msg" style="margin-top:12px;"></p>
      </div>
    </div>
  `;

  const addBtn = document.getElementById("add-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const qty = Math.max(1, Number(document.getElementById("qty").value) || 1);
      addToCart(product.id, qty);
      document.getElementById("add-msg").innerHTML =
        `<span class="alert success" style="display:inline-block;">Added ${qty} to cart. <a href="cart.html">View Cart</a></span>`;
    });
  }
})();
