const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Google Drive
let driveClient = null;
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// Inicializar Google Drive
async function initDrive() {
  if (!DRIVE_FOLDER_ID) {
    console.warn('⚠️  GOOGLE_DRIVE_FOLDER_ID no configurado. La app funcionará sin Google Drive.');
    console.warn('   Configura GOOGLE_DRIVE_FOLDER_ID y GOOGLE_SERVICE_ACCOUNT para usar Drive.');
    return;
  }

  try {
    // Obtener credenciales de Service Account desde variable de entorno
    let credentials;
    if (process.env.GOOGLE_SERVICE_ACCOUNT) {
      // Si es un string JSON, parsearlo
      credentials = typeof process.env.GOOGLE_SERVICE_ACCOUNT === 'string' 
        ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT)
        : process.env.GOOGLE_SERVICE_ACCOUNT;
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
      // Si es una ruta a un archivo JSON
      const credsPath = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
      credentials = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
    } else {
      console.warn('⚠️  GOOGLE_SERVICE_ACCOUNT no configurado.');
      return;
    }

    // Autenticar con Service Account
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    driveClient = google.drive({ version: 'v3', auth });

    // Verificar que la carpeta existe y es accesible
    try {
      await driveClient.files.get({
        fileId: DRIVE_FOLDER_ID,
        fields: 'id,name',
      });
      console.log('✅ Google Drive inicializado correctamente');
      console.log(`   Carpeta: ${DRIVE_FOLDER_ID}`);
      console.log('   Las fotos se guardarán en Google Drive');
    } catch (err) {
      console.error('❌ Error accediendo a la carpeta de Drive:', err.message);
      console.error('   Verifica que el ID de carpeta sea correcto y que la Service Account tenga acceso');
      driveClient = null;
    }
  } catch (err) {
    console.error('❌ Error inicializando Google Drive:', err.message);
    driveClient = null;
    console.warn('⚠️  La app funcionará sin Drive. Las fotos se guardarán localmente.');
  }
}

// Carpeta temporal de subidas (solo para procesamiento)
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

// Variable para controlar si se permite subir fotos
const UPLOAD_ENABLED = process.env.ENABLE_UPLOAD !== 'false';

// Ruta para verificar si la subida está habilitada
app.get('/api/upload-status', (req, res) => {
  res.json({ enabled: UPLOAD_ENABLED });
});

// Subir fotos a Google Drive
app.post('/upload', upload.any(), async (req, res) => {
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
    if (!driveClient) {
      return res.status(500).json({
        success: false,
        message: 'Google Drive no está configurado. Configura GOOGLE_DRIVE_FOLDER_ID y GOOGLE_SERVICE_ACCOUNT.',
      });
    }

    console.log(`📤 Subiendo ${files.length} foto(s) a Google Drive...`);
    const photos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = file.path;
      const filename = path.basename(file.filename);
      const mimeType = file.mimetype;

      try {
        // Leer el archivo
        const fileContent = fs.readFileSync(filePath);

        // Subir a Google Drive
        const driveFile = await driveClient.files.create({
          requestBody: {
            name: filename,
            parents: [DRIVE_FOLDER_ID],
          },
          media: {
            mimeType: mimeType,
            body: fileContent,
          },
          fields: 'id,name,webViewLink,webContentLink',
        });

        // Hacer el archivo público para que se pueda ver directamente
        await driveClient.permissions.create({
          fileId: driveFile.data.id,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });

        // Obtener URL pública directa para la imagen
        // Formato: https://drive.google.com/uc?export=view&id=FILE_ID
        const imageUrl = `https://drive.google.com/uc?export=view&id=${driveFile.data.id}`;
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${driveFile.data.id}`;

        photos.push({
          filename,
          url: imageUrl,
          downloadUrl: downloadUrl,
          fileId: driveFile.data.id,
        });

        console.log(`  ✓ Foto ${i + 1}/${files.length} subida a Drive: ${filename}`);

        // Eliminar archivo temporal
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error(`  ✗ Error subiendo ${filename}:`, err.message);
        // Continuar con las siguientes fotos aunque una falle
      }
    }

    console.log(`✅ ${photos.length} foto(s) subida(s) correctamente a Google Drive`);
    res.json({ success: true, photos });
  } catch (err) {
    console.error('❌ Error subiendo a Google Drive:', err.message);
    res.status(500).json({
      success: false,
      message: `Error subiendo las fotos: ${err.message}`,
    });
  }
});

// Listar fotos desde Google Drive
app.get('/photos', async (req, res) => {
  try {
    let photos = [];

    if (driveClient && DRIVE_FOLDER_ID) {
      try {
        // Buscar todos los archivos de imagen en la carpeta
        const response = await driveClient.files.list({
          q: `'${DRIVE_FOLDER_ID}' in parents and (mimeType='image/png' or mimeType='image/jpeg' or mimeType='image/jpg')`,
          fields: 'files(id,name,createdTime,modifiedTime)',
          orderBy: 'createdTime desc',
        });

        photos = response.data.files.map((file) => {
          const imageUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;
          const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
          
          return {
            filename: file.name,
            url: imageUrl,
            downloadUrl: downloadUrl,
            fileId: file.id,
            created_at: file.createdTime,
          };
        });

        console.log(`📸 ${photos.length} foto(s) encontrada(s) en Google Drive`);
      } catch (err) {
        console.error('Error obteniendo fotos de Drive:', err.message);
        return res.status(500).json({
          success: false,
          message: `Error obteniendo fotos de Google Drive: ${err.message}`,
        });
      }
    } else {
      // Fallback: buscar en sistema de archivos local
      const files = fs.readdirSync(UPLOADS_DIR);
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

// Descargar foto desde Google Drive
app.get('/download/:filename', async (req, res) => {
  const filename = req.params.filename;

  if (driveClient) {
    try {
      // Buscar el archivo por nombre en la carpeta
      const response = await driveClient.files.list({
        q: `'${DRIVE_FOLDER_ID}' in parents and name='${filename}'`,
        fields: 'files(id,name)',
      });

      if (response.data.files.length > 0) {
        const fileId = response.data.files[0].id;
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        return res.redirect(downloadUrl);
      }
    } catch (err) {
      console.error('Error obteniendo archivo de Drive:', err);
    }
  }

  // Fallback: buscar en sistema de archivos local
  const filePath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filePath)) {
    return res.download(filePath);
  }

  return res.status(404).send('Archivo no encontrado');
});

// Inicio local
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    await initDrive();
  });
} else {
  initDrive();
}

module.exports = app;
