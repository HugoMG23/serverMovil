const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8100', // Permitir solo solicitudes de localhost:8100
  methods: ['GET', 'POST'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
}));

// LOGIN
app.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;
    console.log('Recibiendo datos:', { correo, password });

    if (!correo || !password) {
      return res.status(400).json({ error: 'Faltan credenciales' });
    }

    const response = await axios.post('http://54.145.241.91:5050/api/auth/login', { correo, password });

    res.json(response.data);
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Error en el inicio de sesión',
      mensaje: error.response?.data?.mensaje || 'Credenciales incorrectas',
    });
  }
});
app.get('/ventas/por-fecha', async (req, res) => {
  const { inicio, fin } = req.query;

  if (!inicio || !fin) {
    return res.status(400).json({ message: "Debe proporcionar las fechas de inicio y fin", status: "error" });
  }

  try {
    // Reemplaza la URL del API externa
    const response = await axios.get(`http://54.145.241.91:8080/ventas/por-fecha?inicio=${inicio}&fin=${fin}`);
    res.json(response.data); // Devuelve la respuesta del servidor externo
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({ message: "Error al obtener las ventas", status: "error" });
  }
});
// OBTENER DETALLE DE UNA VENTA
// OBTENER DETALLE DE UNA VENTA
app.get('/ventas/:id', async (req, res) => {
  const ventaId = req.params.id;

  try {
    const response = await axios.get(`http://54.145.241.91:8080/ventas/${ventaId}`);
    const ventaData = response.data; // Aquí es donde capturamos el JSON de la respuesta

    // Si no se encuentra la venta
    if (!ventaData.data) {
      return res.status(404).json({
        status: 'error',
        message: 'Venta no encontrada',
      });
    }

    res.json({
      status: 'success',
      data: ventaData.data, // Enviamos solo los datos de la venta
    });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al consultar la venta',
    });
  }
});

app.get('/ventas', async (req, res) => {
  try {
    const response = await axios.get('http://54.145.241.91:8080/ventas');
    res.json(response.data);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ status: 'error', message: 'No se pudieron obtener las ventas' });
  }
});


// GUARDAR VENTA
app.post('/venta', async (req, res) => {
  try {
    const ventaData = req.body;

    if (!ventaData.total || !ventaData.metodo_pago || !ventaData.sucursal || !ventaData.empleado_venta || !ventaData.estado || !ventaData.detalles_venta) {
      return res.status(400).json({ error: 'Faltan datos para guardar la venta' });
    }

    // Mapear 'detalles_venta' a 'detalles'
    const ventaPayload = {
      ...ventaData,
      detalles: ventaData.detalles_venta,
    };
    delete ventaPayload.detalles_venta;

    const response = await axios.post('http://54.145.241.91:8080/ventas', ventaPayload);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error al guardar la venta:', error);
    res.status(500).json({ error: 'Error al guardar la venta', mensaje: error.response?.data?.mensaje || 'Error desconocido' });
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${port}`);
});
