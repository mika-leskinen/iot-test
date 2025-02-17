const fs = require("fs/promises");
const moment = require("moment");
const Rpi5 = require("./devices/rpi5");
const RandomData = require("./devices/randomData");
const SCD30 = require("./devices/scd30");
const HttpPost = require("./data-handling/http-post");

// looping main function
const main = async () => {
  // create data message, read values and send to backend

  // get current timestamp
  const m = moment();

  // init data object with unix milliseconds timestamp
  // see https://en.wikipedia.org/wiki/Unix_time
  let data = { ts: m.valueOf(), values: {} };

  // get Rpi CPU temperature
  data.values["RPI5_cpu_temp"] = (await Rpi5.getCpuTemp())?.cpuTemp;

  // get random float value
  data.values["TEST_random_float"] = (
    await RandomData.getRandomFloat(20, 200)
  )?.randomFloat;

  // get SCD30 values
  // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  const { co2_concentration, temperature, humidity } =
    (await SCD30.getValues()) || {};

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
  HttpPost.sendJson(
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
