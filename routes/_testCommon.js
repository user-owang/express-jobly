"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const { createToken } = require("../helpers/tokens");

const c1CEO = 300;
const c2CEO = 400;
const c2CTO = 500;

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users CASCADE");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies CASCADE");

  await db.query("DELETE FROM jobs CASCADE");

  await db.query("DELETE FROM applications CASCADE");

  await Company.create({
    handle: "c1",
    name: "C1",
    numEmployees: 1,
    description: "Desc1",
    logoUrl: "http://c1.img",
  });
  await Company.create({
    handle: "c2",
    name: "C2",
    numEmployees: 2,
    description: "Desc2",
    logoUrl: "http://c2.img",
  });
  await Company.create({
    handle: "c3",
    name: "C3",
    numEmployees: 3,
    description: "Desc3",
    logoUrl: "http://c3.img",
  });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: true,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
  await db.query(`
  INSERT INTO jobs(id, title, salary, equity, company_handle)
    VALUES (${c1CEO},'CEO', 300000, 0, 'c1'),
           (${c2CEO},'CEO', 200000, 0.002, 'c2'),
           (${c2CTO},'CTO', 100000, 0, 'c2');`);

  await User.apply({ username: "u1", jobID: c1CEO });
  await User.apply({ username: "u1", jobID: c2CTO });
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.query("DELETE FROM users CASCADE");
  await db.query("DELETE FROM companies CASCADE");
  await db.query("DELETE FROM jobs CASCADE");
  await db.query("DELETE FROM applications CASCADE");
  await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  c1CEO,
  c2CEO,
  c2CTO,
};
