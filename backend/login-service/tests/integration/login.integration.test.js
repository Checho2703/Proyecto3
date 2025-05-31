const request = require("supertest");

const API_URL = "http://localhost:3000";

test("GET /status - debe devolver estado 200", async () => {
    const response = await request(API_URL).get("/status");
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "OK" });
});