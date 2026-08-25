/**
 * ============================================================
 * ⚠️  FILE INI SENGAJA NUNJUKIN BEHAVIOR RENTAN - buat demo kelas doang.
 * Cuma bisa diakses kalo ENABLE_VULN_DEMO=true di .env (dicek di
 * routes/demo.routes.js sebelum file ini di-require sama sekali).
 * ============================================================
 */

const { Op } = require('sequelize');
const { sequelize, Product } = require('../models');

// 🛡️ DITANGANI DI SINI - topik #4: SQL Injection (aman vs rentan berdampingan)
async function sqlInjectionDemo(req, res) {
  const q = req.query.q || '';

  let safeResults = [];
  let unsafeResults = [];
  let unsafeError = null;
  let unsafeQueryString = '';

  if (q) {
    // AMAN: parameterized query lewat Sequelize (Op.iLike + where object)
    safeResults = await Product.findAll({
      where: { name: { [Op.iLike]: `%${q}%` } },
    });

    // ⚠️ RENTAN: string SQL disambung manual pake template literal
    unsafeQueryString = `SELECT * FROM products WHERE name ILIKE '%${q}%'`;
    try {
      const [rows] = await sequelize.query(unsafeQueryString);
      unsafeResults = rows;
    } catch (err) {
      unsafeError = err.message;
    }
  }

  res.render('demo/sql-injection', {
    username: req.session.username,
    query: q,
    searched: q.length > 0,
    safeResults,
    unsafeResults,
    unsafeError,
    unsafeQueryString,
  });
}

// 🛡️ DITANGANI DI SINI - topik #5: XSS (fokus ke skenario serangannya)
function xssDemo(req, res) {
  const input = req.query.input || '';
  res.render('demo/xss', {
    username: req.session.username,
    input,
    submitted: input.length > 0,
  });
}

// 🛡️ DITANGANI DI SINI - topik #3: Escape HTML (fokus ke mekanisme <%= %> vs <%- %>)
function escapeHtmlDemo(req, res) {
  const input = req.query.input || '';
  res.render('demo/escape-html', {
    username: req.session.username,
    input,
    submitted: input.length > 0,
  });
}

module.exports = { sqlInjectionDemo, xssDemo, escapeHtmlDemo };
