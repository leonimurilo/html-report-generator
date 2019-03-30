process.env.NODE_CONFIG_DIR = 'server/config';

const config = require('config');
const log4js = require('log4js');
const express = require('express');
const morgan = require('morgan');
const http = require('http');
const cors = require('cors');
const router = require('./router');

/**
 * Create Express server.
 */
const app = express();

// allow cors
app.use(cors());

app.use(morgan('combined'));

// setup router for the app
router(app);

// server setup
const port = process.env.PORT || 9999;
const server = http.createServer(app);
server.listen(port);
console.log('Server listening on:', port);
