import React from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Stars, OrbitControls } from "@react-three/drei";
import Ship from "../components3D/Ship";
import ATH from "../components/ATH";
import { useState } from "react";
import Dialogues from "../components/Dialogues";
import dialogData from "../assets/dialogues/dialog.json";

export default function EndingScene({ playerData }) {
  console.log(playerData);
  const [showDialog, setShowDialog] = useState(true);
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ATH showChrono={false} />
      {showDialog && (
        <Dialogues dialogFile={dialogData} onEnd={() => setShowDialog(false)} />
      )}
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 45 }}>
        {/* Fond étoilé */}
        <Stars radius={100} depth={50} count={5000} factor={4} />

        {/* Éclairage */}
        <directionalLight intensity={1.5} castShadow position={[5, 10, 5]} />
        <ambientLight intensity={0.4} />

        {/* Simulation physique et vaisseau */}
        <Physics>
          <Ship
            position={[0, 0, 0]}
            scale={6}
            colors={playerData}
            gravity={0}
          />
        </Physics>

        {/* Contrôles caméra */}
        <OrbitControls />
      </Canvas>
    </div>
  );
}
