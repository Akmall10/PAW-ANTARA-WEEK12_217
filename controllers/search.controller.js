const { Op } = require('sequelize');
const { Product } = require('../models');

/**
 * VERSI AMAN.
 *
 * Kenapa ini aman dari SQL Injection?
 * Sequelize (lewat driver `pg`) mengirim query dan value TERPISAH ke
 * database (namanya "parameterized query" / "prepared statement").
 * Apapun yang diketik user di `q` DISELAMANYA DIPERLAKUKAN SEBAGAI DATA,
 * bukan bagian dari perintah SQL - walau isinya kayak `' OR '1'='1`.
 *
 * Bandingin sama search.controller.unsafe.js yang nyambungin string SQL
 * manual - di situ user bisa "keluar" dari data dan nulis perintah SQL
 * sendiri.
 */
async function searchSafe(req, res) {
  // req.query.q di titik ini SUDAH divalidasi & di-escape oleh
  // searchValidationRules di routes/search.routes.js
  const q = req.query.q || '';

  let products = [];
  if (q) {
    products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
        ],
      },
      order: [['createdAt', 'DESC']],
    });
  }

  res.render('search', {
    query: q,
    products: products.map((p) => p.toJSON()),
    username: req.session.username,
    searched: q.length > 0,
  });
}

module.exports = { searchSafe };
