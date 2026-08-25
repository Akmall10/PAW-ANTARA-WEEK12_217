const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/auth.middleware');
const {
  registerValidationRules,
  sanitasiDemoRules,
  handleValidationErrors,
} = require('../middlewares/validators');
const demoController = require('../controllers/demo.controller');

// snapshot body SEBELUM sanitasi jalan, biar demo bisa nunjukin before/after
function captureRawBody(req, res, next) {
  req.rawBodyForDemo = { ...req.body };
  next();
}

router.get('/demo', requireAuth, demoController.renderHub);

// ── Topik #1: Validasi Server-Side (SELALU AKTIF, gak berbahaya) ──
router.get('/demo/validasi-server-side', requireAuth, demoController.showValidasiForm);
router.post(
  '/demo/validasi-server-side',
  requireAuth,
  registerValidationRules,
  handleValidationErrors,
  demoController.handleValidasiDemo
);

// ── Topik #2: Sanitasi (SELALU AKTIF, gak berbahaya) ──
router.get('/demo/sanitasi', requireAuth, demoController.showSanitasiForm);
router.post(
  '/demo/sanitasi',
  requireAuth,
  captureRawBody,
  sanitasiDemoRules,
  handleValidationErrors,
  demoController.handleSanitasiDemo
);

// ── Topik #3, #4, #5: Escape HTML, SQL Injection, XSS ──
// ⚠️ Route-route ini SENGAJA nunjukin behavior rentan buat belajar, jadi
// DI-NONAKTIFIN SECARA DEFAULT. Cuma aktif kalo ENABLE_VULN_DEMO=true di .env.
//
// INI CARA "MATIIN DI PROD" YANG DIMAKSUD: gak perlu comment kode manual,
// tinggal pastiin .env production gak punya ENABLE_VULN_DEMO=true (atau
// hapus baris itu / set false). Handler yang RENTAN (demo.unsafe.controller.js)
// gak pernah ke-require sama sekali kalo flag OFF - jadi kodenya beneran gak
// pernah jalan, bukan cuma "disembunyiin" di UI. Path-nya sendiri tetep
// terdaftar, tapi diarahin ke halaman penjelasan (showDisabledDemo) di bawah.
if (process.env.ENABLE_VULN_DEMO === 'true') {
  const demoUnsafeController = require('../controllers/demo.unsafe.controller');

  router.get('/demo/escape-html', requireAuth, demoUnsafeController.escapeHtmlDemo);
  router.get('/demo/sql-injection', requireAuth, demoUnsafeController.sqlInjectionDemo);
  router.get('/demo/xss', requireAuth, demoUnsafeController.xssDemo);

  console.warn(
    '⚠️  ENABLE_VULN_DEMO=true — /demo/escape-html, /demo/sql-injection, /demo/xss AKTIF (sengaja rentan, cuma buat belajar)'
  );
} else {
  // daripada 404 polos yang bikin bingung mahasiswa, kasih halaman
  // penjelasan kenapa demo ini "sengaja dimatiin"
  router.get(
    ['/demo/escape-html', '/demo/sql-injection', '/demo/xss'],
    requireAuth,
    demoController.showDisabledDemo
  );
}

module.exports = router;
