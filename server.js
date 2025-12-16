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
        url VARCHAR(512),
        image_data LONGBLOB,
        mime_type VARCHAR(50),
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

// Multer: PNG y JPG
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

  try {
    if (pool) {
      // Guardar cada foto en MySQL como BLOB
      const photos = [];
      for (const file of files) {
        const imageData = fs.readFileSync(file.path);
        const filename = path.basename(file.filename);
        const url = `/api/photo/${filename}`; // URL para servir desde MySQL
        
        await pool.query(
          'INSERT INTO photos (filename, url, image_data, mime_type) VALUES (?, ?, ?, ?)',
          [filename, url, imageData, file.mimetype]
        );
        
        photos.push({ filename, url });
        
        // Eliminar archivo temporal después de guardarlo en BD
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
      
      res.json({ success: true, photos });
    } else {
      // Fallback sin BD
      const photos = files.map((file) => ({
        filename: path.basename(file.filename),
        url: `/uploads/${file.filename}`,
      }));
      res.json({ success: true, photos });
    }
  } catch (err) {
    console.error('Error guardando en MySQL:', err);
    res.status(500).json({
      success: false,
      message: 'Error guardando la información de las fotos',
    });
  }
});

// Ruta para servir fotos desde MySQL
app.get('/api/photo/:filename', async (req, res) => {
  const filename = req.params.filename;
  
  if (!pool) {
    return res.status(404).send('Base de datos no disponible');
  }
  
  try {
    const [rows] = await pool.query(
      'SELECT image_data, mime_type FROM photos WHERE filename = ?',
      [filename]
    );
    
    if (rows.length === 0) {
      return res.status(404).send('Foto no encontrada');
    }
    
    const photo = rows[0];
    res.set('Content-Type', photo.mime_type || 'image/jpeg');
    res.send(photo.image_data);
  } catch (err) {
    console.error('Error obteniendo foto de BD:', err);
    res.status(500).send('Error obteniendo foto');
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
      // Si las URLs son externas (http/https), usarlas directamente
      // Si son de MySQL (/api/photo/...), mantenerlas
      photos = rows.map((photo) => {
        // Si la URL ya es externa, mantenerla
        if (photo.url && (photo.url.startsWith('http://') || photo.url.startsWith('https://'))) {
          return photo;
        }
        
        // Si es de MySQL o no tiene URL, usar la ruta de API
        if (!photo.url || photo.url.startsWith('/api/photo/')) {
          return {
            ...photo,
            url: photo.url || `/api/photo/${photo.filename}`
          };
        }
        
        // Si es local, verificar si existe el archivo
        const filePath = path.join(UPLOADS_DIR, photo.filename);
        if (fs.existsSync(filePath)) {
          return photo; // Mantener URL local si existe
        }
        
        // Si no existe localmente, usar la ruta de API de MySQL
        return {
          ...photo,
          url: `/api/photo/${photo.filename}`
        };
      });
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
app.get('/download/:filename', async (req, res) => {
  const filename = req.params.filename;
  
  // Si tenemos MySQL, buscar la foto en la BD
  if (pool) {
    try {
      const [rows] = await pool.query(
        'SELECT image_data, mime_type, url FROM photos WHERE filename = ?',
        [filename]
      );
      
      if (rows.length > 0) {
        const photo = rows[0];
        
        // Si tiene image_data en MySQL, servirla directamente
        if (photo.image_data) {
          res.set('Content-Type', photo.mime_type || 'image/jpeg');
          res.set('Content-Disposition', `attachment; filename="${filename}"`);
          return res.send(photo.image_data);
        }
        
        // Si la URL es externa (http/https), redirigir
        if (photo.url && (photo.url.startsWith('http://') || photo.url.startsWith('https://'))) {
          return res.redirect(photo.url);
        }
      }
    } catch (err) {
      console.error('Error obteniendo foto de BD:', err);
    }
  }
  
  // Fallback: buscar en sistema de archivos
  const filePath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filePath)) {
    return res.download(filePath);
  }
  
  return res.status(404).send('Archivo no encontrado');
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
