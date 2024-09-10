import request from "supertest";

import app from "../index";

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
