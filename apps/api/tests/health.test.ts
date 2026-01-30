import request from 'supertest';
import app from '../src/index';
import { describe, it, expect } from '@jest/globals';

describe('Health Check', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });
});