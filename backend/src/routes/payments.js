const router = require('express').Router();
const { requireLogin } = require('../middleware/auth');
const notYet = (req, res) => res.status(501).json({ error: 'Not implemented yet' });

router.post('/create', requireLogin, notYet);   // create gateway order
router.post('/webhook', notYet);                // verify signature, mark order paid

module.exports = router;
