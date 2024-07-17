// help me write first test with jest we will test already runned app on port 3001

import request from "supertest";

import app from "../index";

describe('GET /', () => {
  it('should return 200 and name john', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });
});
