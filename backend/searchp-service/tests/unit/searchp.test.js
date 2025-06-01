const request = require('supertest');
const app = require('../../searchApp');

const mockQuery = jest.fn();

beforeEach(() => {
    mockQuery.mockReset();
    app.locals.db = { query: mockQuery };
});

test('debe obtener un usuario', async () => {
    mockQuery.mockResolvedValue([
        [{
            ID_usuario: 1,
            Rut: '12345678-9',
            Nombres: 'Ana',
            Apellido_Paterno: 'Gómez',
            Apellido_Materno: 'Pérez',
            Correo: 'correo@gmail.com',
            Telefono: '123456789',
            Estado: 'Activo',
            Fecha_nac: '2005-01-01',
            Tipo_usuario: 'Estudiante',
            Nombre_rol: 'Alumno',
            Establecimiento: 'Colegio Ejemplo',
            Comuna: 'Santiago',
            Nombre_curso: '10',
            Asignatura: 'Matemáticas'
        }]
    ]);

    const res = await request(app).post('/buscar').send({
        comuna: 'Santiago',
    });

    console.log(res.body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.any(Array));
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].Rut).toBe('12345678-9');
});

test('debe retornar 404 si no se encuentra el usuario', async () => {
    mockQuery.mockResolvedValue([[]]);

    const res = await request(app).post('/buscar').send({
        comuna: 'Santiago',
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ mensaje: "Usuario no encontrado" });
});

