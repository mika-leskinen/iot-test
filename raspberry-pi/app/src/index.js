const moment = require("moment");
const Rpi5 = require("./rpi5");
const RandomData = require("./randomData");

// looping main function
const main = async () => {
  // create data message, read values and send to backend

  // init with unix milliseconds timestamp
  // see https://en.wikipedia.org/wiki/Unix_time
  let data = { ts: moment().valueOf(), values: {} };

  // get Rpi CPU temperature
  //data.values["cpu_temp"] = await Rpi5.getCpuTemp();

  // get random float value
  data.values["random_value"] = await RandomData.getRandomFloat(20, 200);

  // output to console
  // TODO: send to cloud backend instead
  console.log(data);
};

// run once
main();

// run every 10 seconds
// TODO: add proper scheduling
setInterval(() => {
  main();
}, 10 * 1000);
