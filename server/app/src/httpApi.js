const moment = require("moment");

class HttpApi {
  constructor(options = { expressApp: null, influxDb: null }) {
    if (options.expressApp == null || options.influxDb == null) {
      console.log("http api - constructor err");
      return;
    }
    this.app = options.expressApp;
    this.influx = options.influxDb;
    console.log("http api - init");
  }

  // routes
  registerRoutes() {
    // GET timeseries data
    this.app.get("/api/timeseries", async (req, res) => {
      try {
        // get time range from request query parameters startTs and endTs
        // defaults to last 1h
        const startMoment = moment(
          req.query.startTs || moment().subtract(1, "hour")
        );
        const endMoment = moment(req.query.endTs || moment());

        if (!startMoment.isValid() || !endMoment.isValid()) {
          console.error("http api - err: bad request");
          return res.status(400).json({ msg: "BAD_REQUEST" });
        }

        const startTs = startMoment.valueOf();
        const endTs = endMoment.valueOf();

        // should be safe to pass moment().valueOf() results directly to query
        // see https://www.w3schools.com/sql/sql_injection.asp
        let results = await this.influx.db.query(
          `SELECT * FROM "${this.influx.measurementName}" WHERE time >= ${startTs}ms AND time <= ${endTs}ms`
        );

        // format as {{ts: TS, values: {KEY: VAL}}}
        let dataArr = [];
        for (let row of results) {
          let o = { ts: moment(row.time).valueOf() };
          delete row.time;
          o.values = { ...row };
          dataArr.push(o);
        }

        // return as json
        return res.json(dataArr);
      } catch (err) {
        console.error("http api - err: " + err.message);
        return res.status(500).json({ msg: "err: " + err.message });
      }
    });

    console.log("http api - registerRoutes");
  }
}

module.exports = HttpApi;
