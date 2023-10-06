import faker from '@faker-js/faker';
import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from 'supertest';
import httpStatus from 'http-status';
import { createEnrollmentWithAddress, createPayment, createTicket, createTicketType, createUser } from '../factories';
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '@prisma/client';
import { createFullRoomWithHotelId, createHotel, createRoomWithHotelId } from '../factories/hotels-factory';
import { createBooking } from '../factories/booking-factory';

beforeAll(async () => {
    await init();
});
  
beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/booking');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it('should respond with status 404 when user has no booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
      
            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it('should respond with status 200 when user has a booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const createdBooking = await createBooking(user.id, createdRoom.id);
            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual({
                id: createdBooking.id,
                Room: {
                    id: createdRoom.id,
		            name: expect.any(String),
		            capacity: expect.any(Number),
		            hotelId: createdHotel.id,
		            createdAt: expect.any(String),
		            updatedAt: expect.any(String)
                }
            });
        });
    });
});

describe("POST /booking", () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.post('/booking');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it('should respond with status 400 when there is no body', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
      
            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);
      
            expect(response.status).toEqual(httpStatus.BAD_REQUEST);
        });

        it('should respond with status 400 when body is invalid', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
      
            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({room: 2});
      
            expect(response.status).toEqual(httpStatus.BAD_REQUEST);
        });

        it("should respond with status 403 when ticket is remote", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(true, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId: 2});
      
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        })

        it("should respond with status 403 when ticket doesn't include hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, false);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId: 2});
      
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        })

        it("should respond with status 403 when ticket is not paid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId: 2});
      
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        })

        it("should respond with status 404 when room doesn't exist", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId: 2});
      
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        })

        it("should respond with status 403 when room is full", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const createdHotel = await createHotel();

            const createdRoom = await createFullRoomWithHotelId(createdHotel.id);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId: createdRoom.id});
      
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        })

        it("should respond with status 200 and bookingId", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({roomId: createdRoom.id});
      
            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual({
                bookingId: expect.any(Number)
            });
        });
    });
});

describe("PUT /booking/:bookingId", () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.put('/booking/1');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it('should respond with status 400 when there is no body', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
      
            const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);
      
            expect(response.status).toEqual(httpStatus.BAD_REQUEST);
        });

        it('should respond with status 400 when body is invalid', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
      
            const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({room: 2});
      
            expect(response.status).toEqual(httpStatus.BAD_REQUEST);
        });

        it("should respond with status 403 when user has no booking", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
      
            const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({roomId: 2});
      
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        })

        it("should respond with status 404 when room doesn't exist", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const createdBooking = await createBooking(user.id, createdRoom.id);

            const response = await server.put(`/booking/${createdBooking.id}`).set('Authorization', `Bearer ${token}`).send({roomId: createdRoom.id+1});
      
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        })

        it("should respond with status 403 when room is full", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const createdBooking = await createBooking(user.id, createdRoom.id);
            const createdFullRoom = await createFullRoomWithHotelId(createdHotel.id);

            const response = await server.put(`/booking/${createdBooking.id}`).set('Authorization', `Bearer ${token}`).send({roomId: createdFullRoom.id});
      
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        })

        it("should respond with status 200 and bookingId", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const createdBooking = await createBooking(user.id, createdRoom.id);
            const createdNewRoom = await createRoomWithHotelId(createdHotel.id);

            const response = await server.put(`/booking/${createdBooking.id}`).set('Authorization', `Bearer ${token}`).send({roomId: createdNewRoom.id});
      
            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual({
                bookingId: expect.any(Number)
            });
        });
    });
});