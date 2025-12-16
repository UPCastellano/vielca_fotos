const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Google Drive
let drive;
let FOLDER_ID;
const TOKEN_PATH = path.join(__dirname, 'credentials', 'token.json');

async function initGoogleDrive() {
  try {
    FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (!FOLDER_ID) {
      console.warn('⚠️  GOOGLE_DRIVE_FOLDER_ID no configurado. La app funcionará sin Google Drive.');
      return;
    }

    let auth;
    let credentials;
    let isOAuth2 = false;

    // Intentar cargar Service Account desde archivo o variable de entorno
    if (process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
      const credPath = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(credPath)) {
        credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'));
        console.log('✓ Credenciales cargadas desde archivo:', credPath);
      }
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT) {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
      console.log('✓ Credenciales cargadas desde variable de entorno');
    } else {
      // Intentar cargar desde la carpeta credentials
      const defaultCredPath = path.join(__dirname, 'credentials', 'client_secret.json');
      if (fs.existsSync(defaultCredPath)) {
        const credData = JSON.parse(fs.readFileSync(defaultCredPath, 'utf8'));
        
        // Si es OAuth 2.0 (tipo "web")
        if (credData.web) {
          isOAuth2 = true;
          credentials = credData.web;
          console.log('✓ Credenciales OAuth 2.0 detectadas');
        } else if (credData.type === 'service_account') {
          credentials = credData;
          console.log('✓ Credenciales Service Account cargadas desde:', defaultCredPath);
        }
      }
    }

    if (!credentials) {
      console.warn('⚠️  No se encontraron credenciales de Google Drive.');
      return;
    }

    // Manejar OAuth 2.0
    if (isOAuth2) {
      const oAuth2Client = new OAuth2Client(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uris[0] || 'http://localhost:3000'
      );

      // Intentar cargar token guardado
      let token;
      if (fs.existsSync(TOKEN_PATH)) {
        token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        oAuth2Client.setCredentials(token);
        console.log('✓ Token OAuth 2.0 cargado desde archivo');
      } else {
        console.warn('⚠️  No se encontró token OAuth 2.0.');
        console.warn('   Ejecuta: node auth-google.js para obtener el token');
        return;
      }

      // Verificar si el token necesita renovación
      if (token.expiry_date && token.expiry_date <= Date.now()) {
        try {
          const { credentials: newToken } = await oAuth2Client.refreshAccessToken();
          oAuth2Client.setCredentials(newToken);
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(newToken, null, 2));
          console.log('✓ Token OAuth 2.0 renovado');
        } catch (err) {
          console.error('❌ Error renovando token. Ejecuta: node auth-google.js');
          return;
        }
      }

      auth = oAuth2Client;
    } else if (credentials.type === 'service_account') {
      // Manejar Service Account
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
    } else {
      console.warn('⚠️  Tipo de credenciales no reconocido.');
      return;
    }

    drive = google.drive({ version: 'v3', auth });
    
    // Verificar acceso a la carpeta
    try {
      await drive.files.get({ fileId: FOLDER_ID });
      console.log('✓ Google Drive configurado correctamente');
      console.log(`✓ Carpeta ID: ${FOLDER_ID}`);
    } catch (err) {
      console.error('❌ Error accediendo a la carpeta de Drive:', err.message);
      if (isOAuth2) {
        console.error('   Verifica que tengas acceso a la carpeta o ejecuta: node auth-google.js');
      } else {
        console.error('   Verifica que la carpeta esté compartida con el email de la Service Account');
      }
      drive = null;
    }
  } catch (err) {
    console.error('❌ Error inicializando Google Drive:', err.message);
    drive = null;
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

  if (!drive || !FOLDER_ID) {
    return res.status(500).json({
      success: false,
      message: 'Google Drive no está configurado',
    });
  }

  const files = req.files || [];
  if (!files.length) {
    return res.json({ success: true, photos: [] });
  }

  const uploadedPhotos = [];

  try {
    for (const file of files) {
      const fileMetadata = {
        name: file.originalname,
        parents: [FOLDER_ID],
      };

      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink',
      });

      // Hacer el archivo público para que se pueda ver
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Obtener URL de visualización
      const viewUrl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${response.data.id}`;

      uploadedPhotos.push({
        filename: response.data.name,
        url: viewUrl,
        downloadUrl: downloadUrl,
        driveId: response.data.id,
      });

      // Eliminar archivo temporal
      fs.unlinkSync(file.path);
    }

    res.json({ success: true, photos: uploadedPhotos });
  } catch (err) {
    console.error('Error subiendo a Google Drive:', err);
    
    // Limpiar archivos temporales en caso de error
    files.forEach((file) => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    res.status(500).json({
      success: false,
      message: 'Error subiendo fotos a Google Drive: ' + err.message,
    });
  }
});

// Listar fotos
app.get('/photos', async (req, res) => {
  try {
    let photos = [];

    if (drive && FOLDER_ID) {
      // Obtener fotos desde Google Drive
      const response = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and trashed=false and (mimeType='image/png' or mimeType='image/jpeg' or mimeType='image/jpg')`,
        fields: 'files(id, name, createdTime, webViewLink)',
        orderBy: 'createdTime desc',
      });

      photos = response.data.files.map((file) => {
        const viewUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
        
        return {
          filename: file.name,
          url: viewUrl,
          downloadUrl: downloadUrl,
          driveId: file.id,
          created_at: file.createdTime,
        };
      });
    } else {
      // Fallback: leer desde carpeta local si Google Drive no está configurado
      if (fs.existsSync(UPLOADS_DIR)) {
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
    }

    res.json({ success: true, photos });
  } catch (err) {
    console.error('Error obteniendo fotos:', err);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo lista de fotos: ' + err.message,
    });
  }
});

// Descargar foto
app.get('/download/:filename', async (req, res) => {
  const filename = req.params.filename;
  
  if (drive && FOLDER_ID) {
    try {
      // Buscar archivo en Google Drive
      const response = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and name='${filename}' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (response.data.files.length === 0) {
        return res.status(404).send('Archivo no encontrado en Google Drive');
      }

      const fileId = response.data.files[0].id;
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      
      // Redirigir a la URL de descarga de Google Drive
      res.redirect(downloadUrl);
    } catch (err) {
      console.error('Error descargando desde Google Drive:', err);
      res.status(500).send('Error descargando archivo');
    }
  } else {
    // Fallback: descargar desde carpeta local
    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Archivo no encontrado');
    }
    res.download(filePath);
  }
});

// Inicio local
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    await initGoogleDrive();
  });
} else {
  initGoogleDrive();
}

module.exports = app;


