const router = require('express').Router();
const { requireLogin, requireRole } = require('../middleware/auth');
const notYet = (req, res) => res.status(501).json({ error: 'Not implemented yet' });

router.post('/', requireLogin, notYet);                         // place order in one transaction
router.get('/mine', requireLogin, notYet);                      // student's own orders
router.get('/stream', requireLogin, notYet);                    // Server-Sent Events
router.get('/export.csv', requireRole('kitchen'), notYet);      // order history download
router.get('/', requireRole('kitchen'), notYet);                // live board and history
router.get('/:id', requireLogin, notYet);
router.patch('/:id/status', requireRole('kitchen'), notYet);    // placed > preparing > ready > collected
router.post('/:id/cancel', requireLogin, notYet);

module.exports = router;
