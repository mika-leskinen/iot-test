const moment = require("moment");

// this thing adds timestamp and severity to console.log and console.error output
// NOTE: these work properly only when called with a single "string" parameter
// NOTE: use something else really

// original functions
const originalLog = console.log;
const originalError = console.error;

console.realLog = originalLog;

// override log
console.log = (msg) => {
  originalLog(
    "[" +
      moment().format("YYYY-MM-DD HH:mm:ss") +
      "] [\x1b[36minfo\x1b[0m] " +
      msg
  );
};

// override error
console.error = (msg) => {
  originalError(
    "[" +
      moment().format("YYYY-MM-DD HH:mm:ss") +
      "] [\x1b[31merror\x1b[0m] " +
      msg
  );
};
