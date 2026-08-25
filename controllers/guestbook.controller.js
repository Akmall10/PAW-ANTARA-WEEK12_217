/**
 * ============================================================
 * BAGIAN 2 - IMPLEMENTASI MANDIRI: Buku Tamu (Guestbook)
 * ============================================================
 * Halaman ini AMAN dari 5 celah keamanan di tugas:
 *
 * 1. Validasi server-side  -> guestbookValidationRules (middlewares/validators.js),
 *                              dipasang di routes/guestbook.routes.js SEBELUM controller ini.
 * 2. Sanitasi               -> trim() + rapihin spasi ganda, juga di guestbookValidationRules.
 * 3. Escape saat render     -> views/guestbook.ejs pake <%= %> (BUKAN <%- %>) buat
 *                              nampilin name & message.
 * 4. Parameterized query    -> Comment.create()/Comment.findAll() di bawah ini,
 *                              lewat Sequelize ORM (bukan sequelize.query() + string manual).
 * 5. Uji serang             -> lihat tugas.md, payload SQLi & XSS dicoba di form ini.
 * ============================================================
 */

const { Comment } = require('../models');

async function getComments() {
  const comments = await Comment.findAll({ order: [['createdAt', 'DESC']] });
  return comments.map((c) => c.toJSON());
}

async function showGuestbook(req, res) {
  const comments = await getComments();
  res.render('guestbook', {
    username: req.session.username,
    comments,
    errors: [],
    old: { name: '', message: '' },
    success: req.query.sent === '1',
  });
}

// 🛡️ DITANGANI DI SINI - req.validationErrors diisi middleware
// handleValidationErrors SETELAH guestbookValidationRules jalan (topik #1 & #2).
async function postComment(req, res) {
  if (req.validationErrors && req.validationErrors.length > 0) {
    const comments = await getComments();
    return res.render('guestbook', {
      username: req.session.username,
      comments,
      errors: req.validationErrors,
      // req.body di titik ini sudah lolos sanitasi (trim + rapihin spasi)
      // walau ada field lain yang gagal validasi
      old: req.body,
      success: false,
    });
  }

  // req.body.name & req.body.message DI TITIK INI SUDAH disanitasi
  // (trim + rapihin spasi ganda) oleh guestbookValidationRules.
  const { name, message } = req.body;

  // 🛡️ DITANGANI DI SINI - topik #4: Parameterized query.
  // Comment.create() lewat Sequelize ORM ngirim nilai `name` & `message`
  // sebagai BIND PARAMETER terpisah dari perintah SQL-nya (bukan
  // disambung jadi satu string kayak di search.unsafe.controller.js).
  // Jadi walau isinya payload kayak `' OR '1'='1` atau `'; DROP TABLE--`,
  // itu tetep diperlakukan MURNI sebagai teks/data, gak bisa "kabur"
  // jadi bagian perintah SQL.
  await Comment.create({ name, message });

  res.redirect('/guestbook?sent=1');
}

module.exports = { showGuestbook, postComment };
