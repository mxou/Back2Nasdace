import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// 3D MODELS COMPONENTS IMPORT
import Tree from "./components3D/Tree.jsx";
import MovingModel from "./components3D/MovingModel.jsx";
import Ship from "./components3D/Ship.jsx";
import Pad from "./components3D/Pad.jsx";
// 3D MODELS COMPONENTS IMPORT

export default function Scene() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [isFlying, setIsFlying] = useState(false);
  const cameraRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Bonjour ${name} !`);
    setIsFlying(true); // Déclenche le décollage 🚀
    setShowForm(false); // Cache le formulaire après validation
  };

  const trees = [
    { x: -2, z: -2, radius: 0.6 },
    { x: 2, z: 2, radius: 0.6 },
    { x: -3, z: 1, radius: 0.6 },
  ];

  return (
    <>
      {showForm && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
            zIndex: 5,
          }}
        >
          <h2>Entrez votre prénom :</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            <button type="submit">Valider</button>
          </form>
        </div>
      )}
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        onCreated={({ camera }) => (cameraRef.current = camera)} // Stocke la caméra dans le ref
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* Sol */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshLambertMaterial color="#228b22" />
        </mesh>

        {/* Arbres */}
        {trees.map((tree, index) => (
          <Tree key={index} position={[tree.x, 0, tree.z]} />
        ))}

        {/* Modèle en mouvement */}
        <MovingModel position={[0, 0, 0]} trees={trees} onPadEnter={() => setShowForm(true)} isWalking={false} />

        {/* 🚀 Passer cameraRef à Ship */}
        <Ship position={[3, 1, -2]} isFlying={isFlying} cameraRef={cameraRef} />

        <Ship position={[3, 1, -2]} isFlying={isFlying} />

        <Pad position={[1, 0, -2]} scale={[20, 20, 20]} />

        <OrbitControls />
      </Canvas>
    </>
  );
}
