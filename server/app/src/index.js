const express = require("express");

// see https://expressjs.com/en/starter/installing.html
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ msg: "OK" });
});

app.post("/data", (req, res) => {
  console.log(req.body);
  // TODO: save to db

  return res.json({ msg: "OK" });
});

const port = process.env.PORT || 9999;

app.listen(port, () => {
  console.log("Listen: " + port);
});
