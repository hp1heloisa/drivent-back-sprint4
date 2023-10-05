import { getBooking } from "@/controllers/bookings-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const bookingsRouter = Router();

bookingsRouter
              .all('/*', authenticateToken)
              .get('/', getBooking)
              .post('/') //todo
              .put('/:bookingId') //todo

export { bookingsRouter };