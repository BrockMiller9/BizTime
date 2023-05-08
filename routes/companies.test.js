process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async () => {
  const result = await db.query(`
          INSERT INTO companies (code, name, description)
            VALUES ('test', 'test', 'test')
            RETURNING code, name, description
        `);
  testCompany = result.rows[0];
});

afterAll(async () => {
  await db.query(`DELETE FROM companies`);
  await db.end();
});

describe("GET /companies", () => {
  test("Get a list with one company", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompany] });
  });
});

describe("GET /companies/:code", () => {
  test("Get a single company", async () => {
    const res = await request(app).get(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ company: testCompany });
  });
  test("responds with 404 for invalid code", async () => {
    const res = await request(app).get(`/companies/0`);
    expect(res.statusCode).toBe(404);
    // expect(res.body).toEqual({ company: testCompany });
  });
});

describe("POST /companies", () => {
  test("Create a new company", async () => {
    const res = await request(app).post(`/companies`).send({
      code: "test2",
      name: "test2",
      description: "test2",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: "test2",
        name: "test2",
        description: "test2",
      },
    });
  });
});
