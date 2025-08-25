const router = require('express').Router();
const { getOverdueTasks, getStatusCounts } = require('../controllers/reports.controller');

router.get('/overdue', getOverdueTasks);
router.get('/status-counts', getStatusCounts);

module.exports = router;