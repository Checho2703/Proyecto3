const app = require("../../loginApp"); // o el path correcto
const request = require("supertest");

describe("Pruebas de integración para el servicio de búsqueda", () => {
    test("debe obtener un usuario", async () => {
        const res = await request(app)
            .post("/buscar")
            .send({ comuna: "Santiago" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.any(Array));
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].Rut).toBe("12345678-9");
    });

    test("debe retornar 404 si no se encuentra el usuario", async () => {
        const res = await request(app)
            .post("/buscar")
            .send({ comuna: "ComunaInventada" });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ mensaje: "Usuario no encontrado" });
    });
});
