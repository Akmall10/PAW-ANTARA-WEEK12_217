const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/auth.middleware');
const { searchValidationRules, handleValidationErrors } = require('../middlewares/validators');
const { searchSafe } = require('../controllers/search.controller');

router.get('/search', requireAuth, searchValidationRules, handleValidationErrors, searchSafe);

// route demo rentan cuma didaftarin kalo ENABLE_VULN_DEMO=true (liat app.js)
if (process.env.ENABLE_VULN_DEMO === 'true') {
  const { searchUnsafe } = require('../controllers/search.unsafe.controller');
  // sengaja TIDAK pake searchValidationRules di sini, biar demo kerentanannya kena
  router.get('/search-unsafe-demo', requireAuth, searchUnsafe);
  console.warn('⚠️  ENABLE_VULN_DEMO=true - endpoint /search-unsafe-demo AKTIF (sengaja rentan, cuma buat belajar)');
}

module.exports = router;
