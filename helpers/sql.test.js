const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("updates 1 item", function () {
    const result = sqlForPartialUpdate(
      { firstName: "test" },
      { firstName: "first_name", age: "age", lastName: "last_name" }
    );
    expect(result).toEqual({
      setCols: '"first_name"=$1',
      values: ["test"],
    });
  });

  test("updates 2 items", function () {
    const result = sqlForPartialUpdate({ age: 69, dept: "test" }, {});
    expect(result).toEqual({
      setCols: '"age"=$1, "dept"=$2',
      values: [69, "test"],
    });
  });
});
