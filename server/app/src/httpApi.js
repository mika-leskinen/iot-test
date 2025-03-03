const moment = require("moment");
const express = require("express");

// see https://expressjs.com/en/starter/installing.html

class HttpApi {
  constructor(options = { port: 9999, datastores: null }) {
    this.app = express();
    this.app.use(express.json());

    this.port = options.port;
    this.datastores = options.datastores;

    if (!(this.datastores?.length > 0)) {
      console.error("http api - constructor err");
      return;
    }

    // start express server:
    this.app.listen(this.port, () => {
      console.log("Listen: " + this.port);
    });

    // create routes
    this.registerRoutes();
  }

  // routes
  registerRoutes() {
    // POST timeseries data
    this.app.post("/data", async (req, res) => {
      // get data object from request as {ts: TS, values: {key: VAL}}
      let data = req.body;

      if (data?.ts == null) {
        console.error("http api - post: 400");
        return res.status(400).json({ msg: "BAD_REQUEST" });
      }

      try {
        console.log("http api - db data write");

        // insert to datastores
        for (const ds of this.datastores) {
          await ds.saveTimeseries(data);
        }

        // send JSON response:
        return res.json({ msg: "OK" });
      } catch (err) {
        console.error("main - err: " + err.message);

        // send JSON error message
        return res.status(500).json({ msg: "NOT_OK" });
      }
    });

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

        // call async getTimeseries(start, end) of first datastore (influxdb, sqlite3 or whatever that has such method)
        // NOTE: promise should return array in the format [{ts: TS, values: {KEY: VAL}}]
        const data = await this.datastores[0].getTimeseries(startTs, endTs);

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
