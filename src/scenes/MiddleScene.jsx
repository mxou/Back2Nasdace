import React, { useState, useRef, useEffect } from "react";
import SpaceshipInterior from "../components/SpaceShipInterior";
import Dialogues from "../components/Dialogues/Dialogues";
import dialogInterior from "/src/assets/dialogues/interior";

export default function MiddleScene({ playerData }) {
  const [fuel, setFuel] = useState(100);
  const playerRef = useRef();
  const [showIntro, setShowIntro] = useState(true);
  const [showDialogue, setShowDialogue] = useState(false);

  // Effet pour masquer l'intro après 3 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      setShowDialogue(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        width: "100dvw",
        height: "100dvh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {showDialogue && (
        <Dialogues
          dialogFile={dialogInterior}
          onComplete={() => setShowDialogue(false)}
          userName={playerData.name}
        />
      )}
      {/* Affichage de l'intérieur du vaisseau avec les aliens */}
      <SpaceshipInterior playerRef={playerRef} playerData={playerData} />

      {/* Popup d'introduction */}
      {showIntro && (
        <div style={styles.introPopup}>
          <h2>Bienvenue à bord du vaisseau</h2>
          <p>
            Explorez l'intérieur et parlez aux aliens pour relever des défis
          </p>
        </div>
      )}
    </div>
  );
}

const styles = {
  introPopup: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background:
      "linear-gradient(135deg, rgba(15, 25, 65, 0.9) 0%, rgba(30, 40, 90, 0.9) 100%)",
    padding: "25px 30px",
    borderRadius: "15px",
    color: "#e6f7ff",
    fontSize: "22px",
    fontFamily: "'Rajdhani', 'Orbitron', sans-serif",
    zIndex: 20,
    border: "2px solid rgba(100, 180, 255, 0.6)",
    boxShadow:
      "0 0 30px rgba(80, 160, 255, 0.4), inset 0 0 15px rgba(80, 160, 255, 0.2)",
    textAlign: "center",
    minWidth: "300px",
    userSelect: "none",
    animation:
      "fadeIn 0.5s ease-in-out, fadeOut 0.5s ease-in-out 2.5s forwards",
  },
};
