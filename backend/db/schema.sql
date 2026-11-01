-- PostgreSQL schema for the queueless campus canteen
CREATE TYPE user_role AS ENUM ('student', 'kitchen');
CREATE TYPE order_status AS ENUM ('placed', 'preparing', 'ready', 'collected', 'cancelled');
CREATE TYPE pay_method AS ENUM ('online', 'counter');
CREATE TYPE pay_status AS ENUM ('pending', 'paid', 'failed', 'due');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  roll_no TEXT UNIQUE,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  price_paise INT NOT NULL CHECK (price_paise >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE slots (
  id SERIAL PRIMARY KEY,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  capacity INT NOT NULL DEFAULT 6 CHECK (capacity > 0),
  is_closed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (slot_date, start_time)
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  token_no INT NOT NULL,
  user_id INT NOT NULL REFERENCES users(id),
  slot_id INT NOT NULL REFERENCES slots(id),
  status order_status NOT NULL DEFAULT 'placed',
  total_paise INT NOT NULL,
  payment_method pay_method NOT NULL,
  payment_status pay_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_created ON orders (created_at);
CREATE INDEX idx_orders_status ON orders (status);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INT NOT NULL REFERENCES menu_items(id),
  name_snapshot TEXT NOT NULL,
  unit_price_paise INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0)
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id),
  provider TEXT NOT NULL,
  provider_ref TEXT,
  amount_paise INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_status_events (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  changed_by INT REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
