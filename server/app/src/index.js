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
const influxdb = new InfluxDB(
  process.env.INFLUX_HOST || "localhost",
  process.env.INFLUX_PORT || 8086,
  process.env.INFLUX_DB_NAME || "iot-test-influxdb"
);

//--- message listeners:

// http
const express = require("express");

// see https://expressjs.com/en/starter/installing.html
const app = express();
app.use(express.json());

// default GET response
app.get("/", (req, res) => {
  return res.json({ msg: "OK" });
});

// data POST endpoint
app.post("/data", (req, res) => {
  // get data object from request as {ts: TS, values: {key: VAL}}
  let data = req.body;
  try {
    // insert to sqlite3 database
    sqlite3.saveTimeseries("iot-test-raspberrypi", data);

    // insert to influxdb database
    influxdb.saveTimeseries("iot-test-raspberrypi", data);

    console.log("main - db data write: OK");

    // send JSON response:
    return res.json({ msg: "OK" });
  } catch (err) {
    console.error("main - err: " + err.message);

    // send JSON error message
    return res.status(500).json({ msg: "NOT_OK" });
  }
});

// default port 9999
const port = process.env.SERVER_HTTP_PORT || 9999;

// start express server:
app.listen(port, () => {
  console.log("Listen: " + port);
});

// mqtt
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
    // TODO: save data to database
  }
});
