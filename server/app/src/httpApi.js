const moment = require("moment");

class HttpApi {
  constructor(options = { expressApp: null, datastore: null }) {
    if (options.expressApp == null || options.datastore == null) {
      console.log("http api - constructor err");
      return;
    }

    this.app = options.expressApp;
    this.datastore = options.datastore;
    console.log("http api - init");
  }

  // routes
  registerRoutes() {
    // GET timeseries data
    this.app.get("/api/timeseries", async (req, res) => {
      try {
        // get time range from request query parameters startTs and endTs (YYYY-MM-DD HH:mm:ss || UNIX_MS)

        // this supports both ISO datetime strings and UNIX_MS timestamps for some reason
        let unixStart = false;
        let unixEnd = false;

        const start = req.query.startTs;
        const end = req.query.endTs;

        // defaults to last 1h
        let startMoment = moment(start || moment().subtract(1, "hour"));
        let endMoment = moment(end);

        // if time does not have "-" characters in it, it's probably UNIX
        if (start && !String(start)?.includes("-")) unixStart = true;
        if (end && !String(end)?.includes("-")) unixEnd = true;

        // moment() does not understand UNIX as string, so parseInt here if UNIX
        if (start) startMoment = moment(unixStart ? parseInt(start) : start);
        if (end) endMoment = moment(unixEnd ? parseInt(end) : end);

        // check if any of that makes sense
        if (!startMoment.isValid() || !endMoment.isValid()) {
          console.error("http api - err: bad request");
          return res.status(400).json({ msg: "BAD_REQUEST" });
        }

        // convert both to UNIX anyway before db call
        const startTs = startMoment.valueOf();
        const endTs = endMoment.valueOf();

        // should be safe to pass moment().valueOf() results directly to query
        // see https://www.w3schools.com/sql/sql_injection.asp
        // call async getTimeseries(start, end) of datastore instance (influxdb, sqlite3 or whatever that has such method)
        // NOTE: promise should return array in the format [{ts: TS, values: {KEY: VAL}}]
        const data = await this.datastore.getTimeseries(startTs, endTs);

        // return as json
        return res.json(data);
      } catch (err) {
        console.error("http api - err: " + err.message);
        return res.status(500).json({ msg: "err: " + err.message });
      }
    });

    console.log("http api - registerRoutes");
  }
}

module.exports = HttpApi;
