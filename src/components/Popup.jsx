import React, { useState, useEffect } from "react";

export default function Popup({ message }) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Déclenche l'animation de disparition après 5 secondes
    const timer1 = setTimeout(() => setFadeOut(true), 4000);
    // Cache complètement la popup après 4.5 secondes
    const timer2 = setTimeout(() => setIsVisible(false), 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{ ...styles.popup, opacity: fadeOut ? 0 : 1, transition: "opacity 1s ease-in-out" }}>
      <p>{message}</p>
    </div>
  );
}

const styles = {
  popup: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: "20px",
    borderRadius: "10px",
    border: "2px solid white",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "bold",
    color: "white",
  },
};
