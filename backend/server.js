const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA = path.join(__dirname, "data");
const MENU = path.join(DATA, "menu.json");
const ORDERS = path.join(DATA, "orders.json");
const STATUSES = ["Placed", "Preparing", "Ready", "Collected"];

const read = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : d);
const write = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// ---- Menu ----
app.get("/api/menu", (req, res) => res.json(read(MENU, [])));

app.post("/api/menu", (req, res) => {
  const { name, price, category } = req.body;
  if (!name || !(Number(price) > 0)) return res.status(400).json({ error: "name and positive price required" });
  const menu = read(MENU, []);
  const item = { id: Math.max(0, ...menu.map(m => m.id)) + 1, name, price: Number(price), category: category || "Other", available: true };
  menu.push(item); write(MENU, menu); res.status(201).json(item);
});

app.patch("/api/menu/:id", (req, res) => {
  const menu = read(MENU, []);
  const item = menu.find(m => m.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "Item not found" });
  Object.assign(item, req.body, { id: item.id }); write(MENU, menu); res.json(item);
});

app.delete("/api/menu/:id", (req, res) => {
  const menu = read(MENU, []).filter(m => m.id !== Number(req.params.id));
  write(MENU, menu); res.status(204).end();
});

// ---- Orders ----
app.post("/api/orders", (req, res) => {
  const { name, items } = req.body;
  if (!name || !Array.isArray(items) || !items.length) return res.status(400).json({ error: "name and items required" });
  const menu = read(MENU, []);
  const lines = [];
  for (const { id, qty } of items) {
    const m = menu.find(x => x.id === id && x.available);
    if (!m || !(qty > 0)) return res.status(400).json({ error: `Invalid item ${id}` });
    lines.push({ id, name: m.name, price: m.price, qty });
  }
  const orders = read(ORDERS, []);
  const order = {
    token: (orders.at(-1)?.token || 100) + 1,
    name, items: lines,
    total: lines.reduce((s, l) => s + l.price * l.qty, 0),
    status: "Placed", createdAt: new Date().toISOString()
  };
  orders.push(order); write(ORDERS, orders); res.status(201).json(order);
});

app.get("/api/orders", (req, res) => res.json(read(ORDERS, []).slice().reverse()));

app.get("/api/orders/:token", (req, res) => {
  const o = read(ORDERS, []).find(x => x.token === Number(req.params.token));
  o ? res.json(o) : res.status(404).json({ error: "Order not found" });
});

app.patch("/api/orders/:token", (req, res) => {
  if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: "Invalid status" });
  const orders = read(ORDERS, []);
  const o = orders.find(x => x.token === Number(req.params.token));
  if (!o) return res.status(404).json({ error: "Order not found" });
  o.status = req.body.status; write(ORDERS, orders); res.json(o);
});

app.listen(PORT, () => console.log(`Queueless Canteen running at http://localhost:${PORT}`));
