import { getBooking, postBooking } from "@/controllers/bookings-controller";
import { authenticateToken, validateBody } from "@/middlewares";
import { postBookingSchema } from "@/schemas/bookings-schemas";
import { Router } from "express";

const bookingsRouter = Router();

bookingsRouter
              .all('/*', authenticateToken)
              .get('/', getBooking)
              .post('/', validateBody(postBookingSchema), postBooking) //todo
              .put('/:bookingId') //todo

export { bookingsRouter };