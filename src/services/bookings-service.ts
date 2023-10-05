import { notFoundError } from "@/errors";
import { bookingsRepository } from "@/repositories/bookings-repository"

async function getBooking(userId: number){
    console.log(userId)
    const bookingRes = await bookingsRepository.getBooking(userId);
    if (!bookingRes) throw notFoundError();
    return bookingRes;
}

export const bookingsService = {
    getBooking
}