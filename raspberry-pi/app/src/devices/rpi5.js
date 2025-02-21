const util = require("util");

// see https://www.geeksforgeeks.org/node-js-util-promisify-method/
const exec = util.promisify(require("child_process").exec);

class Rpi5 {
  // These work with Raspberry Pi 5 (and probably 4)

  // get CPU (or GPU? or both) temperature
  async getCpuTemp() {
    // see https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js
    // see also https://www.geeksforgeeks.org/awk-command-unixlinux-examples/
    const { stdout, stderr } = await exec(
      "vcgencmd measure_temp | awk -F \"[=']\" '{print($2)}'"
    );

    if (stderr) {
      console.error("rpi5 - err: " + stderr);
      return null;
    }

    // return output as {key: value}
    return { cpuTemp: parseFloat(stdout) };
  }
}

module.exports = Rpi5;
