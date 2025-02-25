const Influx = require("influx");

// see https://docs.influxdata.com/influxdb/v1/
// also see https://node-influx.github.io/manual/tutorial.html

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
  async saveTimeseries(measurementName = this.measurementName, dataObj) {
    try {
      await this.db.writePoints([
        {
          measurement: measurementName,
          timestamp: dataObj.ts,
          fields: dataObj.values,
        },
      ]);
      console.log("influxdb - writePoints OK");
    } catch (err) {
      console.error("influxdb - err: " + err.message);
    }
  }

  // get measurements
  async getTimeseries() {
    // TODO: getTimeseries
  }
}

module.exports = InfluxDB;
