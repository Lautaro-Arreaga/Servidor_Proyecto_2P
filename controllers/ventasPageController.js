// C:\Users\Yull\Front_Proyecto_Final\controllers\ventasPageController.js
const axios = require('axios');
const API_BASE = 'http://localhost:3030/api';

exports.historial = async (req, res) => {
  try {
    const { data } = await axios.get(`${API_BASE}/ventas`);
    const clienteBuscado = req.query.cjson ? JSON.parse(req.query.cjson) : null;

    res.render('historial-ventas', {
      title: 'Historial',
      ventas: Array.isArray(data) ? data : [],
      clienteBuscado,
      error: null,             // <-- SIEMPRE presente
    });
  } catch (e) {
    console.error(e?.response?.data || e.message);
    res.render('historial-ventas', {
      title: 'Historial',
      ventas: [],
      clienteBuscado: null,
      error: 'No se pudo cargar el historial',   // <-- aquí también
    });
  }
};

exports.buscarCliente = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.redirect('/historial-ventas');
    const { data } = await axios.get(`${API_BASE}/clientes/${id}`);
    return res.redirect(`/historial-ventas?cjson=${encodeURIComponent(JSON.stringify(data))}`);
  } catch (e) {
    return res.redirect(`/historial-ventas?cjson=${encodeURIComponent('null')}`);
  }
};
