const Influx = require("influx");
const moment = require("moment");

// see https://docs.influxdata.com/influxdb/v1/
// also see https://node-influx.github.io/manual/tutorial.html

// max number of rows to retrieve from db
const limitRows = 5000000;

class InfluxDB {
  constructor(
    options = {
      dbHost: "localhost",
      dbPort: 8086,
      dbName: "iot-test-influxdb",
      measurementName: "iot-test-raspberrypi",
    }
  ) {
    this.dbHost = options.dbHost;
    this.dbPort = options.dbPort;
    this.dbName = options.dbName;
    this.measurementName = options.measurementName;

    console.log(
      "influxdb - init (" +
        this.dbHost +
        ":" +
        this.dbPort +
        " " +
        this.dbName +
        " / " +
        this.measurementName +
        ")"
    );

    // connect to influx
    this.db = new Influx.InfluxDB({
      host: this.dbHost,
      port: this.dbPort,
      database: this.dbName,
    });

    // create database
    this.db.createDatabase(this.dbName).catch((err) => {
      // err
      console.error("influxdb - err: " + err.message);
    });
  }

  // save measurements
  // dataObj format should be {ts: TS, values: {KEY: VAL}}
  async saveTimeseries(dataObj) {
    // TODO: timestamps don't seem to work exactly
    await this.db.writePoints([
      {
        measurement: this.measurementName,
        timestamp: dataObj.ts,
        fields: dataObj.values,
      },
    ]);
    console.log("influxdb - writePoints OK");
  }

  // get measurements between startTs and endTs
  async getTimeseries(startTs, endTs) {
    // convert times to unix ms format
    const startMs = moment(startTs).valueOf();
    const endMs = moment(endTs).valueOf();

    // do the query
    // should be safe to pass moment().valueOf() results directly to query
    // see https://www.w3schools.com/sql/sql_injection.asp
    let results = await this.db.query(
      `SELECT * FROM "${this.measurementName}" WHERE time >= ${startMs}ms AND time <= ${endMs}ms ORDER BY time ASC LIMIT ${limitRows}`
    );

    // format as [{ts: TS, values: {KEY: VAL}}]
    let dataArr = [];
    for (let row of results) {
      let o = { ts: moment(row.time).valueOf() };

      // remove timestamp from values
      delete row.time;

      // remove null entries
      Object.entries(row).forEach((o) => {
        if (o[1] == null) delete row[o[0]];
      });

      o.values = row;
      dataArr.push(o);
    }
    return dataArr;
  }
}

module.exports = InfluxDB;
