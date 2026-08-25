function renderHome(req, res) {
  if (req.session && req.session.userId) {
    return res.redirect('/demo');
  }
  res.redirect('/login');
}

module.exports = { renderHome };
