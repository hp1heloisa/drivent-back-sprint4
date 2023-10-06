import faker from '@faker-js/faker';
import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from 'supertest';
import httpStatus from 'http-status';
import { createUser } from '../factories';
import * as jwt from 'jsonwebtoken';

beforeAll(async () => {
    await init();
});
  
beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/hotels');
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();
    
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it('should respond with status 404 when user has no booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
      
            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

    })

    
})