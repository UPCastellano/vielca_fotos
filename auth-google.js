/**
 * Script para obtener token de acceso OAuth 2.0 de Google Drive
 * Ejecuta este script una vez para obtener el token de acceso
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
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
 */
async function getAccessToken(oAuth2Client) {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  Autorización de Google Drive');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Autoriza esta aplicación visitando esta URL:');
    console.log('\n' + authUrl + '\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Ingresa el código de autorización de la URL: ', (code) => {
      rl.close();

      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          console.error('❌ Error al obtener el token:', err.message);
          reject(err);
          return;
        }

        // Almacenar el token
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
        console.log('\n✓ Token almacenado en:', TOKEN_PATH);
        console.log('✓ ¡Autenticación completada!\n');
        resolve(token);
      });
    });
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
    const oAuth2Client = new OAuth2Client(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uris[0] || 'http://localhost:3000'
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
    await getAccessToken(oAuth2Client);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar autenticación
authenticate();

