const bcrypt = require('bcrypt');
const { User } = require('../models');

const SALT_ROUNDS = 10;

function renderRegisterForm(req, res, extra = {}) {
  res.render('register', {
    errors: req.validationErrors || [],
    old: { username: req.body?.username || '', email: req.body?.email || '' },
    ...extra,
  });
}

function renderLoginForm(req, res, extra = {}) {
  res.render('login', {
    errors: req.validationErrors || [],
    old: { username: req.body?.username || '' },
    ...extra,
  });
}

async function showRegisterForm(req, res) {
  res.render('register', { errors: [], old: { username: '', email: '' } });
}

async function showLoginForm(req, res) {
  res.render('login', {
    errors: [],
    old: { username: '' },
    justRegistered: req.query.registered === '1',
  });
}

async function register(req, res) {
  // req.validationErrors sudah diisi middleware handleValidationErrors kalo ada masalah
  if (req.validationErrors && req.validationErrors.length > 0) {
    return renderRegisterForm(req, res);
  }

  try {
    // req.body.username & email di titik ini SUDAH disanitasi
    // (trim, escape, normalizeEmail) oleh express-validator di route
    const { username, email, password } = req.body;

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return renderRegisterForm(req, res, { errors: ['Username sudah dipakai'] });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return renderRegisterForm(req, res, { errors: ['Email sudah terdaftar'] });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await User.create({ username, email, password: hashedPassword });

    res.redirect('/login?registered=1');
  } catch (err) {
    renderRegisterForm(req, res, { errors: ['Terjadi kesalahan, coba lagi'] });
  }
}

async function login(req, res) {
  if (req.validationErrors && req.validationErrors.length > 0) {
    return renderLoginForm(req, res);
  }

  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return renderLoginForm(req, res, { errors: ['Username atau password salah'] });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return renderLoginForm(req, res, { errors: ['Username atau password salah'] });
    }

    req.session.userId = user.id;
    req.session.username = user.username;

    res.redirect('/demo');
  } catch (err) {
    renderLoginForm(req, res, { errors: ['Terjadi kesalahan, coba lagi'] });
  }
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
}

module.exports = { showRegisterForm, showLoginForm, register, login, logout };
