const Influx = require("influx");

// see https://docs.influxdata.com/influxdb/v1/
// also see https://node-influx.github.io/manual/tutorial.html

class InfluxDB {
  constructor(
    dbHost = "localhost",
    dbPort = 8086,
    dbName = "iot-test-influxdb"
  ) {
    console.log(
      "influxdb - init (" + dbHost + ":" + dbPort + " " + dbName + ")"
    );
    // connect to influx
    this.db = new Influx.InfluxDB({
      host: dbHost,
      port: dbPort,
      database: dbName,
    });

    // create database
    this.db.createDatabase(dbName).catch((err) => {
      // err
      console.error("influxdb - err: " + err.message);
    });
  }

  // save measurements
  // dataObj format should be {ts: TS, values: {KEY: VAL}}
  async saveTimeseries(measurementName = "unknown", dataObj) {
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
