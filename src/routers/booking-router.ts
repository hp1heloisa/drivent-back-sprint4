import { getBooking, postBooking, putBooking } from "@/controllers/booking-controller";
import { authenticateToken, validateBody } from "@/middlewares";
import { postBookingSchema } from "@/schemas/booking-schemas";
import { Router } from "express";

const bookingsRouter = Router();

bookingsRouter
              .all('/*', authenticateToken)
              .get('/', getBooking)
              .post('/', validateBody(postBookingSchema), postBooking)
              .put('/:bookingId', validateBody(postBookingSchema), putBooking);

export { bookingsRouter };