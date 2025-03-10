import moment from "moment";
import useLatestData from "../hooks/useLatestData";

// display this many latest values
const nValues = 50;

const LatestDataTable = () => {
  const { data, loading } = useLatestData(nValues);

  // get unique keys to be used as table headers
  let keys = [];
  for (const row of data || []) {
    for (const key of Object.keys(row.values)) {
      if (!keys.includes(key)) keys.push(key);
    }
  }

  return (
    <div>
      <h1 className="fs-3 mb-3">Latest Data</h1>
      {loading ? (
        <p>
          <i>Imagine a loading spinner here...</i>
        </p>
      ) : data?.length <= 0 ? (
        <p>No data available.</p>
      ) : (
        <table className="table table-sm">
          <thead>
            <tr>
              <td>Date</td>
              <td>Time</td>

              {keys.map((k, i) => (
                <td key={"k" + i}>{k}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((row, i) => {
              const m = moment(row.ts);
              return (
                <tr key={"r" + i}>
                  <td>{m.format("D.M.YYYY")}</td>
                  <td>{m.format("HH:mm:ss")}</td>
                  {keys.map((k, j) => (
                    <td key={"c" + j}>{row.values[k] || ""}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LatestDataTable;
