const { body, param } = require('express-validator');

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['pending', 'completed'];

const idParam = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer')
];

const createTaskRules = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('title is required (1-200 chars)'),
  body('description').optional().trim().isLength({ max: 5000 }).withMessage('description too long'),
  body('due_date').optional().isISO8601({ strict: true }).withMessage('due_date must be YYYY-MM-DD'),
  body('priority').optional().isIn(PRIORITIES).withMessage(`priority must be one of ${PRIORITIES.join(', ')}`),
  body('status').optional().isIn(STATUSES).withMessage(`status must be one of ${STATUSES.join(', ')}`)
];

const updateTaskRules = [
  ...idParam, // route must have a valid id param
  body().custom(value => {
    // ensure at least one field is present
    const allowed = ['title','description','due_date','priority','status'];
    const hasAny = Object.keys(value).some(k => allowed.includes(k));
    if (!hasAny) throw new Error('provide at least one field to update');
    return true;
  }),
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('due_date').optional().isISO8601({ strict: true }),
  body('priority').optional().isIn(PRIORITIES),
  body('status').optional().isIn(STATUSES)
];

// minimal endpoint to change status only
const updateStatusRules = [
  ...idParam,
  body('status').isIn(STATUSES).withMessage(`status must be one of ${STATUSES.join(', ')}`)
];

module.exports = {
  createTaskRules,
  updateTaskRules,
  updateStatusRules,
  idParam,
  PRIORITIES,
  STATUSES
};
