import { useState } from "react";
import nasdacePic from "/src/assets/images/nasdace.jpg";

export default function Dialogues({ dialogFile, onEnd }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < dialogFile.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (onEnd) onEnd(); // Permet d’exécuter une action à la fin du dialogue
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "20px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        zIndex: 1000, // Force le dialogue au premier plan
        pointerEvents: "auto", // Permet les clics
      }}
      onClick={handleNext}
    >
      <div style={{ marginRight: "10px" }}>
        <img
          src={nasdacePic}
          alt=""
          style={{ width: "80px", borderRadius: "50%" }}
        />
      </div>
      <div>
        <h2>{dialogFile[currentIndex].name}</h2>
        <p>{dialogFile[currentIndex].text}</p>
      </div>
    </div>
  );
}
