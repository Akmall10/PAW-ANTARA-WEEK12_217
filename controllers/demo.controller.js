/**
 * 🛡️ File ini nanganin 3 dari 5 demo: hub page, Validasi Server-Side, Sanitasi.
 * 2 demo lain (SQL Injection, XSS) + Escape HTML ada di demo.unsafe.controller.js
 * karena emang sengaja nunjukin behavior rentan, jadi dipisah biar jelas
 * batasnya & gampang di-nonaktifin bareng-bareng lewat flag ENABLE_VULN_DEMO.
 */

function renderHub(req, res) {
  res.render('demo/index', {
    username: req.session.username,
    vulnDemoEnabled: process.env.ENABLE_VULN_DEMO === 'true',
  });
}

function showValidasiForm(req, res) {
  res.render('demo/validasi', {
    username: req.session.username,
    errors: [],
    result: null,
    old: { username: '', email: '', password: '' },
  });
}

// 🛡️ DITANGANI DI SINI - hasil validasi (req.validationErrors) diisi oleh
// middleware handleValidationErrors di routes/demo.routes.js, SETELAH
// registerValidationRules jalan (liat middlewares/validators.js)
function handleValidasiDemo(req, res) {
  const errors = req.validationErrors || [];

  res.render('demo/validasi', {
    username: req.session.username,
    errors,
    // req.body di titik ini SUDAH disanitasi (trim, escape) walau ada error validasi
    result: errors.length === 0 ? req.body : null,
    old: req.body,
  });
}

function showSanitasiForm(req, res) {
  res.render('demo/sanitasi', {
    username: req.session.username,
    before: null,
    after: null,
  });
}

// 🛡️ DITANGANI DI SINI - req.rawBodyForDemo di-snapshot SEBELUM sanitasi
// jalan (liat captureRawBody di routes/demo.routes.js), req.body di titik
// ini adalah hasil SETELAH sanitasiDemoRules jalan (middlewares/validators.js)
function handleSanitasiDemo(req, res) {
  res.render('demo/sanitasi', {
    username: req.session.username,
    before: req.rawBodyForDemo || null,
    after: req.body,
  });
}

function showDisabledDemo(req, res) {
  res.render('demo/disabled', {
    username: req.session.username,
    path: req.path,
  });
}

module.exports = {
  renderHub,
  showValidasiForm,
  handleValidasiDemo,
  showSanitasiForm,
  handleSanitasiDemo,
  showDisabledDemo,
};
