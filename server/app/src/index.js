const express = require("express");
const SQLite = require("./sqlite3");

// see https://expressjs.com/en/starter/installing.html
const app = express();
app.use(express.json());

// sqlite3 database
const db = new SQLite();
db.init();

// default GET response
app.get("/", (req, res) => {
  return res.json({ msg: "OK" });
});

// data POST endpoint
app.post("/data", (req, res) => {
  // get data object from request as {ts: TS, values: {key: VAL}}
  let data = req.body;
  try {
    // extract ms timestamp from data:
    const ts = data.ts;

    // remove ms timestamp from data:
    delete data.ts;

    // insert to database (ts = TS, json = '{"key": VAL}'):
    // NOTE: see https://stackoverflow.com/questions/15367696/storing-json-in-database-vs-having-a-new-column-for-each-key
    db.query("INSERT INTO measurements(ts, json) VALUES(?, ?)", [
      ts,
      JSON.stringify(data.values),
    ]);

    console.log("main - db data write: OK");

    // send JSON response:
    return res.json({ msg: "OK" });
  } catch (err) {
    console.error("main - err: " + err.message);

    // send JSON error message
    return res.status(500).json({ msg: "NOT_OK" });
  }
});

// default port 9999
const port = process.env.PORT || 9999;

// start express server:
app.listen(port, () => {
  console.log("Listen: " + port);
});
