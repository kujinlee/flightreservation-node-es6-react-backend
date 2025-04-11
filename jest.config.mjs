export default {
  testEnvironment: 'node', // Use Node.js environment for backend tests
  moduleDirectories: ['node_modules', 'src'], // Add 'src' for module resolution
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Use Babel to transform JavaScript files
  },
  setupFiles: ['./tests/setupTests.js'], // Add setup file
  coverageDirectory: './coverage', // Add coverage directory
  collectCoverageFrom: ['src/**/*.js', '!src/config/**', '!src/views/**'], // Collect coverage from specific files
  moduleNameMapper: {
    '^@models$': '<rootDir>/src/models', // Alias for models
  },
  globals: {
    'babel-jest': {
      useESM: true, // Enable ES Modules for Babel
    },
  },
};
