const { sequelize } = require('../models');

/**
 * ============================================================
 * ⚠️  PERINGATAN: FILE INI SENGAJA DIBIKIN RENTAN buat DEMO KELAS
 * ============================================================
 * JANGAN PERNAH pake pola kayak gini di aplikasi beneran.
 * Route ini cuma aktif kalo ENABLE_VULN_DEMO=true di .env
 * (liat app.js & routes/search.routes.js).
 *
 * ADA 2 KERENTANAN SENGAJA DI SINI:
 *
 * 1. SQL INJECTION
 *    Query SQL dibikin dengan NYAMBUNGIN STRING LANGSUNG dari input user
 *    (template literal `${q}`), bukan pake parameter/placeholder.
 *    Ini bikin user bisa "kabur" dari konteks data dan nulis perintah
 *    SQL sendiri.
 *
 *    Coba payload di kotak search (kalo demo diaktifin):
 *      - ' OR '1'='1                -> nampilin SEMUA produk, bypass filter
 *      - ' UNION SELECT username, password, 1, 1, now(), now() FROM users --
 *                                     -> bisa nyolong data tabel LAIN
 *
 * 2. XSS (Cross-Site Scripting) - REFLECTED & STORED
 *    Kata pencarian ditampilin lagi ke halaman TANPA di-escape
 *    (pake `<%- %>` bukan `<%= %>` di view), dan salah satu produk di
 *    seeder sengaja namanya berisi payload <script>.
 *
 *    Coba payload di kotak search:
 *      - <script>alert('XSS dari search')</script>
 * ============================================================
 */
async function searchUnsafe(req, res) {
  const q = req.query.q || ''; // TIDAK di-sanitasi sama sekali di sini

  let products = [];
  if (q) {
    // ⚠️ BAHAYA: string SQL dibangun manual pake template literal.
    // Ini contoh klasik SQL Injection.
    const rawQuery = `SELECT * FROM products WHERE name ILIKE '%${q}%' OR description ILIKE '%${q}%'`;

    try {
      const [results] = await sequelize.query(rawQuery);
      products = results;
    } catch (err) {
      // query yang di-inject sering bikin syntax error - ini juga bagian
      // dari "signal" ke penyerang kalo endpoint-nya rentan
      return res.render('search-unsafe', {
        query: q,
        products: [],
        username: req.session.username,
        searched: true,
        sqlError: err.message,
      });
    }
  }

  res.render('search-unsafe', {
    query: q,
    products,
    username: req.session.username,
    searched: q.length > 0,
    sqlError: null,
  });
}

module.exports = { searchUnsafe };
