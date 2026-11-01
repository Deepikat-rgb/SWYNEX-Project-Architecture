const API = "/api";
let menu = [], cart = {}, category = "All", pollTimer;

async function loadMenu() {
  menu = (await (await fetch(`${API}/menu`)).json()).filter(m => m.available);
  const cats = ["All", ...new Set(menu.map(m => m.category))];
  document.getElementById("tabs").innerHTML = cats.map(c =>
    `<button class="${c === category ? "active" : ""}" onclick="setCat('${c}')">${c}</button>`).join("");
  document.getElementById("menu").innerHTML = menu
    .filter(m => category === "All" || m.category === category)
    .map(m => `<div class="card"><h3>${m.name}</h3><p class="muted">${m.category}</p>
      <p class="price">₹${m.price}</p><button class="btn primary" onclick="add(${m.id})">Add</button></div>`).join("");
}
function setCat(c) { category = c; loadMenu(); }
function add(id) { cart[id] = (cart[id] || 0) + 1; renderCart(); }
function change(id, d) { cart[id] += d; if (cart[id] <= 0) delete cart[id]; renderCart(); }

function renderCart() {
  const ids = Object.keys(cart);
  let total = 0;
  document.getElementById("cart").innerHTML = ids.length ? ids.map(id => {
    const m = menu.find(x => x.id == id); total += m.price * cart[id];
    return `<div class="line"><span>${m.name}</span><span>
      <button onclick="change(${id},-1)">−</button> ${cart[id]} <button onclick="change(${id},1)">+</button>
      </span></div>`;
  }).join("") : `<p class="muted">Cart is empty</p>`;
  document.getElementById("total").textContent = total;
}

async function placeOrder() {
  const name = document.getElementById("name").value.trim();
  const items = Object.entries(cart).map(([id, qty]) => ({ id: Number(id), qty }));
  if (!name || !items.length) return alert("Enter your name and add items.");
  const res = await fetch(`${API}/orders`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, items }) });
  const order = await res.json();
  if (!res.ok) return alert(order.error);
  cart = {}; renderCart();
  document.getElementById("trackToken").value = order.token;
  track();
  alert(`Order placed! Your token is #${order.token}`);
}

async function track() {
  const t = document.getElementById("trackToken").value;
  const box = document.getElementById("trackResult");
  if (!t) return;
  const res = await fetch(`${API}/orders/${t}`);
  if (!res.ok) { box.innerHTML = `<p class="muted">Order not found</p>`; return; }
  const o = await res.json();
  box.innerHTML = `<div class="token">#${o.token}</div><p style="text-align:center">
    <span class="status ${o.status}">${o.status}</span></p><p class="muted" style="text-align:center">Total ₹${o.total}</p>`;
  clearTimeout(pollTimer);
  if (o.status !== "Collected") pollTimer = setTimeout(track, 5000);
}

loadMenu();
