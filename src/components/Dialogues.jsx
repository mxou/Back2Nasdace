import { useState } from "react";

export default function Dialogues({ dialogFile, onEnd }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = import.meta.glob("/src/assets/images/*.jpg", { eager: true });

  const handleNext = () => {
    if (currentIndex < dialogFile.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (onEnd) onEnd(); // Exécuter une action à la fin du dialogue
    }
  };

  // Récupérer le chemin de l'image en fonction du nom de l'intervenant
  const currentDialog = dialogFile[currentIndex];
  const imagePath = images[`/src/assets/images/${currentDialog.name}.jpg`];

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
        zIndex: 1000,
        pointerEvents: "auto",
        width: "40vw",
        height: "100px",
      }}
      onClick={handleNext}
    >
      <div style={{ marginRight: "10px" }}>
        {imagePath && (
          <img
            src={imagePath.default}
            alt={currentDialog.name}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
            }}
          />
        )}
      </div>
      <div style={{ textAlign: "left", height: "100%" }}>
        <h2 style={{ marginBottom: "5px" }}>{currentDialog.name}</h2>
        <p>{currentDialog.text}</p>
      </div>
    </div>
  );
}
