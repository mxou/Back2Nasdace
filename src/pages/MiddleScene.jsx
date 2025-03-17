import React, { useState, useRef } from "react";
import Quiz from "../components/Quiz";
import Blaster from "../components/Blaster";
import SpaceshipGame from "../components/SpaceshipGame";
import ATH from "../components/ATH";
import SpaceshipInterior from "../components/SpaceShipInterior";
export default function MiddleScene() {
  const [fuel, setFuel] = useState(100);
  const playerRef = useRef(); // Création du ref pour le player

  return (
    <div
      style={{
        textAlign: "center",
        fontSize: "24px",
      }}
    >
      <h1>Bienvenue dans la Zone Tests</h1>
      <p>Ici, tu peux tester tes fonctionnalités.</p>
      <div style={{ width: "100dvw", height: "100dvh" }}>
        {/* Ajout de SpaceshipInterior ici */}
        {/* <SpaceshipInterior playerRef={playerRef} /> */}

        {/* Les autres composants */}
        <ATH showChrono={false} fuel={fuel} />
        {/* <Quiz setter={setFuel} fuel={fuel} /> */}
        <SpaceshipGame />

        {/* <Blaster setter={setFuel} fuel={fuel} /> */}
      </div>
    </div>
  );
}
