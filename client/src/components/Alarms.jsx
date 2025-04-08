import React from "react";
import useAlarms from "../hooks/useAlarms";
import moment from "moment";

// TODO
const Alarms = () => {
  const { alarms, loading } = useAlarms();
  return (
    <div>
      <h1 className="fs-3 mb-3">Alarms</h1>
      {loading ? (
        <p>
          <i>Imagine a loading spinner here...</i>
        </p>
      ) : alarms?.length <= 0 ? (
        <p>No data available.</p>
      ) : (
        <table className="table table-sm">
          <thead>
            <tr>
              <td>Date</td>
              <td>Time</td>
              <td>Message</td>
            </tr>
            {alarms?.map((a, i) => {
              const m = moment(a.ts);
              return (
                <tr key={"a-" + i}>
                  <td>{m.format("D.M.YYYY")}</td>
                  <td>{m.format("HH:mm:ss")}</td>
                  <td>{a.message}</td>
                </tr>
              );
            })}
          </thead>
        </table>
      )}
    </div>
  );
};

export default Alarms;
