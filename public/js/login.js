document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("form-msg");
  msg.innerHTML = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await apiRequest("/auth/login", { method: "POST", body: { email, password } });
    msg.innerHTML = `<div class="alert success">Logged in! Redirecting...</div>`;
    const redirectTo = new URLSearchParams(window.location.search).get("redirect") || "index.html";
    setTimeout(() => (window.location.href = redirectTo), 500);
  } catch (err) {
    msg.innerHTML = `<div class="alert error">${err.message}</div>`;
  }
});
