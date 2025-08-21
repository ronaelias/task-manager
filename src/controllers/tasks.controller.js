const { query, exec } = require('../config/db');
const { ok, created } = require('../utils/responses');

// columns that can be edited
const EDITABLE_FIELDS = new Set(['title','description','due_date','priority','status']);

// prevents user from updating restricted columns
function pickEditable(body) {
  const out = {};
  for (const k of Object.keys(body)) {
    if (EDITABLE_FIELDS.has(k) && body[k] !== undefined) out[k] = body[k];
  }
  return out;
}

// POST /api/tasks
async function createTask(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      title,
      description = null,
      due_date = null,
      priority = 'medium',
      status = 'pending'
    } = req.body;

    const result = await exec(
      `INSERT INTO tasks (user_id, title, description, due_date, priority, status)
       VALUES (:user_id, :title, :description, :due_date, :priority, :status)`,
      { user_id: userId, title, description, due_date, priority, status }
    );

    const rows = await query(
      `SELECT id, user_id, title, description, due_date, priority, status, created_at
         FROM tasks
        WHERE id = :id AND user_id = :user_id`,
      { id: result.insertId, user_id: userId }
    );

    return created(res, rows[0]);
  } catch (err) {
    err.source ||= 'TASK_CREATE';
    next(err);
  }
}

// GET /api/tasks
async function listTasks(req, res, next) {
  try {
    const userId = req.user.id;

    const rows = await query(
      `SELECT id, user_id, title, description, due_date, priority, status, created_at
         FROM tasks
        WHERE user_id = :user_id
        ORDER BY created_at DESC`,
      { user_id: userId }
    );

    return ok(res, { items: rows });
  } catch (err) {
    err.source ||= 'TASK_LIST';
    next(err);
  }
}

// GET /api/tasks/:id
async function getTask(req, res, next) {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id); // read task id

    const rows = await query(
      `SELECT id, user_id, title, description, due_date, priority, status, created_at
         FROM tasks
        WHERE id = :id AND user_id = :user_id`,
      { id, user_id: userId }
    );

    if (!rows.length) {
      const err = new Error('Task not found');
      err.status = 404;
      throw err;
    }
    return ok(res, rows[0]);
  } catch (err) {
    err.source ||= 'TASK_GET';
    next(err);
  }
}

// PUT/PATCH /api/tasks/:id
async function updateTask(req, res, next) {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    const fields = pickEditable(req.body);
    if (!Object.keys(fields).length) {
      const err = new Error('Nothing to update');
      err.status = 400;
      throw err;
    }

    // build a dynamic SET clause
    const setSQL = Object.keys(fields).map(k => `${k} = :${k}`).join(', ');
    const params = { ...fields, id, user_id: userId };

    const result = await exec(
      `UPDATE tasks SET ${setSQL}
        WHERE id = :id AND user_id = :user_id`,
      params
    );

    if (result.affectedRows === 0) {
      const err = new Error('Task not found');
      err.status = 404;
      throw err;
    }

    const rows = await query(
      `SELECT id, user_id, title, description, due_date, priority, status, created_at
         FROM tasks
        WHERE id = :id AND user_id = :user_id`,
      { id, user_id: userId }
    );
    return ok(res, rows[0]);
  } catch (err) {
    err.source ||= 'TASK_UPDATE';
    next(err);
  }
}

// PATCH /api/tasks/:id/status
async function updateStatus(req, res, next) {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);
    const { status } = req.body;

    const result = await exec(
      `UPDATE tasks SET status = :status
        WHERE id = :id AND user_id = :user_id`,
      { status, id, user_id: userId }
    );

    if (result.affectedRows === 0) {
      const err = new Error('Task not found');
      err.status = 404;
      throw err;
    }

    const rows = await query(
      `SELECT id, user_id, title, description, due_date, priority, status, created_at
         FROM tasks
        WHERE id = :id AND user_id = :user_id`,
      { id, user_id: userId }
    );
    return ok(res, rows[0]);
  } catch (err) {
    err.source ||= 'TASK_UPDATE_STATUS';
    next(err);
  }
}

// DELETE /api/tasks/:id
async function deleteTask(req, res, next) {
  try {
    const userId = req.user.id;
    const id = Number(req.params.id);

    const result = await exec(
      `DELETE FROM tasks WHERE id = :id AND user_id = :user_id`,
      { id, user_id: userId }
    );

    if (result.affectedRows === 0) {
      const err = new Error('Task not found');
      err.status = 404;
      throw err;
    }

    return res.status(204).send();
  } catch (err) {
    err.source ||= 'TASK_DELETE';
    next(err);
  }
}

module.exports = {
  createTask,
  listTasks,
  getTask,
  updateTask,
  updateStatus,
  deleteTask
};
