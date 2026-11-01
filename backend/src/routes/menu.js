const router = require('express').Router();
const { requireRole } = require('../middleware/auth');
const menu = require('../data/menu');

const notYet = (req, res) => res.status(501).json({ error: 'Not implemented yet' });

router.get('/', (req, res) => {
  const grouped = {};
  menu.forEach((m) => (grouped[m.category] = grouped[m.category] || []).push(m));
  res.json(grouped);
});
router.post('/', requireRole('kitchen'), notYet);
router.patch('/:id', requireRole('kitchen'), notYet);
router.patch('/:id/availability', requireRole('kitchen'), notYet);
router.delete('/:id', requireRole('kitchen'), notYet);

module.exports = router;
