import request from "supertest";

import app from "../index";
import exp from "node:constants";

describe('test api', () => {
  it('should return 200', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });
});

describe('GET /auth', () => {
  it('should return 401', async () => {
    const response = await request(app).get('/auth/status');
    expect(response.statusCode).toBe(401);
  });
});

describe('User creation', () => {

  it('', async () => {
    const response = await request(app).post('/user/create').send({
      email: 'test@test.test',
      password: 'test1234',
      passwordConfirmation: 'test1234'
    });
    expect(response.statusCode).toBe(201);
  });
});
