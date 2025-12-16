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
      console.warn('\n⚠️  GOOGLE_DRIVE_FOLDER_ID no configurado.');
      console.warn('   La app funcionará sin Google Drive.');
      console.warn('\n   Para configurarlo, ejecuta:');
      console.warn('   .\\iniciar-servidor.ps1');
      console.warn('   O manualmente:');
      console.warn('   $env:GOOGLE_DRIVE_FOLDER_ID="1TWcA0VPWKZFwmcS8jgOB-MazNgfX1SCb"');
      console.warn('   $env:GOOGLE_SERVICE_ACCOUNT_PATH="credentials\\client_secret.json"');
      console.warn('   npm start\n');
      return;
    }

    let auth;
    let credentials;
    let isOAuth2 = false;

    // Intentar cargar credenciales desde archivo o variable de entorno
    if (process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
      const credPath = path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(credPath)) {
        const credData = JSON.parse(fs.readFileSync(credPath, 'utf8'));
        console.log('✓ Archivo de credenciales cargado desde:', credPath);
        
        // Verificar si es OAuth 2.0 (tipo "web")
        if (credData.web) {
          isOAuth2 = true;
          credentials = credData.web;
          console.log('✓ Credenciales OAuth 2.0 detectadas');
        } else if (credData.type === 'service_account') {
          credentials = credData;
          console.log('✓ Credenciales Service Account detectadas');
        } else {
          console.warn('⚠️  Formato de credenciales no reconocido en el archivo');
          console.warn('   El archivo debe contener "web" (OAuth 2.0) o "type": "service_account"');
          return;
        }
      }
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT) {
      try {
        // Limpiar el JSON (eliminar saltos de línea y espacios extra)
        const cleanedJson = process.env.GOOGLE_SERVICE_ACCOUNT.replace(/\n/g, '').replace(/\r/g, '').trim();
        const credData = JSON.parse(cleanedJson);
        console.log('✓ Credenciales cargadas desde variable de entorno');
        
        // Verificar tipo
        if (credData.web) {
          isOAuth2 = true;
          credentials = credData.web;
          console.log('✓ Credenciales OAuth 2.0 detectadas');
        } else if (credData.type === 'service_account') {
          credentials = credData;
          console.log('✓ Credenciales Service Account detectadas');
        } else {
          console.warn('⚠️  Formato de credenciales no reconocido');
          return;
        }
      } catch (err) {
        console.error('❌ Error parseando GOOGLE_SERVICE_ACCOUNT:', err.message);
        console.error('   Verifica que el JSON esté en una sola línea y sea válido');
        return;
      }
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

      // Intentar cargar token guardado (desde archivo o variable de entorno)
      let token;
      if (process.env.GOOGLE_DRIVE_TOKEN) {
        // Cargar desde variable de entorno (para Render/Vercel/producción)
        try {
          // Limpiar el JSON (eliminar saltos de línea y espacios extra)
          const cleanedTokenJson = process.env.GOOGLE_DRIVE_TOKEN.replace(/\n/g, '').replace(/\r/g, '').trim();
          token = JSON.parse(cleanedTokenJson);
          oAuth2Client.setCredentials(token);
          console.log('✓ Token OAuth 2.0 cargado desde variable de entorno');
        } catch (err) {
          console.error('❌ Error parseando GOOGLE_DRIVE_TOKEN:', err.message);
          console.error('   Verifica que el JSON del token esté en una sola línea y sea válido');
          console.error('   Ejecuta: node auth-google.js y copia el token correctamente');
          return;
        }
      } else if (fs.existsSync(TOKEN_PATH)) {
        // Cargar desde archivo (para desarrollo local)
        token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        oAuth2Client.setCredentials(token);
        console.log('✓ Token OAuth 2.0 cargado desde archivo');
      } else {
        console.warn('⚠️  No se encontró token OAuth 2.0.');
        console.warn('   Ejecuta: node auth-google.js para obtener el token');
        console.warn('   O configura GOOGLE_DRIVE_TOKEN en las variables de entorno');
        return;
      }

      // Verificar si el token necesita renovación
      if (token.expiry_date && token.expiry_date <= Date.now()) {
        try {
          const { credentials: newToken } = await oAuth2Client.refreshAccessToken();
          oAuth2Client.setCredentials(newToken);
          // Solo guardar si existe el archivo (no en producción)
          if (fs.existsSync(TOKEN_PATH)) {
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(newToken, null, 2));
          }
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
      const folderInfo = await drive.files.get({ fileId: FOLDER_ID });
      console.log('✓ Google Drive configurado correctamente');
      console.log(`✓ Carpeta ID: ${FOLDER_ID}`);
      console.log(`✓ Nombre de carpeta: ${folderInfo.data.name}`);
      
      // Verificar cuántas fotos hay
      const photosCheck = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and trashed=false and (mimeType='image/png' or mimeType='image/jpeg' or mimeType='image/jpg')`,
        fields: 'files(id, name)',
        pageSize: 1,
      });
      console.log(`✓ Fotos disponibles en la carpeta: ${photosCheck.data.files.length > 0 ? 'Sí (más de 1)' : '0'}`);
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

// Carpeta de subidas (para fallback local)
const UPLOADS_DIR = process.env.VERCEL || process.env.RENDER
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer: solo PNG y JPG
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

// Variable para controlar si se permite subir fotos
const UPLOAD_ENABLED = process.env.ENABLE_UPLOAD !== 'false';

// Ruta para verificar si la subida está habilitada
app.get('/api/upload-status', (req, res) => {
  res.json({ enabled: UPLOAD_ENABLED });
});

// Subir fotos (protegido)
app.post('/upload', upload.any(), async (req, res) => {
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

      // Usar nuestro servidor para servir las imágenes (evita problemas de CORS y permisos)
      const viewUrl = `/image/${response.data.id}`;
      const downloadUrl = `/download/${encodeURIComponent(response.data.name)}`;

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
    console.log('\n[GET /photos] Solicitud recibida');
    console.log('  - drive configurado:', !!drive);
    console.log('  - FOLDER_ID:', FOLDER_ID || 'NO CONFIGURADO');
    
    let photos = [];

    if (drive && FOLDER_ID) {
      console.log('  - Obteniendo fotos desde Google Drive...');
      // Obtener fotos desde Google Drive
      const response = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and trashed=false and (mimeType='image/png' or mimeType='image/jpeg' or mimeType='image/jpg')`,
        fields: 'files(id, name, createdTime, webViewLink)',
        orderBy: 'createdTime desc',
      });

      console.log(`  - Archivos encontrados en Drive: ${response.data.files.length}`);

      // Hacer los archivos públicos y obtener URLs
      photos = await Promise.all(
        response.data.files.map(async (file) => {
          try {
            // Intentar hacer el archivo público si no lo está
            try {
              await drive.permissions.create({
                fileId: file.id,
                requestBody: {
                  role: 'reader',
                  type: 'anyone',
                },
              });
            } catch (permErr) {
              // Ignorar si ya es público o hay error de permisos
              console.log(`  - Archivo ${file.name} ya es público o no se pudo cambiar permisos`);
            }

            // Usar nuestro servidor para servir las imágenes (evita problemas de CORS y permisos)
            const viewUrl = `/image/${file.id}`;
            const downloadUrl = `/download/${encodeURIComponent(file.name)}`;
            
            return {
              filename: file.name,
              url: viewUrl,
              downloadUrl: downloadUrl,
              driveId: file.id,
              created_at: file.createdTime,
            };
          } catch (err) {
            console.error(`  ⚠️  Error procesando ${file.name}:`, err.message);
            // Retornar con URL básica aunque falle
            return {
              filename: file.name,
              url: `/image/${file.id}`,
              downloadUrl: `/download/${encodeURIComponent(file.name)}`,
              driveId: file.id,
              created_at: file.createdTime,
            };
          }
        })
      );

      console.log(`✓ ${photos.length} fotos procesadas y enviadas al cliente`);
    } else {
      console.log('  ⚠️  Google Drive no configurado, usando fallback local');
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
        console.log(`  - ${photos.length} fotos encontradas localmente`);
      } else {
        console.log('  - No se encontró carpeta local de uploads');
      }
    }

    console.log(`[GET /photos] Respuesta: ${photos.length} fotos\n`);
    res.json({ success: true, photos });
  } catch (err) {
    console.error('[GET /photos] ERROR:', err.message);
    console.error('  Stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo lista de fotos: ' + err.message,
    });
  }
});

