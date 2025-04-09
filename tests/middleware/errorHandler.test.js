import errorHandler from '../../src/middleware/errorHandler.js';
import { jest } from '@jest/globals'; // Import jest for mocking

describe('Error Handler Middleware', () => {
  it('should handle errors and send a response', () => {
    const mockReq = {}; // Mock request object
    const mockRes = {
      status: jest.fn().mockReturnThis(), // Mock status method
      send: jest.fn(), // Mock send method
    };
    const mockNext = jest.fn(); // Mock next function

    const error = new Error('Test error'); // Create a test error
    errorHandler(error, mockReq, mockRes, mockNext); // Call the error handler

    // Assertions
    expect(mockRes.status).toHaveBeenCalledWith(500); // Ensure status 500 is set
    expect(mockRes.send).toHaveBeenCalledWith({
      error: 'An unexpected error occurred.',
      details: 'Test error',
      stack: expect.any(String), // Ensure stack trace is included
    });
  });
});
