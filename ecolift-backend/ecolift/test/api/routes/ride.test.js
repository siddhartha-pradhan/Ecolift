import supertest from 'supertest';
import { jest } from '@jest/globals'; // eslint-disable-line

import app from '../../../src/app.js';
import RideService from '../../../src/services/ride.js';
import UserService from '../../../src/services/user.js';

jest.mock('../../../src/services/ride.js');
jest.mock('../../../src/services/user.js');

UserService.authenticateWithToken = jest.fn().mockResolvedValue({ email: 'test@example.com' });

describe('/api/v1/ride/', () => {
  test('anonymous requests are blocked', async () => {
    const req = supertest(app);
    const res = await req.get('/api/v1/ride');
    expect(res.status).toBe(401);
  });

  test('GET lists all the models', async () => {
    const data = [{ name: 'First' }, { name: 'Second' }];
    RideService.list = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get('/api/v1/ride')
      .set('Authorization', 'token abc');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
    expect(RideService.list).toHaveBeenCalled();
  });

  test('POST creates a new Ride', async () => {
    const data = {
      user: '614c2c2a29d7763052c63810',
      pickupLocation: 'test',
      dropoffLocation: 'test',
      status: 'test',
      distance: 3.141592,
      isPreBooked: true,
      preBookedDate: '2001-01-01T00:00:00Z',
      fare: 42,
      driver: '614c2c2a29d7763052c63810',
    };

    RideService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post('/api/v1/ride')
      .set('Authorization', 'token abc')
      .send(data);

    expect(res.body).toEqual(data);
    expect(res.status).toBe(201);
    expect(RideService.create).toHaveBeenCalledWith(data);
  });

  test('creating a new Ride without required attributes fails', async () => {
    const data = {};

    RideService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post('/api/v1/ride')
      .set('Authorization', 'token abc')
      .send(data);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(RideService.create).not.toHaveBeenCalled();
  });
});

describe('/api/v1/ride/:id', () => {
  test('getting a single result succeeds for authorized user', async () => {
    const data = { email: 'test@example.com' };
    RideService.get = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/ride/507f1f77bcf86cd799439011`)
      .set('Authorization', 'token abc');

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(RideService.get).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });

  test('getting a single result fails for anonymous user', async () => {
    const req = supertest(app);
    const res = await req.get('/api/v1/ride/507f1f77bcf86cd799439011');
    expect(res.status).toBe(401);
  });

  test('request for nonexistent object returns 404', async () => {
    const id = '507f1f77bcf86cd799439011';
    RideService.get = jest.fn().mockResolvedValue(null);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/ride/${id}`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(404);
    expect(RideService.get).toHaveBeenCalled();
  });

  test('request with incorrectly-formatted ObjectId fails', async () => {
    RideService.get = jest.fn();
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/ride/bogus`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(400);
    expect(RideService.get).not.toHaveBeenCalled();
  });

  test('Ride update', async () => {
    const data = {
      user: '614c2c2a29d7763052c63810',
      pickupLocation: 'test',
      dropoffLocation: 'test',
      status: 'test',
      distance: 3.141592,
      isPreBooked: true,
      preBookedDate: '2001-01-01T00:00:00Z',
      fare: 42,
    };
    RideService.update = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .put(`/api/v1/ride/507f1f77bcf86cd799439011`)
      .send(data)
      .set('Authorization', 'token abc');

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(RideService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', data);
  });

  test('Ride deletion', async () => {
    RideService.delete = jest.fn().mockResolvedValue(true);
    const req = supertest(app);

    const res = await req
      .delete(`/api/v1/ride/507f1f77bcf86cd799439011`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(204);
    expect(RideService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });
});