process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testInvoice;

beforeEach(async () => {
  const result = await db.query(`
            INSERT INTO invoices (comp_code, amt)
            VALUES ('test', 100)
            RETURNING id, comp_code, amt, paid, add_date, paid_date
        `);
  testInvoice = result.rows[0];
});

afterAll(async () => {
  await db.query(`DELETE FROM invoices`);
  await db.end();
});

describe("GET /invoices", () => {
  test("Get a list with one invoice", async () => {
    const res = await request(app).get("/invoices");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ invoices: [testInvoice] });
  });
});

describe("GET /invoices/:id", () => {
  test("Get a single invoice", async () => {
    const res = await request(app).get(`/invoices/${testInvoice.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ invoice: testInvoice });
  });
  test("responds with 404 for invalid id", async () => {
    const res = await request(app).get(`/invoices/0`);
    expect(res.statusCode).toBe(404);
    // expect(res.body).toEqual({invoice: testInvoice});
  });
});

describe("POST /invoices", () => {
  test("Create a new invoice", async () => {
    const res = await request(app).post(`/invoices`).send({
      comp_code: "test2",
      amt: 100,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      invoice: {
        id: expect.any(Number),
        comp_code: "test2",
        amt: 100,
        paid: false,
        add_date: expect.any(String),
        paid_date: null,
      },
    });
  });
});
