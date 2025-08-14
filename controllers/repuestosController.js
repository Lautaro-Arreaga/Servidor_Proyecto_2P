const path = require('path');
const fs = require('fs');
const axios = require('axios');

const API_BASE = 'http://localhost:3030/api';

function deleteLocalImageIfNeeded(localPath) {
  try {
    if (localPath && localPath.startsWith('/images/repuestos/')) {
      const full = path.resolve(__dirname, '..', 'public', localPath.replace(/^\//, ''));
      if (fs.existsSync(full)) fs.unlinkSync(full);
    }
  } catch {}
}

// LISTAR + soporta mostrar resultado de búsqueda y mensaje de venta OK
exports.listar = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '6', 10), 1);
    const { data } = await axios.get(`${API_BASE}/repuestos`, { params: { page, limit } });

    const editId = req.query.editId ? Number(req.query.editId) : null;
    let editItem = null;
    if (editId && Array.isArray(data.items)) {
      editItem = data.items.find(x => Number(x.id) === editId) || null;
    }

    const repuestoBuscado = req.query.rjson ? JSON.parse(req.query.rjson) : null; // viene de /buscar
    const ventaOk = req.query.ventaOk === '1'; // bandera de éxito en venta

    res.render('repuestos', {
      title: 'Ventas',
      items: data.items || [],
      page: data.page || page,
      totalPages: data.totalPages || 1,
      limit,
      editItem,
      repuestoBuscado,
      ventaOk,
      error: null // <-- clave: siempre presente
    });
  } catch (e) {
    res.render('repuestos', {
      title: 'Ventas',
      items: [],
      page: 1,
      totalPages: 1,
      limit: 6,
      error: 'No se pudo cargar el catálogo',
      editItem: null,
      repuestoBuscado: null,
      ventaOk: false
    });
  }
};

// CREAR REPUESTO
exports.crear = async (req, res) => {
  try {
    const { nombre, marca, precio, descripcion } = req.body;
    let nombreArchivo = null;
    if (req.file) nombreArchivo = req.file.filename;

    const payload = {
      nombre,
      descripcion: descripcion || '',
      precio: Number(precio || 0),
      marca: marca || null,
      imagen: nombreArchivo ? `/images/repuestos/${nombreArchivo}` : null
    };

    await axios.post(`${API_BASE}/repuestos`, payload);
    res.redirect('/repuestos');
  } catch (e) {
    res.redirect('/repuestos?error=1');
  }
};

// EDITAR REPUESTO
exports.editar = async (req, res) => {
  try {
    const id = req.params.id;
    const { nombre, marca, precio, descripcion, imagenActual } = req.body;

    let imagen = imagenActual || null;
    if (req.file) {
      deleteLocalImageIfNeeded(imagenActual);
      imagen = `/images/repuestos/${req.file.filename}`;
    }

    const payload = {
      nombre,
      marca: marca || null,
      descripcion: descripcion || '',
      precio: Number(precio || 0),
      imagen
    };

    await axios.put(`${API_BASE}/repuestos/${id}`, payload);
    res.redirect('/repuestos');
  } catch (e) {
    res.redirect('/repuestos?error=1');
  }
};

// ELIMINAR REPUESTO
exports.eliminar = async (req, res) => {
  try {
    const id = req.params.id;
    const { imagen } = req.body;
    await axios.delete(`${API_BASE}/repuestos/${id}`);
    deleteLocalImageIfNeeded(imagen);
    res.redirect('/repuestos');
  } catch (e) {
    res.redirect('/repuestos?error=1');
  }
};

// BUSCAR por ID (redirige el resultado como query para que listar lo pinte)
exports.buscarPorId = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.redirect('/repuestos');

    const { data } = await axios.get(`${API_BASE}/repuestos/${id}`);
    return res.redirect(`/repuestos?rjson=${encodeURIComponent(JSON.stringify(data))}`);
  } catch (e) {
    return res.redirect('/repuestos?rjson=' + encodeURIComponent('null'));
  }
};

// REGISTRAR VENTA
exports.vender = async (req, res) => {
  try {
    const { repuestoId, cantidad, clienteId, nombre, correo, telefono } = req.body;

    const payload = {
      repuestoId: Number(repuestoId),
      cantidad: Number(cantidad || 1)
    };

    if (clienteId) {
      payload.clienteId = Number(clienteId);
    } else if (nombre) {
      payload.cliente = { nombre, correo: correo || null, telefono: telefono || null };
    }

    await axios.post(`${API_BASE}/ventas`, payload);
    res.redirect('/repuestos?ventaOk=1');
  } catch (e) {
    res.redirect('/repuestos?ventaOk=0');
  }
};
