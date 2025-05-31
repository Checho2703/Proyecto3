const app = require("../../loginApp");
const request = require("supertest");

test("GET /status - debe devolver estado 200", async () => {
    const response = await request(app).get("/status");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "OK" });
});
