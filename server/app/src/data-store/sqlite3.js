const sqlite3 = require("sqlite3");

// see https://www.sqlite.org/
// also see https://github.com/TryGhost/node-sqlite3/wiki/API

class SQLite {
  constructor(filename = "./test.sqlite3") {
    this.conn = new sqlite3.Database(filename, (err) => {
      if (err) {
        console.error("err - sqlite3: " + err.message);
        return null;
      }
    });
  }

  // async wrapper for queries
  query(sql, params) {
    return new Promise((resolve, reject) => {
      this.conn.all(sql, params, (err, result) => {
        if (err) {
          console.error("sqlite3 - err: " + err.message);
          return reject(err);
        }
        console.log("sqlite3 - query: OK (" + sql + ")");
        return resolve(result);
      });
    });
  }

  // create db schema
  init() {
    // TODO: create table statements
    this.query("CREATE TABLE IF NOT EXISTS measurements(ts BIGINT, json TEXT)");
    console.log("sqlite3 - init");
  }

  // reset db
  reset() {
    this.query("DROP TABLE IF EXISTS measurements");
    this.init();
    console.log("sqlite3 - reset");
  }

  // save measurements
  // dataObj format should be {ts: TS, values: {KEY: VAL}}
  // NOTE: see https://stackoverflow.com/questions/15367696/storing-json-in-database-vs-having-a-new-column-for-each-key
  // NOTE: measurementName for consistency
  async saveTimeseries(measurementName = "unknown", dataObj) {
    // extract ms timestamp from data:
    const ts = dataObj.ts;

    // remove ms timestamp from data:
    delete dataObj.ts;

    await this.query("INSERT INTO measurements(ts, json) VALUES(?, ?)", [
      ts,
      JSON.stringify(dataObj.values),
    ]);
  }

  // get measurements
  async getTimeseries() {
    // TODO: getTimeseries
  }
}

module.exports = SQLite;

/*
// usage:

const db = new SQLite();

db.query("SELECT datetime() as dt")
  .then((result) => console.log(result))
  .catch((err) => console.error(err.message));

// or:

const result = await db.query("SELECT datetime() as dt");

*/
