import request from 'supertest';
import app from '../../src/app.js';
import { sequelize } from '../../src/models/index.js';
import Flight from '../../src/models/flight.js';

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Reset the database
  await Flight.create({
    id: 1,
    flightNumber: 'AA123',
    operatingAirlines: 'American Airlines',
    departureCity: 'AUS',
    arrivalCity: 'NYC',
    dateOfDeparture: '2024-02-05',
    estimatedDepartureTime: new Date('2024-02-05T10:00:00Z'), // Use a valid Date object
    price: 300,
  });
});

afterAll(async () => {
  await sequelize.close(); // Close the database connection
});

describe('Flight Routes', () => {
  it('should return flights for valid search criteria', async () => {
    const response = await request(app)
      .post('/flightreservation-node-es6-react-backend/findFlights') // Ensure the correct route is used
      .send({ from: 'AUS', to: 'NYC', departureDate: '2024-02-05' });

    expect(response.status).toBe(200);
    expect(response.body.flights).toBeDefined();
    expect(Array.isArray(response.body.flights)).toBe(true);
  });

  it('should return 404 if no flights are found', async () => {
    const response = await request(app)
      .post('/flightreservation-node-es6-react-backend/findFlights') // Ensure the correct route is used
      .send({ from: 'XYZ', to: 'ABC', departureDate: '2024-02-05' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      'No flights found for the given criteria.'
    );
  });
});
