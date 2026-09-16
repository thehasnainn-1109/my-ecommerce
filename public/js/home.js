(async function () {
  const grid = document.getElementById("product-grid");
  const categoryBar = document.getElementById("category-bar");

  const params = new URLSearchParams(window.location.search);
  const search = params.get("search") || "";
  let activeCategory = params.get("category") || "All";

  let allProducts = [];

  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const { products } = await apiRequest("/products" + query);
    allProducts = products;
  } catch (err) {
    grid.innerHTML = `<p class="alert error">Could not load products: ${err.message}</p>`;
    return;
  }

  const categories = ["All", ...new Set(allProducts.map((p) => p.category))];
  categoryBar.innerHTML = categories
    .map(
      (c) =>
        `<button data-cat="${c}" class="${c === activeCategory ? "active" : ""}">${c}</button>`
    )
    .join("");

  categoryBar.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      categoryBar.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderGrid();
    });
  });

  function renderGrid() {
    const filtered =
      activeCategory === "All"
        ? allProducts
        : allProducts.filter((p) => p.category === activeCategory);

    if (filtered.length === 0) {
      grid.innerHTML = `<p>No products found.</p>`;
      return;
    }

    grid.innerHTML = filtered
      .map(
        (p) => `
      <div class="product-card">
        <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${escapeHtml(p.name)}" /></a>
        <div class="product-card-body">
          <span class="category-tag">${escapeHtml(p.category)}</span>
          <h3><a href="product.html?id=${p.id}">${escapeHtml(p.name)}</a></h3>
          <p class="desc">${escapeHtml(p.description)}</p>
          <span class="price">${formatPrice(p.price)}</span>
          <button class="btn block add-cart-btn" data-id="${p.id}" ${
          p.stock === 0 ? "disabled" : ""
        }>${p.stock === 0 ? "Out of stock" : "Add to Cart"}</button>
        </div>
      </div>`
      )
      .join("");

    grid.querySelectorAll(".add-cart-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        addToCart(Number(btn.dataset.id), 1);
        btn.textContent = "Added ✓";
        setTimeout(() => (btn.textContent = "Add to Cart"), 900);
      });
    });
  }

  renderGrid();
})();
