import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import moment from "moment";
import { Button, Col, Dropdown, Row } from "react-bootstrap";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";

const fetchUrl = (import.meta.env.VITE_API_BASE_URL || "") + "/api/timeseries";

// TODO
const DataChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState("");
  const [fields, setFields] = useState([]);
  const [startMoment, setStartMoment] = useState(moment().subtract(1, "hour"));
  const [endMoment, setEndMoment] = useState(moment());

  // api call
  const getData = (startTs, endTs) => {
    fetch(fetchUrl + "?startTs=" + startTs + "&endTs=" + endTs)
      .then((res) => res.json())
      .then((res) => {
        setData(
          res.map((r) => {
            return { ...r, ts: moment(r.ts).format("YYYY-MM-DD HH:mm:ss") };
          })
        );
        setLoading(false);
      });
  };

  // get data for current day by default
  useEffect(() => {
    getData(moment().subtract(1, "hour").valueOf(), moment().valueOf());
  }, []);

  // if no field is selected, use the first one by default
  // also get field names whenever data changes
  useEffect(() => {
    if (data[0]) {
      if (selectedField === "") {
        setSelectedField(Object.keys(data[0]?.values)[0]);
      }
      let fieldArr = [];
      for (const row of data) {
        for (const f of Object.keys(row.values)) {
          if (!fieldArr.includes(f)) fieldArr.push(f);
        }
      }
      setFields(fieldArr);
    }
  }, [data, selectedField]);

  return (
    <div className="align-items-center w-100 h-100">
      <h1 className="fs-3 mb-4">Data Chart</h1>
      {loading ? (
        <p>
          <i>Imagine a loading spinner here...</i>
        </p>
      ) : (
        <div className="h-100">
          <Row className="m-0 p-0 mb-3 pb-3">
            {/* measurement selection */}
            <Col sm={12} lg={3}>
              <Dropdown
                onSelect={(e) => {
                  setSelectedField(e);
                }}
              >
                <Dropdown.Toggle variant="secondary" className="form-control">
                  {selectedField}
                </Dropdown.Toggle>
                <Dropdown.Menu className="form-control">
                  {fields.map((f, i) => {
                    return (
                      <Dropdown.Item
                        key={"dd-" + i}
                        eventKey={f}
                        active={selectedField === f}
                      >
                        {f}
                      </Dropdown.Item>
                    );
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col sm={12} lg={3}>
              {/* time range selection */}
              <DateTimePicker
                disableClock
                className="form-control m-0"
                clearIcon={false}
                locale="fi-FI"
                onChange={(e) => {
                  if (moment(e, "YYYY-MM-DD HH:mm:ss", true).isValid())
                    setStartMoment(moment(e));
                }}
                value={startMoment.toDate()}
              ></DateTimePicker>
            </Col>
            <Col sm={12} lg={3}>
              <DateTimePicker
                disableClock
                className="form-control"
                clearIcon={false}
                locale="fi-FI"
                onChange={(e) => {
                  if (moment(e, "YYYY-MM-DD HH:mm:ss", true).isValid())
                    setEndMoment(moment(e));
                }}
                value={endMoment.toDate()}
              ></DateTimePicker>
            </Col>
            <Col sm={12} lg={2}>
              <Button
                className="form-control"
                onClick={() =>
                  getData(startMoment.valueOf(), endMoment.valueOf())
                }
              >
                Go
              </Button>
            </Col>
          </Row>

          {/* chart element */}
          <div className="h-100">
            <ResponsiveContainer width="100%" height="60%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="1 3" />
                <Line
                  dataKey={(o) => o.values[selectedField]}
                  name={selectedField}
                  type="monotone"
                  dot={false}
                ></Line>
                <XAxis dataKey="ts"></XAxis>
                <YAxis tickCount={6} interval={0}></YAxis>
                <Tooltip
                  content={({ payload }) => {
                    if (payload == null || payload[0] == null) return <></>;
                    const dt = moment(payload[0]?.payload?.ts).format(
                      "D.M.YYYY HH:mm:ss"
                    );
                    const val = payload[0]?.value;

                    return (
                      <>
                        <div className="bg-dark text-white p-3">
                          <h2 className="fs-6">{dt}</h2>
                          <hr className="p-0 m-0"></hr>
                          <span className="small">
                            {selectedField}: <b>{val}</b>
                          </span>
                        </div>
                      </>
                    );
                  }}
                ></Tooltip>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataChart;
