import { useState, useEffect } from "react";

const Chrono = ({ initialTime = 60 }) => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div style={styles.chrono}>⏳ Temps : {time}s</div>;
};

const styles = {
  chrono: {
    fontSize: "20px",
    marginBottom: "10px",
  },
};

export default Chrono;
