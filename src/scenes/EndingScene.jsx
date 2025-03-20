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
import { userData } from "three/tsl";
import { useNavigate } from "react-router-dom";
import GameOver from "../components/GameOver.jsx/GameOver";
import { useLocation } from "react-router-dom";

export default function EndingScene({ playerData }) {
  const [showDialog, setShowDialog] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const location = useLocation();
  const { fuel } = location.state || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (!playerData) {
      navigate("/");
    }
  });

  useEffect(() => {
    setTimeout(() => {
      setShowDialog(true);
    }, 5000);
  }, []);

  const handleDialogEnd = () => {
    setGameOver(true);
    console.log("pq ça marche apos");
  };

  const CameraController = () => {
    const { camera } = useThree();

    camera.position.set(100, 200, 50);
    camera.lookAt(-Math.PI / 2, 0, 0);
    camera.fov = 45;

    return null;
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ATH showChrono={false} fuel={fuel} />
      {showDialog && (
        <Dialogues
          dialogFile={dialogEnding}
          onComplete={() => setGameOver(true)}
          userName={playerData.name}
        />
      )}
      {gameOver && (
        <GameOver
          reason={"Et non, il n'y a jamais eu de Nasdace City sur Mars..."}
          onMainMenu={() => {
            navigate("/");
          }}
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
            position={[5, 100, 0]} // Initial position
            scale={6}
            colors={playerData}
            gravity={0.33}
            isAtterrissaging={true}
          />
        </Physics>

        {/* Contrôles caméra : Désactivation de la rotation et des translations */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}
