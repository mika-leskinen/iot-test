const util = require("util");

// See https://www.geeksforgeeks.org/node-js-util-promisify-method/
const exec = util.promisify(require("child_process").exec);

/*
See https://github.com/Sensirion/raspberry-pi-i2c-scd30

Note: modify the example program (scd30_i2c_example_usage.c) so that it only makes a single measurement & exits:

1. Comment out or delete this line:
     printf("firmware version major: %u minor: %u\n", major, minor)
2. Change this line:
     for (repetition = 0; repetition < 30; repetition++) {
   to this:
     for (repetition = 0; repetition < 1; repetition++) {
3. Duplicate this line if co2_concentration is always zero:
     error = scd30_blocking_read_measurement_data(&co2_concentration, &temperature, &humidity);

4. Re-compile
5. Copy the resulting binary to app/scd30 (or put absolute path to RASPI_SCD30_EXEC_PATH environment variable)

Output from running the program should be like:
co2_concentration: 590.87 temperature: 26.45 humidity: 18.69
*/

class SCD30 {
  constructor(execPath = "./scd30") {
    this.execPath = execPath;
  }

  async getValues() {
    try {
      const { stdout, stderr } = await exec(this.execPath);

      if (stderr) {
        console.error("scd30 - err: " + stderr);
        return null;
      }

      let values = {
        co2_concentration: null,
        temperature: null,
        humidity: null,
      };

      // split output to get ["key:", "value", "key:", "value", "key:", "value"]
      const parts = stdout.split(" ");

      // check if there are exactly 3 key-value pairs:
      if (parts.length < 6) {
        console.error("scd30 - err: invalid data");
        return null;
      }

      // put the values to the values object (order should always be the same):
      values.co2_concentration = parseFloat(parts[1]);
      values.temperature = parseFloat(parts[3]);
      values.humidity = parseFloat(parts[5]);

      // values object should now be like {co2_concentration: 0.0, temperature: 0.0, humidity: 0.0}
      return values;
    } catch (err) {
      console.error("scd30 - err: " + err.message);
      return null;
    }
  }
}

module.exports = SCD30;
