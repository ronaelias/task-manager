const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');

router.get('/health', (req, res) => res.json({ ok: true }));

router.use('/auth', require('./auth.routes'));

// All /tasks endpoints require a valid JWT
router.use('/tasks', requireAuth, require('./task.routes'));

// Reports
router.use('/reports', requireAuth, require('./report.routes'));

module.exports = router;
