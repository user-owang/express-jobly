const { BadRequestError } = require("../expressError");

/**
 *@param dataToUpdate {Object} {property1: value1, property2: value2...}
 *@param jsToSql {Object} translation from property names to SQL table column names ie {firstName: 'first_name', age: 'age'}
 *@returns {Object} {SQLsetColsString, valuesArray}
 *@example {firstName: 'test', age: 69} =>
 *   { setCols: '"first_name"=$1, "age"=$2',
 *     values: ['test', 69] }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
