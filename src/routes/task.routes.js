const router = require('express').Router();
const validate = require('../middleware/validate');
const {
  createTaskRules, updateTaskRules, updateStatusRules, listQueryRules, idParam
} = require('../validators/task.validators');

const {
  createTask, listTasks, getTask, updateTask, updateStatus, deleteTask
} = require('../controllers/tasks.controller');

// Create
router.post('/', createTaskRules, validate, createTask);

// List
router.get('/', listQueryRules, validate, listTasks);

// Read one
router.get('/:id', idParam, validate, getTask);

// Update (partial ok)
router.put('/:id', updateTaskRules, validate, updateTask);

// Update status convenience
router.patch('/:id/status', updateStatusRules, validate, updateStatus);

// Delete
router.delete('/:id', idParam, validate, deleteTask);

module.exports = router;
