import supertest from 'supertest';
import { jest } from '@jest/globals'; // eslint-disable-line

import app from '../../../src/app.js';
import RideHistoryService from '../../../src/services/ridehistory.js';
import UserService from '../../../src/services/user.js';

jest.mock('../../../src/services/ridehistory.js');
jest.mock('../../../src/services/user.js');

UserService.authenticateWithToken = jest.fn().mockResolvedValue({ email: 'test@example.com' });

describe('/api/v1/ride-history/', () => {
  test('anonymous requests are blocked', async () => {
    const req = supertest(app);
    const res = await req.get('/api/v1/ride-history');
    expect(res.status).toBe(401);
  });

  test('GET lists all the models', async () => {
    const data = [{ name: 'First' }, { name: 'Second' }];
    RideHistoryService.list = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get('/api/v1/ride-history')
      .set('Authorization', 'token abc');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
    expect(RideHistoryService.list).toHaveBeenCalled();
  });

  test('POST creates a new RideHistory', async () => {
    const data = {
      ride: '614c2c2a29d7763052c63810',
      user: '614c2c2a29d7763052c63810',
      dateTaken: '2001-01-01T00:00:00Z',
      redeemPointsEarned: 3.141592,
      driver: '614c2c2a29d7763052c63810',
    };

    RideHistoryService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post('/api/v1/ride-history')
      .set('Authorization', 'token abc')
      .send(data);

    expect(res.body).toEqual(data);
    expect(res.status).toBe(201);
    expect(RideHistoryService.create).toHaveBeenCalledWith(data);
  });

  test('creating a new RideHistory without required attributes fails', async () => {
    const data = {};

    RideHistoryService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post('/api/v1/ride-history')
      .set('Authorization', 'token abc')
      .send(data);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(RideHistoryService.create).not.toHaveBeenCalled();
  });
});

describe('/api/v1/ride-history/:id', () => {
  test('getting a single result succeeds for authorized user', async () => {
    const data = { email: 'test@example.com' };
    RideHistoryService.get = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/ride-history/507f1f77bcf86cd799439011`)
      .set('Authorization', 'token abc');

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(RideHistoryService.get).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });

  test('getting a single result fails for anonymous user', async () => {
    const req = supertest(app);
    const res = await req.get('/api/v1/ride-history/507f1f77bcf86cd799439011');
    expect(res.status).toBe(401);
  });

  test('request for nonexistent object returns 404', async () => {
    const id = '507f1f77bcf86cd799439011';
    RideHistoryService.get = jest.fn().mockResolvedValue(null);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/ride-history/${id}`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(404);
    expect(RideHistoryService.get).toHaveBeenCalled();
  });

  test('request with incorrectly-formatted ObjectId fails', async () => {
    RideHistoryService.get = jest.fn();
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/ride-history/bogus`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(400);
    expect(RideHistoryService.get).not.toHaveBeenCalled();
  });

  test('RideHistory update', async () => {
    const data = {
      ride: '614c2c2a29d7763052c63810',
      user: '614c2c2a29d7763052c63810',
      dateTaken: '2001-01-01T00:00:00Z',
      redeemPointsEarned: 3.141592,
      driver: '614c2c2a29d7763052c63810',
    };
    RideHistoryService.update = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .put(`/api/v1/ride-history/507f1f77bcf86cd799439011`)
      .send(data)
      .set('Authorization', 'token abc');

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(RideHistoryService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', data);
  });

  test('RideHistory deletion', async () => {
    RideHistoryService.delete = jest.fn().mockResolvedValue(true);
    const req = supertest(app);

    const res = await req
      .delete(`/api/v1/ride-history/507f1f77bcf86cd799439011`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(204);
    expect(RideHistoryService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });
});