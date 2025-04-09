import { sequelize } from '../../src/models/index.js';
import Flight from '../../src/models/flight.js';

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Reset the database
});

afterAll(async () => {
  await sequelize.close(); // Close the database connection
});

describe('Flight Model', () => {
  it('should create a flight with valid data', async () => {
    const flight = await Flight.create({
      flightNumber: 'AA123',
      operatingAirlines: 'American Airlines',
      departureCity: 'AUS',
      arrivalCity: 'NYC',
      dateOfDeparture: '2024-02-05',
      estimatedDepartureTime: new Date('2024-02-05T10:00:00Z'),
      price: 300,
    });

    expect(flight).toBeDefined();
    expect(flight.flightNumber).toBe('AA123');
    expect(flight.operatingAirlines).toBe('American Airlines');
  });

  it('should fail to create a flight with invalid data', async () => {
    await expect(
      Flight.create({
        flightNumber: null, // Missing required field
        operatingAirlines: 'American Airlines',
        departureCity: 'AUS',
        arrivalCity: 'NYC',
        dateOfDeparture: '2024-02-05',
        estimatedDepartureTime: new Date('2024-02-05T10:00:00Z'),
        price: 300,
      })
    ).rejects.toThrow();
  });
});
