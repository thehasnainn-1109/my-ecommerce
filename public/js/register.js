document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("form-msg");
  msg.innerHTML = "";

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await apiRequest("/auth/register", { method: "POST", body: { name, email, password } });
    msg.innerHTML = `<div class="alert success">Account created! Redirecting...</div>`;
    setTimeout(() => (window.location.href = "index.html"), 700);
  } catch (err) {
    msg.innerHTML = `<div class="alert error">${err.message}</div>`;
  }
});
