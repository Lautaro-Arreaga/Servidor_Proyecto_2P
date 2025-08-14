const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const repuestosCtrl = require('../controllers/repuestosController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '..', 'public', 'images', 'repuestos'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const base = crypto.randomBytes(8).toString('hex');
    cb(null, `${base}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = ['.jpg','.jpeg','.png','.webp'].includes(path.extname(file.originalname || '').toLowerCase());
    cb(null, ok);
  }
});

router.get('/', repuestosCtrl.listar);
router.post('/', upload.single('imagen'),
  body('nombre').trim().notEmpty(),
  body('precio').optional().isFloat({ min: 0 }),
  repuestosCtrl.crear
);
router.post('/:id/editar', upload.single('imagen'),
  body('nombre').trim().notEmpty(),
  body('precio').optional().isFloat({ min: 0 }),
  repuestosCtrl.editar
);
router.post('/:id/eliminar', repuestosCtrl.eliminar);

// NUEVOS:
router.get('/buscar', repuestosCtrl.buscarPorId);
router.post('/vender', repuestosCtrl.vender);

module.exports = router;
