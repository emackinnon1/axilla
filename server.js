const express = require('express');
const path = require('path');
const axillaHandler = require('./functions/axilla/axilla');
const config = require('./config');

const app = express();
const port = config.PORT;

// Serve static files from the static directory
app.use(express.static('static'));

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
    res.status(500).send('Server Error: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Axilla server running at http://${config.HOST}:${port}`);
  console.log(`Using Pixlet binary: ${config.PIXLET_BINARY}`);
});