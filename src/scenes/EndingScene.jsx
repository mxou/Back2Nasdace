import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Stars, OrbitControls } from "@react-three/drei";
import Ship from "../components3D/Ship";
import ATH from "../components/ATH";
import { useState } from "react";
import Dialogues from "../components/Dialogues";
import dialogIa from "../assets/dialogues/ia-folle.json";
import NasdaceCity from "../components3D/NasdaceCity";

export default function EndingScene({ playerData }) {
  const [showDialog, setShowDialog] = useState(false);
  const [gameStart, setGameStart] = useState(false);

  const shipRef = useRef(); // Référence pour le vaisseau

  const handleDialogueEnd = () => {
    setShowDialog(false);
    const gameTimer = setTimeout(() => {
      setGameStart(true);
    }, 500);
    return () => clearTimeout(gameTimer);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDialog(true);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Mise à jour de la position du vaisseau
  useEffect(() => {
    if (shipRef.current) {
      const moveShipInterval = setInterval(() => {
        // Avancer le vaisseau en permanence sur l'axe Z
        shipRef.current.position.z -= 0.1;
      }, 16); // 60 FPS

      return () => clearInterval(moveShipInterval);
    }
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ATH showChrono={false} />
      {showDialog && (
        <Dialogues dialogFile={dialogIa} onEnd={handleDialogueEnd} />
      )}
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 45 }}>
        {/* Fond étoilé */}
        <Stars radius={100} depth={500} count={5000} factor={4} />

        {/* Éclairage */}
        <directionalLight intensity={1.5} castShadow position={[5, 10, 5]} />
        <ambientLight intensity={0.4} />

        <NasdaceCity position={[0, -50, 0]} scale={[10, 10, 10]} />

        {/* Simulation physique et vaisseau */}
        <Physics>
          <Ship
            ref={shipRef}
            position={[0, 0, 0]} // Initial position
            scale={6}
            colors={playerData}
            gravity={0}
          />
        </Physics>

        {/* Contrôles caméra : Désactivation de la rotation et des translations */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}
