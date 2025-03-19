import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Stars, OrbitControls } from "@react-three/drei";
import ShipSus from "../components3D/ShipSus";
import ATH from "../components/ATH";
import { useState } from "react";
import Dialogues from "../components/Dialogues/Dialogues";
import dialogIa from "../assets/dialogues/ia-folle.json";
import RhythmGame from "../components/RythmGame/RythmGame";
import { useNavigate } from "react-router-dom";
import hitSoundFile from "/src/assets/audio/hit.wav";
import missSoundFile from "/src/assets/audio/miss.wav";

export default function RythmGameScene({ playerData }) {
  const [showDialog, setShowDialog] = useState(false);
  const [gameStart, setGameStart] = useState(false);
  const [hasScored, setHasScored] = useState(false);

  const hitSound = new Audio(hitSoundFile);
  const missSound = new Audio(missSoundFile);

  hitSound.volume = 0.3;
  missSound.volume = 0.3;

  const navigate = useNavigate();

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
      {gameStart ? (
        <RhythmGame
          hasScored={hasScored}
          setHasScored={setHasScored}
          hitSound={hitSound}
          missSound={missSound}
          navigate={navigate}
        />
      ) : null}
      <Canvas shadows camera={{ position: [10, 10, 20], fov: 45 }}>
        {/* Fond étoilé */}
        <Stars radius={100} depth={500} count={5000} factor={4} />

        {/* Éclairage */}
        <directionalLight intensity={1.5} castShadow position={[5, 10, 5]} />
        <ambientLight intensity={0.4} />

        {/* Simulation physique et vaisseau */}
        <Physics>
          <ShipSus
            ref={shipRef}
            position={[0, 0, 0]} // Initial position
            scale={6}
            colors={playerData}
            idleSpace
            gravity={0}
          />
        </Physics>

        {/* Contrôles caméra : Désactivation de la rotation et des translations */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}
