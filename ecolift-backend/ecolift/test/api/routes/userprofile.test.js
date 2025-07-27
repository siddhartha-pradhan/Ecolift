import supertest from 'supertest';
import { jest } from '@jest/globals'; // eslint-disable-line

import app from '../../../src/app.js';
import UserProfileService from '../../../src/services/userprofile.js';
import UserService from '../../../src/services/user.js';

jest.mock('../../../src/services/userprofile.js');
jest.mock('../../../src/services/user.js');

UserService.authenticateWithToken = jest.fn().mockResolvedValue({ email: 'test@example.com' });

describe('/api/v1/user-profile/', () => {
  test('anonymous requests are blocked', async () => {
    const req = supertest(app);
    const res = await req.get('/api/v1/user-profile');
    expect(res.status).toBe(401);
  });

  test('GET lists all the models', async () => {
    const data = [{ name: 'First' }, { name: 'Second' }];
    UserProfileService.list = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get('/api/v1/user-profile')
      .set('Authorization', 'token abc');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
    expect(UserProfileService.list).toHaveBeenCalled();
  });

  test('POST creates a new UserProfile', async () => {
    const data = {
      user: '614c2c2a29d7763052c63810',
      role: 'test',
      isPremium: true,
      premiumExpiryDate: '2001-01-01T00:00:00Z',
      freeRidesRemaining: 42,
      redeemPoints: 3.141592,
    };

    UserProfileService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post('/api/v1/user-profile')
      .set('Authorization', 'token abc')
      .send(data);

    expect(res.body).toEqual(data);
    expect(res.status).toBe(201);
    expect(UserProfileService.create).toHaveBeenCalledWith(data);
  });

  test('creating a new UserProfile without required attributes fails', async () => {
    const data = {};

    UserProfileService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post('/api/v1/user-profile')
      .set('Authorization', 'token abc')
      .send(data);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(UserProfileService.create).not.toHaveBeenCalled();
  });
});

describe('/api/v1/user-profile/:id', () => {
  test('getting a single result succeeds for authorized user', async () => {
    const data = { email: 'test@example.com' };
    UserProfileService.get = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/user-profile/507f1f77bcf86cd799439011`)
      .set('Authorization', 'token abc');

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(UserProfileService.get).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });

  test('getting a single result fails for anonymous user', async () => {
    const req = supertest(app);
    const res = await req.get('/api/v1/user-profile/507f1f77bcf86cd799439011');
    expect(res.status).toBe(401);
  });

  test('request for nonexistent object returns 404', async () => {
    const id = '507f1f77bcf86cd799439011';
    UserProfileService.get = jest.fn().mockResolvedValue(null);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/user-profile/${id}`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(404);
    expect(UserProfileService.get).toHaveBeenCalled();
  });

  test('request with incorrectly-formatted ObjectId fails', async () => {
    UserProfileService.get = jest.fn();
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/user-profile/bogus`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(400);
    expect(UserProfileService.get).not.toHaveBeenCalled();
  });

  test('UserProfile update', async () => {
    const data = {
      user: '614c2c2a29d7763052c63810',
      role: 'test',
      isPremium: true,
      premiumExpiryDate: '2001-01-01T00:00:00Z',
      freeRidesRemaining: 42,
      redeemPoints: 3.141592,
    };
    UserProfileService.update = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .put(`/api/v1/user-profile/507f1f77bcf86cd799439011`)
      .send(data)
      .set('Authorization', 'token abc');

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(UserProfileService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', data);
  });

  test('UserProfile deletion', async () => {
    UserProfileService.delete = jest.fn().mockResolvedValue(true);
    const req = supertest(app);

    const res = await req
      .delete(`/api/v1/user-profile/507f1f77bcf86cd799439011`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(204);
    expect(UserProfileService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });
});