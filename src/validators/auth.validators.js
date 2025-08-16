const { body } = require('express-validator');

const registerRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is too short'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 chars')
];

const loginRules = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password required')
];

module.exports = { registerRules, loginRules };
