const sqlite3 = require("sqlite3");

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

        return resolve(result);
      });
    });
  }

  // create db schema
  init() {
    // TODO: create table statements
  }
}

module.exports = SQLite;

const db = new SQLite();
db.init();

/*
// usage:

const db = new SQLite();

db.query("SELECT datetime() as dt")
  .then((result) => console.log(result))
  .catch((err) => console.error(err.message));

// or:

const result = await db.query("SELECT datetime() as dt");

*/
