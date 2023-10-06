import { prisma } from '@/config';

async function getBooking(userId: number) {
    const result = await prisma.booking.findFirst({
        where: {userId},
        select: {
            id: true,
            Room: true
        }
    })
    return result;
}

async function getBookingByRoomId(roomId: number){
    const result = await prisma.booking.findMany({
        where: {
            roomId
        }
    })
    return result;
}

async function postBooking(userId: number, roomId: number) {
    const result = await prisma.booking.create({
        data: {
            userId,
            roomId
        }
    })
    return result;
}

async function putBooking(bookingId: number, roomId: number){
    const result = await prisma.booking.update({
        where: {
            id: bookingId
        },
        data: {
            roomId
        }
    })
    return result;
}

export const bookingsRepository = {
    getBooking,
    getBookingByRoomId,
    postBooking,
    putBooking
}