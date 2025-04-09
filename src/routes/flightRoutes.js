import express from 'express';
import {
  findFlights,
  createReservation,
  completeReservation,
  completeCheckIn,
  renderCheckInPage, // Ensure this is still used for JSON responses
} from '../controllers/flightController.js';

const router = express.Router();

// Route to find flights
router.post('/findFlights', findFlights);

// Route to create a reservation
router.post('/createReservation', createReservation);

// Route to complete a reservation (simulate payment)
router.post('/completeReservation', completeReservation);

// Route to complete check-in
router.post('/completeCheckIn', completeCheckIn);

// Route to fetch check-in page data (returns JSON)
router.get('/checkIn', renderCheckInPage);

export default router;
