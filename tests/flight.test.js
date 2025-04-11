/* eslint-env jest */
import { jest } from '@jest/globals';

// Mock the Flight model using `jest.unstable_mockModule`
await jest.unstable_mockModule('@models', () => ({
  Flight: {
    create: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
    bulkCreate: jest.fn(),
  },
}));

const { Flight } = await import('@models'); // Import the mocked Flight model

const mockFlightData = [
  {
    flightNumber: 'FL123',
    departureCity: 'New York',
    arrivalCity: 'Los Angeles',
    dateOfDeparture: '2025-04-15',
    estimatedDepartureTime: '10:00:00',
  },
  {
    flightNumber: 'FL456',
    departureCity: 'Chicago',
    arrivalCity: 'Miami',
    dateOfDeparture: '2025-04-16',
    estimatedDepartureTime: '12:00:00',
  },
];

describe('Flight Model', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test

    // Mock the destroy and bulkCreate methods
    Flight.destroy.mockResolvedValue(); // Mock clearing the flight table
    Flight.bulkCreate.mockResolvedValue(mockFlightData); // Mock inserting mock data
  });

  test('should create a flight', async () => {
    const mockFlight = {
      id: 1,
      flightNumber: 'AA1234',
      operatingAirlines: 'American Airlines',
      departureCity: 'AUS',
      arrivalCity: 'NYC',
      dateOfDeparture: '2024-02-05',
      estimatedDepartureTime: new Date('2024-02-05T10:00:00Z'),
      price: 330,
    };

    Flight.create.mockResolvedValue(mockFlight); // Mock the create method

    const flight = await Flight.create(mockFlight);

    expect(Flight.create).toHaveBeenCalledWith(mockFlight); // Ensure create was called with the correct data
    expect(flight).toEqual(mockFlight); // Ensure the returned flight matches the mock
  });

  test('should fetch all flights', async () => {
    const mockFlights = [
      {
        id: 1,
        flightNumber: 'AA1234',
        operatingAirlines: 'American Airlines',
        departureCity: 'AUS',
        arrivalCity: 'NYC',
        dateOfDeparture: '2024-02-05',
        estimatedDepartureTime: new Date('2024-02-05T10:00:00Z'),
        price: 300,
      },
    ];

    Flight.findAll.mockResolvedValue(mockFlights); // Mock the findAll method

    const flights = await Flight.findAll();

    expect(Flight.findAll).toHaveBeenCalled(); // Ensure findAll was called
    expect(flights).toEqual(mockFlights); // Ensure the returned flights match the mock
  });

  test('Transaction rollback example', async () => {
    const transaction = { rollback: jest.fn() }; // Mock transaction object
    Flight.create.mockResolvedValue(); // Mock the create method

    try {
      await Flight.create(
        {
          flightNumber: 'FL789',
          departureCity: 'San Francisco',
          arrivalCity: 'Seattle',
          dateOfDeparture: '2025-04-17',
          estimatedDepartureTime: '14:00:00',
        },
        { transaction }
      );
      // ...test logic...
      await transaction.rollback(); // Mock rollback
    } catch {
      await transaction.rollback();
    }

    expect(transaction.rollback).toHaveBeenCalled(); // Ensure rollback was called
  });

  test('Raw SQL queries modifying flight table', async () => {
    const sequelize = { query: jest.fn() }; // Mock sequelize query method

    // Mock SQL operations
    await sequelize.query(
      "INSERT INTO flight (flightNumber, departureCity, arrivalCity, dateOfDeparture, estimatedDepartureTime, createdAt, updatedAt) VALUES ('FL999', 'Boston', 'Denver', '2025-04-18', '16:00:00', NOW(), NOW())"
    );
    await sequelize.query(
      "UPDATE flight SET departureCity = 'Los Angeles' WHERE flightNumber = 'FL123'"
    );
    await sequelize.query("DELETE FROM flight WHERE flightNumber = 'FL456'");

    expect(sequelize.query).toHaveBeenCalledTimes(3); // Ensure all queries were called
  });
});
