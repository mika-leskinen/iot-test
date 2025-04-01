const moment = require("moment");

// data aggregation function (hourly averages)
// returns [{ts: TS, values: {KEY: VAL}}], has an object for each hour between startTime and endTime
// NOTE: thus values might be empty {}
const aggregateHourly = (data, startTime, endTime) => {
  console.log(JSON.stringify(data));
  let results = [];
  let hourly = {};

  // create "hourly" object keys (ms value for the beginning of each hour)
  for (
    const h = moment(startTime).startOf("hour");
    h <= moment(endTime).startOf("hour");
    h.add(1, "hour")
  ) {
    hourly[h.valueOf()] = {};
  }

  // group data entries by hour and get sum + count for each key in "values"
  for (const row of data) {
    const h = moment(row.ts).startOf("hour").valueOf();
    if (Object.keys(hourly).includes(h + "")) {
      for (const [k, v] of Object.entries(row.values)) {
        if (hourly[h][k] == null) hourly[h][k] = { sum: v, count: 1 };
        else {
          hourly[h][k] = {
            sum: hourly[h][k].sum + v,
            count: hourly[h][k].count + 1,
          };
        }
      }
    }
  }

  // calculate averages from grouped data and return formatted object array
  for (const [hour, data] of Object.entries(hourly)) {
    const o = { ts: parseInt(hour), values: {} };
    for (const [key, agg] of Object.entries(data)) {
      o.values[key] = agg.sum / agg.count;
    }
    results.push(o);
  }

  return results;
};

module.exports = { aggregateHourly };
