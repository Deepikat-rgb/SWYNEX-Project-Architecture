const API = "/api";
const STATUSES = ["Placed", "Preparing", "Ready", "Collected"];
const json = { "Content-Type": "application/json" };

async function loadOrders() {
  const orders = await (await fetch(`${API}/orders`)).json();
  document.getElementById("orders").innerHTML = orders.length ? orders.map(o => `<tr>
    <td><b>#${o.token}</b></td><td>${o.name}</td>
    <td>${o.items.map(i => `${i.name} × ${i.qty}`).join(", ")}</td><td>₹${o.total}</td>
    <td><select onchange="setStatus(${o.token}, this.value)">${STATUSES.map(s =>
      `<option ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}</select></td></tr>`).join("")
    : `<tr><td colspan="5" class="muted">No orders yet</td></tr>`;
}
async function setStatus(token, status) {
  await fetch(`${API}/orders/${token}`, { method: "PATCH", headers: json, body: JSON.stringify({ status }) });
  loadOrders();
}
async function loadMenu() {
  const menu = await (await fetch(`${API}/menu`)).json();
  document.getElementById("menuTable").innerHTML = menu.map(m => `<tr>
    <td>${m.name}</td><td>${m.category}</td><td>₹${m.price}</td>
    <td><input type="checkbox" style="width:auto" ${m.available ? "checked" : ""} onchange="toggle(${m.id}, this.checked)"></td>
    <td><button class="btn" onclick="removeItem(${m.id})">Delete</button></td></tr>`).join("");
}
async function addItem() {
  const body = { name: iname.value.trim(), price: Number(iprice.value), category: icat.value.trim() };
  const res = await fetch(`${API}/menu`, { method: "POST", headers: json, body: JSON.stringify(body) });
  if (!res.ok) return alert((await res.json()).error);
  iname.value = iprice.value = icat.value = ""; loadMenu();
}
async function toggle(id, available) {
  await fetch(`${API}/menu/${id}`, { method: "PATCH", headers: json, body: JSON.stringify({ available }) });
}
async function removeItem(id) {
  if (!confirm("Delete this item?")) return;
  await fetch(`${API}/menu/${id}`, { method: "DELETE" }); loadMenu();
}
loadOrders(); loadMenu(); setInterval(loadOrders, 5000);
