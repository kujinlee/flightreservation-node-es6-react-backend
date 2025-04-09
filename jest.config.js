export default {
  testEnvironment: 'node', // Use Node.js environment for testing
  transform: {}, // Disable transformations unless needed
  setupFiles: ['./tests/setupTests.js'], // Add setup file
  coverageDirectory: './coverage', // Add coverage directory
  collectCoverageFrom: ['src/**/*.js', '!src/config/**', '!src/views/**'], // Collect coverage from specific files
};
