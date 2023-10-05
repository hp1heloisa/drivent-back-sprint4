import { AuthenticatedRequest } from "@/middlewares";
import { bookingsService } from "@/services/bookings-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response){
    const { userId } = req;
    const bookingInfo = await bookingsService.getBooking(userId);
    res.status(httpStatus.OK).send(bookingInfo);
}

export async function postBooking(req: AuthenticatedRequest, res: Response){
    const { userId } = req;
    const { roomId } = req.body;
    const request = await bookingsService.postBooking(userId, roomId);
    res.status(httpStatus.OK).send(request);
}