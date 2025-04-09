/* eslint-env jest */
jest.mock('@models', () => ({
  Flight: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
}));

const { Flight } = require('@models');

describe('Flight Model', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test('should create a flight', async () => {
    const mockFlight = {
      id: 1,
      flightNumber: 'AA123',
      operatingAirlines: 'American Airlines',
      departureCity: 'AUS',
      arrivalCity: 'NYC',
      dateOfDeparture: '2024-02-05',
      estimatedDepartureTime: new Date('2024-02-05T10:00:00Z'),
      price: 300,
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
        flightNumber: 'AA123',
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
});
