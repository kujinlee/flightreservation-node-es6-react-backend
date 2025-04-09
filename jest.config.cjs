//Jest expects its configuration file to be in CommonJS format.
module.exports = {
  testEnvironment: 'node', // Use Node.js environment for backend tests
  moduleDirectories: ['node_modules', 'src'], // Add 'src' for module resolution
  transform: {}, // Disable transformations unless needed
  setupFiles: ['./tests/setupTests.js'], // Add setup file
  coverageDirectory: './coverage', // Add coverage directory
  collectCoverageFrom: ['src/**/*.js', '!src/config/**', '!src/views/**'], // Collect coverage from specific files
  moduleNameMapper: {
    '^@models$': '<rootDir>/src/models', // Alias for models
  },
};
