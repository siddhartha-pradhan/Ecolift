import supertest from 'supertest';
import { jest } from '@jest/globals'; // eslint-disable-line

import app from '../../../src/app.js';
import AdvertismentService from '../../../src/services/advertisement.js';
import UserService from '../../../src/services/user.js';

jest.mock('../../../src/services/advertisement.js');
jest.mock('../../../src/services/user.js');

UserService.authenticateWithToken = jest.fn().mockResolvedValue({ email: 'test@example.com' });

describe('/api/v1/advertisment/', () => {
  test('anonymous requests are blocked', async () => {
    const req = supertest(app);
    const res = await req.get('/api/v1/advertisment');
    expect(res.status).toBe(401);
  });

  test('GET lists all the models', async () => {
    const data = [{ name: 'First' }, { name: 'Second' }];
    AdvertismentService.list = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get('/api/v1/advertisment')
      .set('Authorization', 'token abc');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(data);
    expect(AdvertismentService.list).toHaveBeenCalled();
  });

  test('POST creates a new Advertisment', async () => {
    const data = {
      adImage: 'test',
      adDuration: 42,
      isActive: true,
    };

    AdvertismentService.create = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .post('/api/v1/advertisment')
      .set('Authorization', 'token abc')
      .send(data);

    expect(res.body).toEqual(data);
    expect(res.status).toBe(201);
    expect(AdvertismentService.create).toHaveBeenCalledWith(data);
  });

});

describe('/api/v1/advertisment/:id', () => {
  test('getting a single result succeeds for authorized user', async () => {
    const data = { email: 'test@example.com' };
    AdvertismentService.get = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/advertisment/507f1f77bcf86cd799439011`)
      .set('Authorization', 'token abc');

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(AdvertismentService.get).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });

  test('getting a single result fails for anonymous user', async () => {
    const req = supertest(app);
    const res = await req.get('/api/v1/advertisment/507f1f77bcf86cd799439011');
    expect(res.status).toBe(401);
  });

  test('request for nonexistent object returns 404', async () => {
    const id = '507f1f77bcf86cd799439011';
    AdvertismentService.get = jest.fn().mockResolvedValue(null);
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/advertisment/${id}`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(404);
    expect(AdvertismentService.get).toHaveBeenCalled();
  });

  test('request with incorrectly-formatted ObjectId fails', async () => {
    AdvertismentService.get = jest.fn();
    const req = supertest(app);

    const res = await req
      .get(`/api/v1/advertisment/bogus`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(400);
    expect(AdvertismentService.get).not.toHaveBeenCalled();
  });

  test('Advertisment update', async () => {
    const data = {
    };
    AdvertismentService.update = jest.fn().mockResolvedValue(data);
    const req = supertest(app);

    const res = await req
      .put(`/api/v1/advertisment/507f1f77bcf86cd799439011`)
      .send(data)
      .set('Authorization', 'token abc');

    expect(res.body).toEqual(data);
    expect(res.status).toBe(200);
    expect(AdvertismentService.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', data);
  });

  test('Advertisment deletion', async () => {
    AdvertismentService.delete = jest.fn().mockResolvedValue(true);
    const req = supertest(app);

    const res = await req
      .delete(`/api/v1/advertisment/507f1f77bcf86cd799439011`)
      .set('Authorization', 'token abc');

    expect(res.status).toBe(204);
    expect(AdvertismentService.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });
});