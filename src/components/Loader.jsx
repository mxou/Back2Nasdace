import React from "react";
import { useProgress } from "@react-three/drei";

export default function Loader() {
  const { progress } = useProgress(); // Obtient le pourcentage du chargement

  return (
    <div style={styles.loader}>
      <p>Chargement... {Math.round(progress)}%</p>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }}></div>
      </div>
    </div>
  );
}

const styles = {
  loader: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "black",
    color: "white",
    padding: "20px",
    borderRadius: "10px",
    fontSize: "18px",
    textAlign: "center",
    width: "250px",
  },
  progressBar: {
    marginTop: "10px",
    width: "100%",
    height: "10px",
    backgroundColor: "#444",
    borderRadius: "5px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "limegreen",
    transition: "width 0.3s ease-in-out",
  },
};
