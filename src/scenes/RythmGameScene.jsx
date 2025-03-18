import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Stars, OrbitControls } from "@react-three/drei";
import Ship from "../components3D/Ship";
import ATH from "../components/ATH";
import { useState } from "react";
import Dialogues from "../components/Dialogues/Dialogues";
import dialogIa from "../assets/dialogues/ia-folle.json";
import RhythmGame from "../components/RythmGame/RythmGame";

export default function RythmGameScene({ playerData }) {
  const [showDialog, setShowDialog] = useState(false);
  const [gameStart, setGameStart] = useState(false);

  const shipRef = useRef(); // Référence pour le vaisseau
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDialog(true);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ATH showChrono={false} />
      {showDialog ? (
        <Dialogues
          dialogFile={dialogIa}
          onComplete={() => setGameStart(true)}
          autoSkip={false}
          userName={playerData.name}
        />
      ) : null}
      {gameStart ? <RhythmGame /> : null}
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 45 }}>
        {/* Fond étoilé */}
        <Stars radius={100} depth={500} count={5000} factor={4} />

        {/* Éclairage */}
        <directionalLight intensity={1.5} castShadow position={[5, 10, 5]} />
        <ambientLight intensity={0.4} />

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
