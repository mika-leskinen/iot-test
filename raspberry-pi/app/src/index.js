const moment = require("moment");
const Rpi5 = require("./rpi5");
const RandomData = require("./randomData");
const SCD30 = require("./scd30");

// looping main function
const main = async () => {
  // create data message, read values and send to backend

  // init with unix milliseconds timestamp
  // see https://en.wikipedia.org/wiki/Unix_time
  let data = { ts: moment().valueOf(), values: {} };

  // get Rpi CPU temperature
  data.values["RPI5_cpu_temp"] = (await Rpi5.getCpuTemp())?.cpuTemp;

  // get random float value
  data.values["TEST_random_float"] = (
    await RandomData.getRandomFloat(20, 200)
  )?.randomFloat;

  // get SCD30 values
  // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  const { co2_concentration, temperature, humidity } = await SCD30.getValues();
  data.values = {
    ...data.values,
    SCD30_co2_concentration: co2_concentration,
    SCD30_temperature: temperature,
    SCD30_humidity: humidity,
  };

  // output to console
  console.log(data);

  // TODO: save to file

  // send to cloud backend
  try {
    const responseJson = await fetch(
      "http://" +
        (process.env.SERVER_IP || "192.168.255.10") +
        ":" +
        (process.env.SERVER_PORT || 9999) +
        "/data",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const response = await responseJson.json();
    if (response?.msg !== "OK") {
      return console.error("main - err: http response " + response.msg);
    }
    console.log("main - http post OK");
  } catch (err) {
    return console.error("main - err: " + err.message);
  }
};

// run once
main();

// run every 10 seconds
// TODO: add proper scheduling
setInterval(() => {
  main();
}, 10 * 1000);
