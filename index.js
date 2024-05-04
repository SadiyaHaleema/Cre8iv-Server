
const https = require('https');
const fs = require('fs');
const port = 3001;

// SSL certificate and key
const key = fs.readFileSync('./cert/CA/localhost/localhost.decrypted.key');
const cert = fs.readFileSync('./cert/CA/localhost/localhost.crt');

const app = require('./app');

// Create an HTTPS server
const httpsServer = https.createServer({ key, cert }, app);

// Listen on the specified port
httpsServer.listen(port, () => {
  console.log("Server is running on https://cre8iv-server.vercel.app");
});
