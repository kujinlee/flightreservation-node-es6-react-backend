import path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_ENV = 'test';
process.env.BACKEND_APP_BASE_URL = '/flightreservation-node-es6-react-backend'; // Add backend base URL

// Log the current environment
console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Current BACKEND_APP_BASE_URL:', process.env.BACKEND_APP_BASE_URL);

// Derive `__filename` and `__dirname` using `import.meta.url`
global.__filename = fileURLToPath(import.meta.url);
global.__dirname = path.dirname(global.__filename);

// Define `global.importMeta` for compatibility
global.importMeta = {
  url: import.meta.url,
  dirname: global.__dirname,
};
