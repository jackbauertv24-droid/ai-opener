const request = require('supertest');
const { app } = require('..');
const { version } = require('../package.json');

describe('Root endpoint version', () => {
  test('returns the package.json version', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('version');
    expect(response.body.version).toBe(version);
  });
});
