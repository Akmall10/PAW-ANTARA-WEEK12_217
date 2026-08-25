const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/auth.middleware');
const {
  guestbookValidationRules,
  handleValidationErrors,
} = require('../middlewares/validators');
const { showGuestbook, postComment } = require('../controllers/guestbook.controller');

// 🛡️ Bagian 2 - Implementasi Mandiri: Buku Tamu
router.get('/guestbook', requireAuth, showGuestbook);
router.post(
  '/guestbook',
  requireAuth,
  guestbookValidationRules,
  handleValidationErrors,
  postComment
);

module.exports = router;
