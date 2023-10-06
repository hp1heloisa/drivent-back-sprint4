import { forbidenError, notFoundError } from "@/errors";
import { enrollmentRepository, hotelRepository, ticketsRepository } from "@/repositories";
import { bookingsRepository } from "@/repositories/bookings-repository";
import { bookingsService } from "@/services/bookings-service";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("getBooking test", () => {
    it("should return notFoundError when there is no booking", async () => {
        jest.spyOn(bookingsRepository, "getBooking").mockResolvedValue(null);

        const promise = bookingsService.getBooking(1);

        expect(promise).rejects.toEqual(notFoundError());
    });

    it("should return the user booking", async () => {
        jest.spyOn(bookingsRepository, "getBooking").mockImplementationOnce((): any => {
            return{
                id: 2,
                Room: {
                    id: 15,
                    name: "Quarto 01",
                    capacity: 2,
                    hotelId: 3,
                    createdAt: "2023-10-05T11:30:12.167Z",
                    updatedAt: "2023-10-05T11:30:12.167Z"
                }
        }});

        const booking = await bookingsService.getBooking(1);

        expect(booking).toEqual({
            id: 2,
            Room: {
                id: 15,
                name: "Quarto 01",
                capacity: 2,
                hotelId: 3,
                createdAt: "2023-10-05T11:30:12.167Z",
                updatedAt: "2023-10-05T11:30:12.167Z"
            }
        });
    });
});

describe("postBooking test", () => {
    it("should return forbidenError when ticket is remote", async () => {
        jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
            return {
                id: 1
            }
        });

        jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => {
            return {
                TicketType: {
                    isRemote: true,
                    includesHotel: true,
                    status: "PAID"
                }
            }
        });

        const promise = bookingsService.postBooking(1,2);

        expect(promise).rejects.toEqual(forbidenError());
    });

    it("should return forbidenError when ticket doesn't include hotel", async () => {
        jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
            return {
                id: 1
            }
        });

        jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => {
            return {
                status: "PAID",
                TicketType: {
                    isRemote: false,
                    includesHotel: false,
                }
            }
        });

        const promise = bookingsService.postBooking(1,2);
        
        expect(promise).rejects.toEqual(forbidenError());
    });

    it("should return forbidenError when ticket is not paid", async () => {
        jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
            return {
                id: 1
            }
        });

        jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => {
            return {
                status: "RESERVED",
                TicketType: {
                    isRemote: false,
                    includesHotel: true,
                }
            }
        });

        const promise = bookingsService.postBooking(1,2);
        
        expect(promise).rejects.toEqual(forbidenError());
    });

    it("should return notFounError when didn't find room", async () => {
        jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
            return {
                id: 1
            }
        });

        jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => {
            return {
                status: 'PAID',
                TicketType: {
                    isRemote: false,
                    includesHotel: true,
                }
            }
        });

        jest.spyOn(hotelRepository, "findRoomById").mockResolvedValue(null);

        const promise = bookingsService.postBooking(1,2);

        expect(promise).rejects.toEqual(notFoundError());
    });

    it("should return forbidenError when room is full", async () => {
        jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
            return {
                id: 1
            }
        });

        jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => {
            return {
                status: 'PAID',
                TicketType: {
                    isRemote: false,
                    includesHotel: true,
                }
            }
        });

        jest.spyOn(hotelRepository, "findRoomById").mockImplementationOnce((): any => {
            return {
                id: 1,
                capacity: 0
            }
        });

        jest.spyOn(bookingsRepository, "getBookingByRoomId").mockImplementationOnce(():any => { return [
            {id: 1, userId: 1, roomId: 1},
            {id: 2, userId: 2, roomId: 1}
        ]});

        const promise = bookingsService.postBooking(3, 1);

        expect(promise).rejects.toEqual(forbidenError());
    });

    it("should return bookingId", async () => {
        jest.spyOn(enrollmentRepository, "findWithAddressByUserId").mockImplementationOnce((): any => {
            return {
                id: 1
            }
        });

        jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockImplementationOnce((): any => {
            return {
                status: 'PAID',
                TicketType: {
                    isRemote: false,
                    includesHotel: true,
                }
            }
        });

        jest.spyOn(hotelRepository, "findRoomById").mockImplementationOnce((): any => {
            return {
                id: 1,
                capacity: 2
            }
        });

        jest.spyOn(bookingsRepository, "getBookingByRoomId").mockImplementationOnce(():any => { return [
            {id: 1, userId: 1, roomId: 1}
        ]});

        jest.spyOn(bookingsRepository, "postBooking").mockImplementationOnce((): any => {
            return {
                id: 1
            }
        });

        const booking = await bookingsService.postBooking(2, 1);

        expect(booking).toEqual({
            bookingId: 1
        });
    });
});

describe("putBooking test", () => {
    it("should return forbidenError when user has no booking", async () => {
        jest.spyOn(bookingsRepository, "getBooking").mockResolvedValue(null);
        
        const promise = bookingsService.putBooking(1, 2, 3);

        expect(promise).rejects.toEqual(forbidenError());
    });

    it("should return notFounError when didn't find room", async () => {
        jest.spyOn(bookingsRepository, "getBooking").mockImplementationOnce((): any => {
            return { id: 1, userId: 1, roomId: 1}
        })

        jest.spyOn(hotelRepository, "findRoomById").mockResolvedValue(null);

        const promise = bookingsService.putBooking(1,2, 3);

        expect(promise).rejects.toEqual(notFoundError());
    });

    it("should return forbidenError when room is full", async () => {
        jest.spyOn(bookingsRepository, "getBooking").mockImplementationOnce((): any => {
            return { id: 1, userId: 1, roomId: 1}
        })

        jest.spyOn(hotelRepository, "findRoomById").mockImplementationOnce((): any => {
            return {
                id: 1,
                capacity: 0
            }
        });

        jest.spyOn(bookingsRepository, "getBookingByRoomId").mockImplementationOnce(():any => { return [
            {id: 1, userId: 1, roomId: 1},
            {id: 2, userId: 2, roomId: 1}
        ]});

        const promise = bookingsService.putBooking(3, 1, 1);

        expect(promise).rejects.toEqual(forbidenError());
    });

    it("should return bookingId", async () => {
        jest.spyOn(bookingsRepository, "getBooking").mockImplementationOnce((): any => {
            return { id: 1, userId: 1, roomId: 1}
        })

        jest.spyOn(hotelRepository, "findRoomById").mockImplementationOnce((): any => {
            return {
                id: 1,
                capacity: 2
            }
        });

        jest.spyOn(bookingsRepository, "getBookingByRoomId").mockImplementationOnce(():any => { return [
            {id: 1, userId: 1, roomId: 1}
        ]});

        jest.spyOn(bookingsRepository, "putBooking").mockImplementationOnce((): any => {
            return {
                id: 1
            }
        });

        const booking = await bookingsService.putBooking(2, 1, 3);

        expect(booking).toEqual({
            bookingId: 1
        });
    });
});