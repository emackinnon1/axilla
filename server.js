const express = require('express');
const path = require('path');
const axillaHandler = require('./functions/axilla/axilla');
const config = require('./config');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

const app = express();
const port = config.PORT || 3000;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the static directory
app.use(express.static('static'));

// Add middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Verify pixlet is working before starting the server
try {
  // Check if we can run pixlet
  const pixletBinary = config.PIXLET_BINARY_PATH ? 
    path.join(config.PIXLET_BINARY_PATH, config.PIXLET_BINARY) : 
    config.PIXLET_BINARY;
  
  console.log(`Verifying pixlet binary: ${pixletBinary}`);
  const pixletVersion = execSync(`${pixletBinary} version`).toString().trim();
  console.log(`Pixlet version detected: ${pixletVersion}`);
} catch (error) {
  console.error('ERROR: Unable to run pixlet binary. Please ensure pixlet is installed and properly configured.');
  console.error(`Error details: ${error.message}`);
  process.exit(1);
}

// Handle all requests to the root route
app.all('/', async (req, res) => {
  try {
    // Convert Express request to Lambda-style event format
    const event = {
      httpMethod: req.method,
      queryStringParameters: req.query,
      headers: req.headers,
      body: req.body ? JSON.stringify(req.body) : null
    };
    
    console.log('Processing request with params:', JSON.stringify(req.query));
    
    // Call the axilla handler
    const response = await axillaHandler.handler(event);
    
    // Set status code
    res.status(response.statusCode);
    
    // Set headers
    if (response.headers) {
      Object.keys(response.headers).forEach(header => {
        res.setHeader(header, response.headers[header]);
      });
    }
    
    // Handle base64 encoded responses (images)
    if (response.isBase64Encoded) {
      const buffer = Buffer.from(response.body, 'base64');
      res.end(buffer);
    } else {
      res.send(response.body);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    console.error('Error stack:', error.stack);
    res.status(500).send(`Server Error: ${error.message}\n\nCheck the console for more details.`);
  }
});

// Add a diagnostic endpoint
app.get('/system-info', (req, res) => {
  const info = {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    tmpdir: os.tmpdir(),
    hostname: os.hostname(),
    pixlet: {
      binary: config.PIXLET_BINARY,
      path: config.PIXLET_BINARY_PATH,
      ldLibraryPath: process.env.LD_LIBRARY_PATH || config.LD_LIBRARY_PATH
    },
    node: process.version
  };
  
  // Check if we can access the temp directory
  try {
    fs.accessSync(os.tmpdir(), fs.constants.R_OK | fs.constants.W_OK);
    info.tmpDirAccess = 'Read/Write OK';
  } catch (e) {
    info.tmpDirAccess = `Error: ${e.message}`;
  }
  
  res.json(info);
});

app.listen(port, () => {
  console.log(`Axilla server running at http://${config.HOST || 'localhost'}:${port}`);
  console.log(`Using Pixlet binary: ${config.PIXLET_BINARY_PATH || ''}${config.PIXLET_BINARY}`);
  console.log(`Using LD_LIBRARY_PATH: ${process.env.LD_LIBRARY_PATH || config.LD_LIBRARY_PATH || 'none'}`);
  console.log(`Temporary directory: ${os.tmpdir()}`);
});