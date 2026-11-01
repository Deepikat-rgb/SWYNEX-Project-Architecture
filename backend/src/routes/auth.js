const router = require('express').Router();
const notYet = (req, res) => res.status(501).json({ error: 'Not implemented yet' });

router.post('/register', notYet);
router.post('/login', notYet);
router.post('/logout', notYet);
router.get('/me', notYet);

module.exports = router;
