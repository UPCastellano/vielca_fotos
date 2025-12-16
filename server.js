const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de MySQL (Vercel/Producción o Local)
// En Vercel: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
let dbConfig;
if (process.env.MYSQL_ADDON_DB) {
  // Entorno Clever Cloud (si usas add-on)
  dbConfig = {
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    socketPath: process.env.CC_MYSQL_PROXYSQL_SOCKET_PATH,
  };
} else {
  // Vercel/Producción o Local - usa variables de entorno
  dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

let pool;

async function initDb() {
  if (!dbConfig.host && !dbConfig.socketPath && !dbConfig.database) {
    console.warn('Variables de entorno de MySQL no configuradas. La app funcionará sin BD.');
    return;
  }

  try {
    pool = mysql.createPool({
      ...dbConfig,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0,
    });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        url VARCHAR(512) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Base de datos MySQL inicializada correctamente');
  } catch (err) {
    console.error('Error inicializando MySQL:', err.message);
    pool = null;
  }
}

// Carpeta de subidas
const UPLOADS_DIR = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer: solo PNG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${timestamp}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Aceptar PNG y JPG/JPEG
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes PNG o JPG'));
  }
};

const upload = multer({ storage, fileFilter });

// Estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Variable para controlar si se permite subir fotos
// Por defecto está habilitado (true), pon ENABLE_UPLOAD=false en producción
const UPLOAD_ENABLED = process.env.ENABLE_UPLOAD !== 'false';

// Ruta para verificar si la subida está habilitada
app.get('/api/upload-status', (req, res) => {
  res.json({ enabled: UPLOAD_ENABLED });
});

// Subir fotos (protegido)
app.post('/upload', upload.any(), async (req, res) => {
  // Si la subida está deshabilitada, rechazar la petición
  if (!UPLOAD_ENABLED) {
    return res.status(403).json({
      success: false,
      message: 'La subida de fotos está deshabilitada',
    });
  }
  const files = req.files || [];
  if (!files.length) {
    return res.json({ success: true, photos: [] });
  }

  const photos = files.map((file) => ({
    filename: path.basename(file.filename),
    url: `/uploads/${file.filename}`,
  }));

  try {
    if (pool) {
      const values = photos.map((p) => [p.filename, p.url]);
      await pool.query('INSERT INTO photos (filename, url) VALUES ?', [values]);
    }
    res.json({ success: true, photos });
  } catch (err) {
    console.error('Error guardando en MySQL:', err);
    res.status(500).json({
      success: false,
      message: 'Error guardando la información de las fotos',
    });
  }
});

// Listar fotos
app.get('/photos', async (req, res) => {
  try {
    let photos = [];

    if (pool) {
      const [rows] = await pool.query(
        'SELECT filename, url, created_at FROM photos ORDER BY created_at DESC'
      );
      photos = rows;
    } else {
      const files = fs.readdirSync(UPLOADS_DIR);
      // Aceptar PNG, JPG y JPEG
      const images = files.filter((f) => {
        const ext = f.toLowerCase();
        return ext.endsWith('.png') || ext.endsWith('.jpg') || ext.endsWith('.jpeg');
      });
      photos = images.map((filename) => ({
        filename,
        url: `/uploads/${filename}`,
      }));
    }

    res.json({ success: true, photos });
  } catch (err) {
    console.error('Error obteniendo fotos:', err);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo lista de fotos',
    });
  }
});

// Descargar foto
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Archivo no encontrado');
  }
  res.download(filePath);
});

// Inicio local
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    initDb();
  });
} else {
  initDb();
}

module.exports = app;


