import { useState, useEffect, useCallback } from "react";

const fetchIntervalMs = 10000;
const fetchUrl = (import.meta.env.VITE_API_BASE_URL || "") + "/api/timeseries";

const useLatestData = (nValues = 500) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  const getData = useCallback(() => {
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((res) => {
        // backend returns last 1h of values, ts ascending
        // -> order by ts descending and get only nValues values
        setData(
          (res || []).sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, nValues)
        );
        setLoading(false);
      });
  }, [nValues]);

  // get data every fetchIntervalMs milliseconds
  useEffect(() => {
    getData();
    const t = setInterval(() => {
      getData();
    }, fetchIntervalMs);

    return () => {
      clearInterval(t);
    };
  }, [getData]);

  return { data, loading };
};

export default useLatestData;
