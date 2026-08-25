const express = require('express');
const router = express.Router();
const {
  showRegisterForm,
  showLoginForm,
  register,
  login,
  logout,
} = require('../controllers/auth.controller');
const {
  registerValidationRules,
  loginValidationRules,
  handleValidationErrors,
} = require('../middlewares/validators');

router.get('/register', showRegisterForm);
router.post('/register', registerValidationRules, handleValidationErrors, register);

router.get('/login', showLoginForm);
router.post('/login', loginValidationRules, handleValidationErrors, login);

router.post('/logout', logout);

module.exports = router;
