const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { query, exec } = require('../config/db');
const { ok, created } = require('../utils/responses');

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Validation failed');
      err.status = 400;
      err.details = errors.array();
      throw err;
    }
    const { name, email, password } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = :email', { email });
    if (existing.length) {
      const err = new Error('Email already in use');
      err.status = 409;
      throw err;
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const hashed = await bcrypt.hash(password, saltRounds);

    const result = await exec(
      `INSERT INTO users (name, email, password) VALUES (:name, :email, :password)`,
      { name, email, password: hashed }
    );

    const user = { id: result.insertId, name, email };
    const token = signToken(user);

    return created(res, { user, token });
  } catch (err) {
    err.source ||= 'AUTH_REGISTER';
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error('Validation failed');
      err.status = 400;
      err.details = errors.array();
      throw err;
    }
    const { email, password } = req.body;

    const rows = await query('SELECT id, name, email, password FROM users WHERE email = :email', { email });
    if (!rows.length) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }
    const userRow = rows[0];

    const okPass = await bcrypt.compare(password, userRow.password);
    if (!okPass) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const user = { id: userRow.id, name: userRow.name, email: userRow.email };
    const token = signToken(user);

    return ok(res, { user, token });
  } catch (err) {
    err.source ||= 'AUTH_LOGIN';
    next(err);
  }
}

module.exports = { register, login };