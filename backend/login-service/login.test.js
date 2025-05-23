const request = require('supertest');
const app = require('./loginApp');

const mockQuery = jest.fn();

beforeEach(() => {
    mockQuery.mockReset();
    app.set('db', { query: mockQuery });
});

test('debe registrar un usuario exitosamente', async () => {
    mockQuery.mockImplementation((query, data, callback) => {
    callback(null, { insertId: 1 });
    });

    const res = await request(app).post('/register').send({
    rut: '12345678-9',
    nombres: 'Ana',
    apellido_paterno: 'Gómez',
    correo: 'ana@example.com',
    contrasena: '1234'
    });

    console.log(res.body);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Usuario registrado');
    expect(res.body.id).toBe(1);
});
