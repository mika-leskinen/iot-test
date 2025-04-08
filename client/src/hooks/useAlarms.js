import { useCallback, useEffect, useState } from "react";

const fetchIntervalMs = 10000;
const fetchUrl = (import.meta.env.VITE_API_BASE_URL || "") + "/api/alarms";

const useAlarms = (nValues = 500) => {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAlarms = useCallback(() => {
    fetch(fetchUrl).then((res) =>
      res.json().then((res) => {
        setAlarms(
          (res || []).sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, nValues)
        );
        setLoading(false);
      })
    );
  }, [nValues]);

  useEffect(() => {
    getAlarms();
    const i = setInterval(getAlarms, fetchIntervalMs);
    return () => {
      clearInterval(i);
    };
  }, [getAlarms]);

  return { alarms, loading };
};

export default useAlarms;
