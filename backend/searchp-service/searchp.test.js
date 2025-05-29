const request = require('supertest');
const app = require('./searchApp');

const mockQuery = jest.fn();

beforeEach(() => {
    mockQuery.mockReset();
    app.set('db', { query: mockQuery });
});