// Servir imagen desde Google Drive (nuevo endpoint)
app.get('/image/:fileId', async (req, res) => {
  const fileId = req.params.fileId;
  
  if (!drive) {
    return res.status(500).send('Google Drive no configurado');
  }

  try {
    // Obtener el archivo desde Google Drive
    const fileResponse = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    // Establecer headers apropiados
    res.setHeader('Content-Type', fileResponse.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    // Enviar el stream de la imagen
    fileResponse.data.pipe(res);
  } catch (err) {
    console.error(`Error sirviendo imagen ${fileId}:`, err.message);
    res.status(500).send('Error cargando imagen');
  }
});

// Descargar foto
app.get('/download/:filename', async (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  
  if (drive && FOLDER_ID) {
    try {
      // Buscar archivo en Google Drive
      const response = await drive.files.list({
        q: `'${FOLDER_ID}' in parents and name='${filename.replace(/'/g, "\\'")}' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (response.data.files.length === 0) {
        return res.status(404).send('Archivo no encontrado en Google Drive');
      }

      const fileId = response.data.files[0].id;
      
      // Servir el archivo directamente desde Google Drive
      try {
        const fileResponse = await drive.files.get(
          { fileId, alt: 'media' },
          { responseType: 'stream' }
        );
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', fileResponse.headers['content-type'] || 'application/octet-stream');
        fileResponse.data.pipe(res);
      } catch (err) {
        console.error('Error descargando desde Google Drive:', err);
        res.status(500).send('Error descargando archivo');
      }
    } catch (err) {
      console.error('Error buscando archivo:', err);
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

// Servir archivos estáticos DESPUÉS de las rutas de API
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    // Asegurar MIME types correctos para Render
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
  }
}));
app.use('/uploads', express.static(UPLOADS_DIR));

// Ruta catch-all para SPA - debe ir al final
app.get('*', (req, res) => {
  // Si no es una ruta de API, servir index.html
  if (!req.path.startsWith('/api') && !req.path.startsWith('/photos') && 
      !req.path.startsWith('/upload') && !req.path.startsWith('/download') &&
      !req.path.startsWith('/image')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).send('Not found');
  }
});

// Inicio local
if (!process.env.VERCEL && !process.env.RENDER) {
  app.listen(PORT, async () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    await initGoogleDrive();
  });
} else {
  initGoogleDrive();
}

module.exports = app;
