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

export const bookingsRepository = {
    getBooking
}