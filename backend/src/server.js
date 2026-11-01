require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'swynex-canteen-api' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/slots', require('./routes/slots'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/sales', require('./routes/sales'));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Canteen API running on http://localhost:' + port));
