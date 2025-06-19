const request = require('supertest');
const app = require('../../loginApp');

const mockQuery = jest.fn();

beforeEach(() => {
    mockQuery.mockReset();
    app.set('db', { query: mockQuery });
});


// Test de registro de usuario
test('debe registrar un usuario exitosamente', async () => {
    mockQuery.mockImplementation((callback) => {
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

// Test de inicio de sesión
describe('Test de inicio de sesión', () => {

    beforeEach(() => {
        mockQuery.mockReset();

        mockQuery.mockImplementation((query, data, callback) => {
            const correo = data[0];

            if (correo === 'correo@gmail.com') {
                callback(null, [{
                    ID_usuario: 1,
                    Rut: '12345678-9',
                    Nombres: 'Ana',
                    Apellido_paterno: 'Gómez',
                    Correo: 'correo@gmail.com',
                    Contrasena: 'contrasenaT'
                }]);
            } else {
                callback(null, []);
            }
        });
    });


    test('debe iniciar sesión exitosamente', async () => {

        const res = await request(app).post('/login').send({
            correo: 'correo@gmail.com',
            contrasena: 'contrasenaT'
        });

        console.log(res.body);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Inicio de sesión exitoso');
        expect(res.body.usuario.id).toBe(1);


    });

    test('debe fallar inicio sesión, usuario no encontrado', async () => {

        const res = await request(app).post('/login').send({
            correo: 'c',
            contrasena: 'contrasenaT'
        });

        console.log(res.body);

        expect(res.status).toBe(401);
    })

    test('debe fallar inicio session, contraseña incorrecta', async () => {

        const res = await request(app).post('/login').send({
            correo: 'correo@gmail.com',
            contrasena: 'c'
        });

        console.log(res.body);

        expect(res.status).toBe(401);

    });


})