const router = require('express').Router(); // to attach routes
const { register, login } = require('../controllers/auth.controller');
const { registerRules, loginRules } = require('../validators/auth.validators');

const { validationResult } = require('express-validator');

function validate(req, res, next) {
  next();
}

router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);

module.exports = router;
