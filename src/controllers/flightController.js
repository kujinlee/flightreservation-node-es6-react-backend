import asyncHandler from '../utils/asyncHandler.js';
import Reservation from '../models/reservation.js';
import Flight from '../models/flight.js';
import Passenger from '../models/passenger.js';
import logger from '../utils/logger.js';
import { validateFields } from '../utils/validateFields.js';

export const findFlights = asyncHandler(async (req, res) => {
  const { from, to, departureDate } = req.body;

  try {
    const flights = await Flight.findAll({
      where: {
        departureCity: from,
        arrivalCity: to,
        dateOfDeparture: departureDate,
      },
    });

    if (flights.length > 0) {
      res.status(200).json({ flights }); // Explicitly set status 200
    } else {
      res
        .status(404)
        .json({ message: 'No flights found for the given criteria.' });
    }
  } catch (error) {
    logger.error('Error fetching flights:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export const completeCheckIn = asyncHandler(async (req, res) => {
  const { reservationId, numberOfBags } = req.body;

  try {
    logger.debug('MYLOG: Check-in request body:', req.body);

    const reservation = await Reservation.findByPk(reservationId, {
      include: [
        { model: Flight, as: 'flight' }, // Include flight details
        { model: Passenger, as: 'passenger' }, // Include passenger details
      ],
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    logger.debug('MYLOG: Reservation before update:', reservation.toJSON());

    // Update the reservation with the number of bags and mark it as checked in
    reservation.numberOfBags = numberOfBags;
    reservation.checkedIn = true;

    // Ensure the save method is called
    await reservation.save();

    logger.debug('MYLOG: Reservation after update:', reservation.toJSON());

    // Return confirmation details as JSON
    res.json({
      message: 'Check-in completed successfully!',
      reservation: reservation.toJSON(),
      flight: reservation.flight.toJSON(),
      passenger: reservation.passenger.toJSON(),
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export const createReservation = asyncHandler(async (req, res) => {
  const {
    flightId,
    firstName,
    lastName,
    middleName,
    email,
    phone,
    cardNumber,
    amount,
  } = req.body;

  try {
    logger.debug('Creating reservation with data:', {
      flightId,
      firstName,
      lastName,
      email,
    });

    // Validate passenger fields
    validateFields(
      { firstName, lastName, middleName, email, phone },
      Passenger
    );

    // Save passenger information
    const passenger = await Passenger.create({
      firstName,
      lastName,
      middleName: middleName || null,
      email,
      phone,
    });

    logger.debug('Passenger created:', passenger.toJSON());

    // Validate reservation fields
    validateFields({ flightId, cardNumber, amount }, Reservation);

    // Create the reservation
    const reservation = await Reservation.create({
      flightId,
      passengerId: passenger.id,
      cardNumber,
      amount,
    });

    logger.debug('Reservation created:', reservation.toJSON());

    // Fetch flight details
    const flightDetails = await Flight.findByPk(flightId, {
      attributes: [
        'flightNumber',
        'departureCity',
        'arrivalCity',
        'dateOfDeparture',
        'estimatedDepartureTime',
      ],
    });
    if (!flightDetails) {
      logger.debug('Flight not found for reservation:', { flightId });
      return res.status(404).json({ message: 'Flight not found' });
    }

    logger.debug(
      'Flight details fetched for reservation:',
      flightDetails.toJSON()
    );

    // Return reservation details as JSON
    res.json({
      reservation: {
        ...reservation.toJSON(),
        amount: Number(reservation.amount), // Ensure amount is a number
      },
      flightDetails: flightDetails.toJSON(),
      passengerDetails: {
        name: `${passenger.firstName} ${passenger.lastName}`,
        email: passenger.email,
      },
      message: 'Reservation created successfully!',
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export const completeReservation = asyncHandler(async (req, res) => {
  const { reservationId } = req.body;

  if (!reservationId) {
    return res.status(400).json({ message: 'Reservation ID is required' });
  }

  try {
    // Fetch reservation and associated passenger
    const reservation = await Reservation.findByPk(reservationId, {
      include: [{ model: Passenger, as: 'passenger' }],
    });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Placeholder for external payment processing
    const paymentSuccess = processPayment(
      reservation.cardNumber,
      reservation.amount
    );

    // Fetch flight details
    const flightDetails = await Flight.findByPk(reservation.flightId, {
      attributes: [
        'flightNumber',
        'departureCity',
        'arrivalCity',
        'dateOfDeparture',
        'estimatedDepartureTime',
      ],
    });
    if (!flightDetails) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Return confirmation details as JSON
    res.json({
      message: paymentSuccess
        ? 'Payment processed successfully! You can now check in.'
        : 'Payment failed. Please try again.',
      reservation: reservation.toJSON(),
      flightDetails: flightDetails.toJSON(),
      passengerDetails: {
        name: `${reservation.passenger.firstName} ${reservation.passenger.lastName}`,
        email: reservation.passenger.email,
      },
    });
  } catch (error) {
    console.error('Error completing reservation:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export const renderCheckInPage = asyncHandler(async (req, res) => {
  const { reservationId } = req.query;

  if (!reservationId) {
    return res.status(400).json({ message: 'Reservation ID is required' });
  }

  try {
    const reservation = await Reservation.findByPk(reservationId, {
      include: [
        { model: Flight, as: 'flight' },
        { model: Passenger, as: 'passenger' },
      ],
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Return reservation details as JSON
    res.json({
      message: 'Check-in page data retrieved successfully!',
      reservation: reservation.toJSON(),
      flight: reservation.flight.toJSON(),
      passenger: reservation.passenger.toJSON(),
    });
  } catch (error) {
    console.error('Error retrieving check-in page data:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Simulates an external payment processing system
function processPayment(cardNumber, amount) {
  logger.debug(`Processing payment for card: ${cardNumber}, amount: ${amount}`);
  // Simulate payment success
  return true; // Always returns true for now, but can be extended for real payment logic
}
