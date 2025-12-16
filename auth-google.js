/**
 * Script para obtener token de acceso OAuth 2.0 de Google Drive
 * Ejecuta este script una vez para obtener el token de acceso
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Rutas de archivos
const CREDENTIALS_PATH = path.join(__dirname, 'credentials', 'client_secret.json');
const TOKEN_PATH = path.join(__dirname, 'credentials', 'token.json');

// Scopes necesarios para Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive'];

/**
 * Lee las credenciales desde el archivo
 */
function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`No se encontró el archivo de credenciales en: ${CREDENTIALS_PATH}`);
  }

  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
  const credentials = JSON.parse(content);

  if (!credentials.web) {
    throw new Error('El archivo de credenciales no contiene configuración OAuth 2.0 (web)');
  }

  return credentials.web;
}

/**
 * Obtiene y almacena el token después de que el usuario autoriza la aplicación
 * Usa un servidor HTTP temporal para capturar el código automáticamente
 */
async function getAccessToken(oAuth2Client, redirectUri) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const url = require('url');
    
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // Forzar consentimiento para obtener refresh token
      redirect_uri: redirectUri, // Usar el redirect_uri exacto de las credenciales
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Autorización de Google Drive');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Redirect URI configurado:', redirectUri);
    console.log('\n⚠️  IMPORTANTE: Asegúrate de que este Redirect URI esté');
    console.log('   configurado en Google Cloud Console:');
    console.log('   https://console.cloud.google.com/apis/credentials\n');
    console.log('1. Se abrirá tu navegador automáticamente...');
    console.log('2. Inicia sesión con tu cuenta de Google');
    console.log('3. Haz clic en "Permitir" para dar acceso\n');

    // Crear servidor HTTP temporal para capturar el código
    const server = http.createServer(async (req, res) => {
      try {
        const queryObject = url.parse(req.url, true).query;
        
        if (queryObject.code) {
          const code = queryObject.code;
          
          // Obtener el token
          const { tokens } = await oAuth2Client.getToken(code);
          oAuth2Client.setCredentials(tokens);

          // Almacenar el token
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
          
          // Responder al navegador
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <head>
                <title>Autorización Exitosa</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  }
                  .container {
                    background: white;
                    padding: 40px;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    text-align: center;
                  }
                  h1 { color: #4CAF50; }
                  p { color: #666; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>✓ ¡Autorización Exitosa!</h1>
                  <p>Puedes cerrar esta ventana y volver a la consola.</p>
                  <p>El token se ha guardado correctamente.</p>
                </div>
              </body>
            </html>
          `);
          
          server.close();
          console.log('\n✓ Token almacenado en:', TOKEN_PATH);
          console.log('✓ ¡Autenticación completada!\n');
          resolve(tokens);
        } else if (queryObject.error) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <head><title>Error de Autorización</title></head>
              <body>
                <h1>Error: ${queryObject.error}</h1>
                <p>${queryObject.error_description || ''}</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error(queryObject.error_description || queryObject.error));
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<html><body><h1>Esperando autorización...</h1></body></html>');
        }
      } catch (err) {
        server.close();
        reject(err);
      }
    });

    // Escuchar en el puerto 3000
    server.listen(3000, () => {
      console.log('✓ Servidor temporal iniciado en http://localhost:3000');
      console.log('\nAbriendo navegador...\n');
      
      // Abrir el navegador automáticamente
      const { exec } = require('child_process');
      const platform = process.platform;
      let command;
      
      if (platform === 'win32') {
        command = `start "" "${authUrl}"`;
      } else if (platform === 'darwin') {
        command = `open "${authUrl}"`;
      } else {
        command = `xdg-open "${authUrl}"`;
      }
      
      exec(command, (err) => {
        if (err) {
          console.log('⚠️  No se pudo abrir el navegador automáticamente.');
          console.log('   Por favor, abre esta URL manualmente:');
          console.log('\n' + authUrl + '\n');
        }
      });
    });

    // Timeout después de 5 minutos
    setTimeout(() => {
      server.close();
      reject(new Error('Tiempo de espera agotado. Por favor, intenta de nuevo.'));
    }, 300000);
  });
}

/**
 * Autentica y obtiene token de acceso
 */
async function authenticate() {
  try {
    console.log('Cargando credenciales...');
    const credentials = loadCredentials();

    const { OAuth2Client } = require('google-auth-library');
    const redirectUri = credentials.redirect_uris[0] || 'http://localhost:3000';
    const oAuth2Client = new OAuth2Client(
      credentials.client_id,
      credentials.client_secret,
      redirectUri
    );

    // Verificar si ya existe un token
    if (fs.existsSync(TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      oAuth2Client.setCredentials(token);

      // Verificar si el token es válido
      try {
        const drive = google.drive({ version: 'v3', auth: oAuth2Client });
        await drive.files.list({ pageSize: 1 });
        console.log('✓ Token existente es válido. No es necesario re-autenticar.');
        return;
      } catch (err) {
        console.log('⚠️  Token existente expirado o inválido. Obteniendo nuevo token...\n');
      }
    }

    // Obtener nuevo token
    await getAccessToken(oAuth2Client, redirectUri);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar autenticación
authenticate();

