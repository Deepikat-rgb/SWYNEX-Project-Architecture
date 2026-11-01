const router = require('express').Router();
const { requireRole } = require('../middleware/auth');
const notYet = (req, res) => res.status(501).json({ error: 'Not implemented yet' });

router.get('/summary', requireRole('kitchen'), notYet);    // ?period=today|week|month
router.get('/top-items', requireRole('kitchen'), notYet);

module.exports = router;
