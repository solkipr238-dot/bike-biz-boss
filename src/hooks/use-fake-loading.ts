import { useEffect, useState } from "react";

/** Small helper so every list can show its skeleton state on first paint. */
export function useFakeLoading(ms = 450) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
