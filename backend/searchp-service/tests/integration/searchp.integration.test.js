const app = require('../../searchApp');
const request = require('supertest');


test("debe obtener un usuario", async () => {
    const res = await request(app).post("/buscar").send({ rut: "12345678-9" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.any(Array));
    expect(res.body.length).toBeGreaterThan(0);
});


test("debe retornar 404 si no se encuentra el usuario", async () => {
    const res = await request(app).post("/buscar").send({ comuna: "ComunaInventada" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ mensaje: "Usuario no encontrado" });
});

