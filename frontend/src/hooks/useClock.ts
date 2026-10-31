import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

/** Digital-camera style timestamp, e.g. `'26 10 31` and `14:05`. Updates every 15s. */
export function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);

  return {
    date: `'${String(now.getFullYear()).slice(2)} ${pad(now.getMonth() + 1)} ${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
  };
}
