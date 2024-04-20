"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  c1CEO,
  c2CEO,
  c2CTO,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 10,
    equity: 0.07,
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      ...newJob,
      id: expect.any(Number),
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
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
    ]);
  });

  test("works: case insensitive name filter", async function () {
    let jobs = await Job.findAll({ title: "ceo" });
    expect(jobs).toEqual([
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
    ]);
  });

  test("works: minSalary filter and title filter", async function () {
    let jobs = await Job.findAll({ title: "ceo", minSalary: 210000 });
    expect(jobs).toEqual([
      {
        id: c1CEO,
        title: "CEO",
        salary: 300000,
        equity: 0,
        companyHandle: "c1",
        companyName: "C1",
      },
    ]);
  });

  test("works: hasEquity filter and title filter", async function () {
    let jobs = await Job.findAll({ title: "ceo", hasEquity: true });
    expect(jobs).toEqual([
      {
        id: c2CEO,
        title: "CEO",
        salary: 200000,
        equity: 0.002,
        companyHandle: "c2",
        companyName: "C2",
      },
    ]);
  });

  test("works: all 3 filters", async function () {
    let jobs = await Job.findAll({
      title: "c",
      minSalary: 200000,
      hasEquity: true,
    });
    expect(jobs).toEqual([
      {
        id: c2CEO,
        title: "CEO",
        salary: 200000,
        equity: 0.002,
        companyHandle: "c2",
        companyName: "C2",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(c1CEO);
    expect(job).toEqual({
      id: c1CEO,
      title: "CEO",
      salary: 300000,
      equity: 0,
      companyHandle: "c1",
      companyName: "C1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(999999999999999999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 100,
    equity: 0.01,
  };

  test("works", async function () {
    let job = await Job.update(c1CEO, updateData);
    expect(job).toEqual({
      id: c1CEO,
      company_handle: "c1",
      ...updateData,
    });

    const result = await db.query(
      `SELECT *
           FROM jobs
           WHERE id = ${c1CEO}`
    );
    expect(result.rows).toEqual([
      {
        id: c1CEO,
        title: "CEO",
        salary: 300000,
        equity: 0,
        company_handle: "c1",
      },
    ]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null,
    };

    let job = await Job.update(c1CEO, updateDataSetNulls);
    expect(job).toEqual({
      id: c1CEO,
      company_handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT *
           FROM jobs
           WHERE id = ${c1CEO}`
    );
    expect(result.rows).toEqual([
      {
        id: c1CEO,
        title: "New",
        salary: null,
        equity: null,
        company_handle: "c1",
      },
    ]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(99999999, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(c1CEO, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(c1CEO);
    const res = await db.query(`SELECT title FROM jobs WHERE id= ${c1CEO}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(999999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
