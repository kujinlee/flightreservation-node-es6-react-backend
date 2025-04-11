import express from 'express';
import path from 'path';
import https from 'https';
import http from 'http';
import fs from 'fs';
import dotenv from 'dotenv';
import process from 'process';
import { fileURLToPath } from 'url'; // Import fileURLToPath to convert import.meta.url
import flightRoutes from './routes/flightRoutes.js';
import { sequelize } from './models/index.js'; // Import sequelize and associations from index.js
import errorHandler from './middleware/errorHandler.js';
import { swaggerDocs, swaggerUi } from './config/swaggerConfig.js';
import logger from './utils/logger.js';
import cors from 'cors';

dotenv.config();

const app = express();

// Enable CORS for all origins or specific origins
app.use(
  cors({
    origin: 'http://localhost:3000', // Allow requests from the frontend
    methods: ['GET', 'POST'], // Allow specific HTTP methods
    credentials: true, // Allow cookies if needed
  })
);

// Middleware
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies
app.set('view engine', 'ejs');

// Use mocked `import.meta` in test environment
const __dirname =
  process.env.NODE_ENV === 'test'
    ? global.importMeta.dirname
    : path.dirname(fileURLToPath(import.meta.url));

app.set('views', path.join(__dirname, 'views')); // Convert import.meta.url to file path

// Set global base URL
const BASE_URL =
  process.env.BASE_URL || '/flightreservation-node-es6-react-backend';
app.use((req, res, next) => {
  res.locals.BASE_URL = BASE_URL;
  next();
});
app.use(BASE_URL, flightRoutes);

// Register the global error handler
app.use(errorHandler);

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Load SSL/TLS certificates if HTTPS is enabled
const USE_HTTPS = process.env.USE_HTTPS === 'true';
let server;

if (USE_HTTPS && process.env.NODE_ENV !== 'test') {
  try {
    const sslOptions = {
      key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem')),
    };
    logger.info('SSL options loaded:', sslOptions);
    server = https.createServer(sslOptions, app);
  } catch (error) {
    logger.error('SSL certificates not found. Falling back to HTTP.', error);
    server = http.createServer(app);
  }
} else if (process.env.NODE_ENV !== 'test') {
  server = http.createServer(app);
}

// Skip starting the server in the test environment
if (process.env.NODE_ENV !== 'test') {
  sequelize.sync().then(async () => {
    try {
      const testQuery = await sequelize.query('SELECT 1 + 1 AS result');
      logger.info('Database connection test successful:', testQuery);
    } catch (error) {
      logger.error('Database connection error:', error);
    }

    const PORT = process.env.PORT || 8080; // Internal port the app listens on
    const EXPOSED_PORT = process.env.EXPOSED_PORT || PORT; // External port for containerized environments
    const HOST_PORT = process.env.DOCKER_ENV === 'true' ? EXPOSED_PORT : PORT; // Use EXPOSED_PORT only if DOCKER_ENV=true
    const HOST_URL = process.env.HOST_URL || 'localhost'; // Use HOST_URL from .env or default to 'localhost'

    server.listen(PORT, () => {
      const protocol = USE_HTTPS ? 'https' : 'http';
      logger.info(
        `Server running on ${protocol}://${HOST_URL}:${HOST_PORT}${BASE_URL}`
      );
    });
  });
}

export default app; // Export app for testing
