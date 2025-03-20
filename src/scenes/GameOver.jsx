import React from "react";
import { useNavigate } from "react-router-dom";

const GameOver = () => {
  const navigate = useNavigate();

  const handleRestart = () => {
    navigate("/interior");
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Game Over</h1>
        <p style={styles.subtitle}>Vous avez épuisé tout votre carburant !</p>
        <button onClick={handleRestart} style={styles.button}>
          Rejouer
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #000428 0%, #004e92 100%)",
    fontFamily: "'Quantico', 'Arial', sans-serif",
    overflow: "hidden",
  },

  content: {
    background: "rgba(13, 20, 40, 0.85)",
    borderRadius: "15px",
    padding: "40px",
    width: "90%",
    maxWidth: "400px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 0, 0, 0.3)",
    boxShadow:
      "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 0, 0, 0.4), inset 0 0 15px rgba(255, 0, 0, 0.2)",
    textAlign: "center",
  },

  title: {
    fontSize: "2.5rem",
    marginBottom: "20px",
    color: "#ff0000",
    textShadow: "0 0 15px red, 0 0 30px red",
    textTransform: "uppercase",
    letterSpacing: "2px",
  },

  subtitle: {
    color: "#b8e0ff",
    fontSize: "1.1rem",
    marginBottom: "30px",
  },

  button: {
    padding: "15px 30px",
    background: "linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontFamily: "'Quantico', sans-serif",
    fontWeight: "bold",
    letterSpacing: "1px",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 5px 15px rgba(255, 65, 108, 0.4)",
    "&:hover": {
      boxShadow: "0 0 15px #ff416c, 0 0 20px #ff4b2b, 0 0 30px #ff4b2b",
      transform: "translateY(-2px)",
    },
  },
};

export default GameOver;
