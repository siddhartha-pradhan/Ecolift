import supertest from 'supertest';
import { jest } from '@jest/globals'; // eslint-disable-line

import app from '../../../src/app.js';
import AdminVerificationService from '../../../src/services/adminverification.js';
import UserService from '../../../src/services/user.js';

jest.mock('../../../src/services/adminverification.js');
jest.mock('../../../src/services/user.js');

UserService.authenticateWithToken = jest.fn().mockResolvedValue({ email: 'test@example.com' });

describe('/api/v1/admin-verification/', () => {
  test('anonymous requests are blocked', async () => {
    const req = supertest(app);
    const res = await req.get('/api/v1/admin-verification');
    expect(res.status).toBe(401);
  });

  test('GET lists all the models', async () => {
    const data = [{ name: 'First' }, { name: 'Second' }];
    AdminVerificationService.list = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get('/api/v1/admin-verification')
      .set('Authorization', 'token abc');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
    expect(AdminVerificationService.list).toHaveBeenCalled();
  });

  test('POST creates a new AdminVerification', async () => {
    const data = {
      driver: '614c2c2a29d7763052c63810',
      status: 'test',
      submittedAt: '2001-01-01T00:00:00Z',
      verifiedAt: '2001-01-01T00:00:00Z',
    };

    AdminVerificationService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post('/api/v1/admin-verification')
      .set('Authorization', 'token abc')
      .send(data);

    expect(res.body).toEqual(data);
    expect(res.status).toBe(201);
    expect(AdminVerificationService.create).toHaveBeenCalledWith(data);
  });

});

describe('/api/v1/admin-verification/:id', () => {
  test('getting a single result succeeds for authorized user', async () => {
    const data = { email: 'test@example.com' };
    AdminVerificationService.get = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/admin-verification/507f1f77bcf86cd799439011`)
      .set('Authorization', 'token abc');

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(AdminVerificationService.get).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });

  test('getting a single result fails for anonymous user', async () => {
    const req = supertest(app);
    const res = await req.get('/api/v1/admin-verification/507f1f77bcf86cd799439011');
    expect(res.status).toBe(401);
  });

  test('request for nonexistent object returns 404', async () => {
    const id = '507f1f77bcf86cd799439011';
    AdminVerificationService.get = jest.fn().mockResolvedValue(null);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/admin-verification/${id}`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(404);
    expect(AdminVerificationService.get).toHaveBeenCalled();
  });

  test('request with incorrectly-formatted ObjectId fails', async () => {
    AdminVerificationService.get = jest.fn();
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/admin-verification/bogus`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(400);
    expect(AdminVerificationService.get).not.toHaveBeenCalled();
  });

  test('AdminVerification update', async () => {
    const data = {
    };
    AdminVerificationService.update = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .put(`/api/v1/admin-verification/507f1f77bcf86cd799439011`)
      .send(data)
      .set('Authorization', 'token abc');

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(AdminVerificationService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', data);
  });

  test('AdminVerification deletion', async () => {
    AdminVerificationService.delete = jest.fn().mockResolvedValue(true);
    const req = supertest(app);

    const res = await req
      .delete(`/api/v1/admin-verification/507f1f77bcf86cd799439011`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(204);
    expect(AdminVerificationService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });
});