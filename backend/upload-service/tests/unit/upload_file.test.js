const request = require('supertest');
const app = require('../../upload_file');
const path = require("path");

const mockQuery = jest.fn();

beforeEach(() => {
    mockQuery.mockReset();
    mockQuery.mockImplementation((sql, values, cb) => {
        cb(null, { insertId: 123 }); // simulamos respuesta exitosa de la DB
    });
    app.set('db', { query: mockQuery });
});

const fakePdf = Buffer.from('%PDF-1.4\nMock PDF content', 'utf-8');

test('✅ se guardó con éxito el archivo', async () => {
    const response = await request(app).post('/api/uploadFile')
        .field('comuna', 'Santiago')
        .field('colegio', 'ColegioX')
        .field('curso', '4A')
        .field('asignatura', 'Historia')
        .field('tipo', 'Tarea')
        .field('descripcion', 'Archivo de prueba')
        .attach('archivo', fakePdf, {
        filename: 'prueba.pdf',
        contentType: 'application/pdf'});

    console.log(response.body);

    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.id).toBe(123);
    expect(mockQuery).toHaveBeenCalled();
});

test('❌ error no se selecciono archivo', async () => {
    const response = await request(app).post('/api/uploadFile')
        .field('comuna', 'Santiago')
        .field('colegio', 'ColegioX')
        .field('curso', '4A')
        .field('asignatura', 'Historia')
        .field('tipo', 'Tarea')
        .field('descripcion', 'Archivo de prueba')
        .attach('archivo', null); 

    console.log(response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toBe("No se ha seleccionado ningún archivo");
});

test('❌ error extensión no válida', async () => {
    const response = await request(app).post('/api/uploadFile')
        .field('comuna', 'Santiago')
        .field('colegio', 'ColegioX')
        .field('curso', '4A')
        .field('asignatura', 'Historia')
        .field('tipo', 'Tarea')
        .field('descripcion', 'Archivo de prueba')
        .attach('archivo', fakePdf, {
            filename: 'prueba.txt',
            contentType: 'text/plain'
        });

    console.log(response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.mensaje).toBe("Extensión de archivo no válida");
});

