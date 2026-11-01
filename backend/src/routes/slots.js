const router = require('express').Router();
const { requireRole } = require('../middleware/auth');

const capacity = Number(process.env.DEFAULT_SLOT_CAPACITY) || 6;

// Generates today's 15-minute slots from 8:00 to 17:00. Replace with a database query.
router.get('/', (req, res) => {
  const slots = [];
  const now = Date.now();
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  for (let m = 8 * 60; m < 17 * 60; m += 15) {
    const start = day.getTime() + m * 60000;
    if (start < now + 10 * 60000) continue;
    slots.push({ start: new Date(start).toISOString(), capacity, booked: 0, is_closed: false });
  }
  res.json(slots);
});
router.patch('/:id', requireRole('kitchen'), (req, res) => res.status(501).json({ error: 'Not implemented yet' }));
router.put('/capacity', requireRole('kitchen'), (req, res) => res.status(501).json({ error: 'Not implemented yet' }));

module.exports = router;
