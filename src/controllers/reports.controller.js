const { query } = require('../config/db');
const { ok } = require('../utils/responses');

// Overdue = due_date < today AND status != 'completed' AND due_date IS NOT NULL
async function getOverdueTasks(req, res, next) {
  try {
    const userId = req.user.id;

    const rows = await query(
      `SELECT id, user_id, title, description, due_date, priority, status, created_at
         FROM tasks
        WHERE user_id = :user_id
          AND status <> 'completed'
          AND due_date IS NOT NULL
          AND due_date < CURDATE()
        ORDER BY due_date ASC`,
      { user_id: userId }
    );

    return ok(res, rows);
  } catch (err) {
    err.source ||= 'REPORT_OVERDUE';
    next(err);
  }
}

// Return counts of tasks grouped by status for the authenticated user.
async function getStatusCounts(req, res, next) {
  try {
    const userId = req.user.id;

    const rows = await query(
      `SELECT status, COUNT(*) AS cnt
         FROM tasks
        WHERE user_id = :user_id
        GROUP BY status`,
      { user_id: userId }
    );

    // Normalize to always include both statuses
    const counts = { pending: 0, completed: 0 };
    for (const r of rows) {
      counts[r.status] = Number(r.cnt);
    }

    return ok(res, counts);
  } catch (err) {
    err.source ||= 'REPORT_STATUS_COUNTS';
    next(err);
  }
}

module.exports = { getOverdueTasks, getStatusCounts };
