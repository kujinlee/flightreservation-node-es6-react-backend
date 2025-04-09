import { config } from '../config';

describe('Test API Endpoints', () => {
  it('should use the correct BASE_URL', () => {
    expect(config.baseUrl).toBe('/flightreservation-node-es6-react-backend');
  });
});
