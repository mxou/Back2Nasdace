import React, { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Stars, OrbitControls } from "@react-three/drei";
import ShipSus from "../components3D/ShipSus";
import ATH from "../components/ATH";
import { useState } from "react";
import Dialogues from "../components/Dialogues/Dialogues";
import dialogEnding from "../assets/dialogues/ending.json";
import NasdaceCity from "../components3D/NasdaceCity";

export default function EndingScene({ playerData }) {
  const [showDialog, setShowDialog] = useState(false);
  const [gameStart, setGameStart] = useState(false);

  const CameraController = () => {
    const { camera } = useThree();

    camera.position.set(100, 200, 50);
    camera.lookAt(-Math.PI / 2, 0, 0);
    camera.fov = 45;

    return null;
  };

  const shipRef = useRef(); // Référence pour le vaisseau

  const handleDialogueEnd = () => {
    setShowDialog(false);
    const gameTimer = setTimeout(() => {
      setGameStart(true);
    }, 500);
    return () => clearTimeout(gameTimer);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ATH showChrono={false} />
      {showDialog && (
        <Dialogues
          dialogFile={dialogEnding}
          onEnd={handleDialogueEnd}
          userName={playerData.name}
        />
      )}
      <Canvas>
        <CameraController />
        {/* Fond étoilé */}
        <Stars radius={100} depth={500} count={5000} factor={4} />

        {/* Éclairage */}
        <directionalLight intensity={1.5} castShadow position={[5, 10, 5]} />
        <ambientLight intensity={0.4} />

        {/* Simulation physique et vaisseau */}
        <Physics>
          <NasdaceCity position={[0, -200, 0]} scale={[1, 1, 1]} />
          <ShipSus
            ref={shipRef}
            position={[0, 200, 0]} // Initial position
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
