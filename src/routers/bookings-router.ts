import { getBooking, postBooking, putBooking } from "@/controllers/bookings-controller";
import { authenticateToken, validateBody } from "@/middlewares";
import { postBookingSchema } from "@/schemas/bookings-schemas";
import { Router } from "express";

const bookingsRouter = Router();

bookingsRouter
              .all('/*', authenticateToken)
              .get('/', getBooking)
              .post('/', validateBody(postBookingSchema), postBooking)
              .put('/:bookingId', validateBody(postBookingSchema), putBooking);

export { bookingsRouter };