const request = require('supertest');
const app = require('../../listApp');
const mockQuery = jest.fn();

beforeEach(() => {
    mockQuery.mockReset();
    app.locals.db = { query: mockQuery };
});

describe('prueba endpoint /colegios', () => {
    it('debe devolver colegio por comuna', async () => {
        mockQuery.mockResolvedValue([[{
            ID_establecimiento: 1,
            Nombre: 'Colegio A',
            Tipo_establecimineto: 'Colegio',
            Dirección: 'yt con ac',
            Comuna: 'Santiago',
            Telefono: '9 12345678',
            Email_contacto: 'user@email.com',
            Director_nombre: 'Edgar Vivar',
        }]]);
        const res = await request(app).post("/colegios").send({ 
            comuna: 'Santiago' 
        });
        console.log(res.body);
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].Comuna).toBe('Santiago');
    });
    it('debe retornar error 400 por falta de comuna', async () => {
        const res = await request(app).post('/colegios').send({});
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
    }); 
});

describe('prueba endpoint /cursos', () => {
    it('debe devolver cursos por colegio', async () => {
        mockQuery.mockResolvedValue([[
            {
            ID_curso: 1,
            Nombre_curso: '3º Básico',
            },
            {
            ID_curso: 2,
            Nombre_curso: '5º Básico',
            }, 
        ]]);
        const res = await request(app).post('/cursos').send({
            colegio: 'Insama'
        });
        console.log(res.body);
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toBeGreaterThan(0);
    });
    it('debe retornar error 400 por no proporcionar colegio', async () =>{
        const res = await request(app).post('/cursos').send({});
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
    });
});

describe('prueba endpoint /asignaturas', () => {
    it('debe devolver asignaturas por colegio y curso', async () => {
        mockQuery.mockResolvedValueOnce([[
            { 
            ID_asignatura: 1, 
            Nombre: "Matemáticas" 
            }
        ]]);
        const res = await request(app).post('/asignaturas').send({ 
            colegio: "Colegio A", curso: "1° Básico" 
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{ ID_asignatura: 1, Nombre: "Matemáticas" }]);
    });
    it('debe retornar error 400 por no proporcionar colegio y curso', async () =>{
        const res = await request(app).post('/asignaturas').send({});
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
    });
});

describe('prueba endpoint /archivos', () => {
    it('debe devolver asignaturas por colegio y curso', async () => {
        mockQuery.mockResolvedValueOnce([[
            { 
            ID_archivo: 1, 
            Nombre: "Guía 1", 
            Tipo: "PDF"  
            }
        ]]);
        const res = await request(app).post('/archivos').send({ 
            colegio: "Colegio A", curso: "1° Básico", asignatura: "Matemáticas" 
        });
        expect(res.statusCode).toBe(200);
        expect(res.body[0]).toHaveProperty("ID_archivo");
    });
    it('debe retornar error 400 por no proporcionar colegio, curso y asignatura', async () =>{
        const res = await request(app).post('/archivos').send({});
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
    });
});
