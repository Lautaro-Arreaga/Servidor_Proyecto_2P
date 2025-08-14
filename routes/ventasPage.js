const express = require('express');
const router = express.Router();
const c = require('../controllers/ventasPageController');

router.get('/', c.historial);
router.get('/buscar-cliente', c.buscarCliente);

module.exports = router;
