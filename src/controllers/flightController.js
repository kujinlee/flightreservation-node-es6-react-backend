import asyncHandler from '../utils/asyncHandler.js';
import Reservation from '../models/reservation.js';
import Flight from '../models/flight.js';
import Passenger from '../models/passenger.js';
import logger from '../utils/logger.js';
import { validateFields } from '../utils/validateFields.js';

import express from 'express';
const app = express();

app.use(express.json()); // Ensure JSON parsing middleware is applied

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
      res.status(200).json({ flights });
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
    logger.debug('Check-in request body:', req.body);

    const reservation = await Reservation.findByPk(reservationId, {
      include: [
        { model: Flight, as: 'flight' },
        { model: Passenger, as: 'passenger' },
      ],
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    logger.debug('Reservation before update:', reservation.toJSON());

    reservation.numberOfBags = numberOfBags;
    reservation.checkedIn = true;

    await reservation.save();

    logger.debug('Reservation after update:', reservation.toJSON());

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

    validateFields(
      { firstName, lastName, middleName, email, phone },
      Passenger
    );

    const passenger = await Passenger.create({
      firstName,
      lastName,
      middleName: middleName || null,
      email,
      phone,
    });

    logger.debug('Passenger created:', passenger.toJSON());

    validateFields({ flightId, cardNumber, amount }, Reservation);

    const reservation = await Reservation.create({
      flightId,
      passengerId: passenger.id,
      cardNumber,
      amount,
    });

    logger.debug('Reservation created:', reservation.toJSON());

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

    res.json({
      reservation: {
        ...reservation.toJSON(),
        amount: Number(reservation.amount),
      },
      flightDetails: flightDetails.toJSON(),
      passengerDetails: {
        name: `${passenger.firstName} ${passenger.lastName}`,
        email: passenger.email,
      },
      message: 'Reservation created successfully!',
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res
        .status(400)
        .json({ message: 'Validation error', errors: validationErrors });
    }
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const completeReservation = asyncHandler(async (req, res) => {
  console.log('Received request body:', req.body); // Log the entire request body
  const { reservationId } = req.body;
  console.log('Extracted reservationId:', reservationId); // Log the extracted reservationId

  if (!reservationId) {
    console.error('Reservation ID is missing in the request body');
    return res.status(400).json({ message: 'Reservation ID is required' });
  }

  try {
    const reservationCount = await Reservation.count();
    if (reservationCount === 0) {
      console.error('No reservations found in the database');
      return res
        .status(404)
        .json({ message: 'No reservations found in the database' });
    }

    const reservation = await Reservation.findByPk(reservationId, {
      include: [{ model: Passenger, as: 'passenger' }],
    });

    if (!reservation) {
      console.error('Reservation not found for ID:', reservationId);
      return res.status(404).json({ message: 'Reservation not found' });
    }

    console.log('Reservation found:', reservation.toJSON());

    const paymentSuccess = processPayment(
      reservation.cardNumber,
      reservation.amount
    );

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
      console.error('Flight not found for ID:', reservation.flightId);
      return res.status(404).json({ message: 'Flight not found' });
    }

    console.log('Flight details found:', flightDetails.toJSON());

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

function processPayment(cardNumber, amount) {
  logger.debug(`Processing payment for card: ${cardNumber}, amount: ${amount}`);
  return true; // Simulate payment success
}

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.message });
});

export default app;
