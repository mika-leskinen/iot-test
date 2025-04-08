const sqlite3 = require("sqlite3");
const moment = require("moment");

// see https://www.sqlite.org/
// also see https://github.com/TryGhost/node-sqlite3/wiki/API

// max number of rows to retrieve from db
const limitRows = 5000000;

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
    this.query("CREATE TABLE IF NOT EXISTS alarms(ts BIGINT, message text)");
    this.query(
      "CREATE TABLE IF NOT EXISTS alarm_triggers(measurement_name text, operator text, value float)"
    );

    // add test triggers
    /*
    //this.query("DELETE FROM alarm_triggers;);
    this.query(
      "INSERT INTO alarm_triggers(measurement_name, operator, value) VALUES ('TEST_random_float', 'gt', 75)"
    );
    this.query(
      "INSERT INTO alarm_triggers(measurement_name, operator, value) VALUES ('TEST_random_float', 'lt', 25)"
    );
    */
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
  // TODO: handle cases where data with given timestamp already exists
  async saveTimeseries(dataObj) {
    // extract ms timestamp from data:
    const ts = dataObj.ts;

    // remove ms timestamp from data:
    delete dataObj.ts;

    await this.query("INSERT INTO measurements(ts, json) VALUES(?, ?)", [
      ts,
      JSON.stringify(dataObj.values),
    ]);
  }

  // save alarm events
  async saveAlarm(message) {
    await this.query("INSERT INTO alarms(ts, message) VALUES (?,?)", [
      moment().valueOf(),
      message,
    ]);
  }

  // get alarm events
  async getAlarms() {
    const results = await this.query("SELECT * from alarms");
    return results;
  }

  // get alarm triggers
  async getAlarmTriggers() {
    const results = await this.query("SELECT * from alarm_triggers");
    return results;
  }

  // get measurements
  async getTimeseries(startTs, endTs) {
    // convert times to unix ms format
    const startMs = moment(startTs).valueOf();
    const endMs = moment(endTs).valueOf();

    // get values from db
    const results = await this.query(
      "SELECT * FROM measurements WHERE ts >= ? and ts <= ? ORDER BY ts ASC LIMIT " +
        limitRows,
      [startMs, endMs]
    );

    // format data as [{ts: TS, values: {KEY: VAL}}]
    let dataArr = [];
    for (const row of results) {
      try {
        dataArr.push({ ts: row.ts, values: JSON.parse(row.json) });
      } catch (err) {
        console.error("sqlite3 - err: " + err.message);
      }
    }

    return dataArr;
  }
}

module.exports = SQLite;
