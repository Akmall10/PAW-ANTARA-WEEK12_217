const express = require('express');
const router = express.Router();
const { renderHome } = require('../controllers/page.controller');

router.get('/', renderHome);

module.exports = router;
