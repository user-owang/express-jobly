"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  c1CEO,
  c2CEO,
  c2CTO,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "New",
    salary: 10000,
    equity: .05,
    companyHandle: 'c3'
  };

  test("ok for admins", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        ...newJob,
        id: expect.any(Number),
      },
    });
  });
  
  test("unauth for users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: 'new',
          salary: 10000,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "New",
          salary: -10000,
          equity: 2,
          companyHandle: 'c3'
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {
              id: c1CEO,
              title: "CEO",
              salary: 300000,
              equity: 0,
              companyHandle: "c1",
              companyName: "C1",
            },
            {
              id: c2CEO,
              title: "CEO",
              salary: 200000,
              equity: 0.002,
              companyHandle: "c2",
              companyName: "C2",
            },
            {
              id: c2CTO,
              title: "CTO",
              salary: 100000,
              equity: 0,
              companyHandle: "c2",
              companyName: "C2",
            },
          ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${c1CEO}`);
    expect(resp.body).toEqual({
      job: {
        id: c1CEO,
        title: "CEO",
        salary: 300000,
        equity: 0,
        companyHandle: "c1",
        companyName: "C1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/9999999`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/jobs/${c1CEO}`)
        .send({
          title: "COO",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      job: {
        id: c1CEO,
        title: "COO",
        salary: 300000,
        equity: 0,
        companyHandle: "c1",
      },
    });
  });
  
  test("unauth for users", async function () {
    const resp = await request(app)
        .patch(`/jobs/${c1CEO}`)
        .send({
          title: "fake",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/${c1CEO}`)
        .send({
          title: "fake",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/99999`)
        .send({
          title: "fake",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/${c1CEO}`)
        .send({
          id: "8008135",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${c1CEO}`)
        .send({
          salary: "not-a-number",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/jobs/${c1CEO}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: c1CEO });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .delete(`/jobs/${c1CEO}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${c1CEO}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/99999`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
