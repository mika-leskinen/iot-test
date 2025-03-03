require("dotenv").config();

// "logging middleware"
require("./logging/console");

//--- datastores:

// sqlite3 database
const SQLite = require("./datastore/sqlite3");
const sqlite3 = new SQLite("./test.sqlite3");
sqlite3.init();

// influxdb database
const InfluxDB = require("./datastore/influxdb");
const influxdb = new InfluxDB({
  dbHost: process.env.INFLUX_HOST || "localhost",
  dbPort: process.env.INFLUX_PORT || 8086,
  dbName: process.env.INFLUX_DB_NAME || "iot-test-influxdb",
  measurementName: "iot-test-raspberrypi",
});

const datastores = [sqlite3, influxdb];

// http api
// options.datastores items should have async methods saveTimeseries(dataObj) and getTimeseries(startTs, endTs)
// NOTE: this saves data to all datastores, fetches data from the first one
const HttpApi = require("./httpApi");

new HttpApi({
  port: process.env.PORT || 9999,
  datastores,
});

// mqtt
// TODO: refactor
const Mqtt = require("./telemetry/mqtt");

const mqtt = new Mqtt({
  host: process.env.MQTT_HOST || "127.0.0.1",
  port: process.env.MQTT_PORT || 1883,
});

const topicName = process.env.MQTT_TELEMETRY_TOPIC || "iot-test/telemetry";
mqtt.client.subscribe(topicName);

mqtt.client.on("message", (topic, message) => {
  if (topic === topicName) {
    console.log(
      "mqtt - received message on [" + topic + "]: " + message.toString()
    );
    // save data to database
    /*
    for (const ds of datastores) {
      ds.saveTimeseries(JSON.parse(message.toString()));
    }
    */
  }
});
