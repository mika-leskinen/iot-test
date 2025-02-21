// see https://www.npmjs.com/package/dotenv
require("dotenv").config();

// see https://nodejs.org/api/fs.html#file-system
const fs = require("fs/promises");

// see https://www.npmjs.com/package/moment
const moment = require("moment");

// also see https://www.freecodecamp.org/news/requiring-modules-in-node-js-everything-you-need-to-know-e7fbd119be8/
const Rpi5 = require("./devices/rpi5");
const RandomData = require("./devices/randomData");
const SCD30 = require("./devices/scd30");
const Http = require("./telemetry/http");

// looping main function
const main = async () => {
  // create data message, read values and send to backend

  // create class instances
  const rpi5 = new Rpi5();
  const randomData = new RandomData();
  const scd30 = new SCD30(process.env.SCD30_EXEC_PATH);

  // get current timestamp
  const m = moment();

  // init data object with unix milliseconds timestamp
  // see https://en.wikipedia.org/wiki/Unix_time
  let data = { ts: m.valueOf(), values: {} };

  // get Rpi CPU temperature
  data.values["RPI5_cpu_temp"] = (await rpi5.getCpuTemp())?.cpuTemp;

  // get random float value
  data.values["TEST_random_float"] = (
    await randomData.getRandomFloat(20, 200)
  )?.randomFloat;

  // get SCD30 values
  // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  // also see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

  // get the values
  const { co2_concentration, temperature, humidity } =
    (await scd30.getValues()) || {};

  data.values = {
    ...data.values,
    SCD30_co2_concentration: co2_concentration,
    SCD30_temperature: temperature,
    SCD30_humidity: humidity,
  };

  // output to console
  console.log(JSON.stringify(data));

  // save to file
  // creates new file for each day as in "2025-02-12.dat" (file will not be valid JSON)
  fs.appendFile(
    (process.env.RASPI_DATA_DIR || "./data") +
      "/" +
      m.format("YYYY-MM-DD") +
      ".dat",
    JSON.stringify(data)
  );

  // send to cloud backend
  Http.postJson(
    "http://" +
      (process.env.SERVER_IP || "127.0.0.1") +
      ":" +
      (process.env.SERVER_PORT || 9999) +
      "/data",
    data
  );
};

// run once
main();

// run every 10 seconds
// TODO: add proper scheduling
setInterval(() => {
  main();
}, 10 * 1000);
