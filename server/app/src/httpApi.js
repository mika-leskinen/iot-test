const moment = require("moment");
const express = require("express");
const cors = require("cors");
const { aggregateHourly } = require("../util");

// see https://expressjs.com/en/starter/installing.html

class HttpApi {
  constructor(options = { port: 9999, datastores: null }) {
    this.app = express();

    this.port = options.port;
    this.datastores = options.datastores;
    this.authToken = options.authToken;
    this.basicAuth = options.basicAuth;

    this.app.use(express.json());

    // TODO: cors
    this.app.use(
      cors({
        origin: "*",
      })
    );

    // add basic auth middleware to "/api" endpoint
    if (this.basicAuth != null) {
      this.app.use("/api*", this.basicAuth);
    }

    if (!(this.datastores?.length > 0) || !(this.authToken?.length > 0)) {
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
      // check if device is authorized
      // token should be sent as header "X-Authorization"
      // NOTE: seems like header names are all lowercase here
      if (!(req.headers?.["x-authorization"] === this.authToken)) {
        console.error(
          "http api - err: unauthorized device " + JSON.stringify(req.headers)
        );
        return res.status(401).json({ msg: "UNAUTHORIZED" });
      }

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

        // check alarm triggers && create alarms
        // use first datastore with this functionality
        const alarmDS = this.datastores.find(
          (d) => d.saveAlarm != null && typeof d.saveAlarm === "function"
        );
        if (alarmDS != null) {
          // get all triggers
          const triggers = await alarmDS.getAlarmTriggers();
          // loop incoming measurement key-values
          for (const [key, val] of Object.entries(data.values)) {
            // loop all triggers
            for (const arr of Object.entries(triggers)) {
              const t = arr[1];
              if (t.measurement_name === key) {
                // check condition (gt or lt)
                if (
                  (t.operator === "lt" &&
                    parseFloat(val) < parseFloat(t.value)) ||
                  (t.operator === "gt" && parseFloat(val) > parseFloat(t.value))
                ) {
                  //create alarm
                  const msg =
                    "ALARM: " +
                    key +
                    " value " +
                    val +
                    " " +
                    (t.operator == "lt" ? "<" : ">") +
                    " " +
                    t.value;

                  alarmDS.saveAlarm(msg);
                }
              }
            }
          }
        }

        // send JSON response:
        return res.json({ msg: "OK" });
      } catch (err) {
        console.error("http api - err: " + err.message);

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
        let result = data;

        // hourly average
        if (req.query.agg === "hourly") {
          result = aggregateHourly(data, startTs, endTs);
        }

        // return as json
        return res.json((result || []).slice(0, 500));
      } catch (err) {
        console.error("http api - err: " + err.message);
        return res.status(500).json({ msg: "err: " + err.message });
      }
    });

    // GET alarms
    this.app.get("/api/alarms", async (req, res) => {
      // use first datastore with the functionality
      const alarmDS = this.datastores.find(
        (d) => d.getAlarms != null && typeof d.getAlarms === "function"
      );
      if (alarmDS == null) {
        return res.status(404).json({ msg: "404 Not Found" });
      }
      // get all alarms
      const result = await alarmDS.getAlarms();

      // return last 500
      return res.json((result || []).slice(0, 500));
    });

    console.log("http api - registerRoutes");
  }
}

module.exports = HttpApi;
