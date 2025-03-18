import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Gltf, OrbitControls } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import Ship from "../components3D/Ship.jsx";
import * as THREE from "three";
import Popup from "../components/Popup.jsx";
import ControlPannel from "../components/ControlPannel.jsx";

export default function NewScene({ playerData }) {
  const cameraRef = useRef();
  const targetRef = useRef(); // Création d'une référence pour la cible à regarder
  const targetPosition = [0, 1, 0]; // Position de la cible à regarder
  const [showPopup, setShowPopup] = useState(false);
  const [showControlPannel, setShowControlPannel] = useState(false);
  const [takeoff, setTakeoff] = useState(false);

  const handleTakeoff = () => {
    setTakeoff(true);
    console.log("Décollage lancé !");
  };
  // Effet pour orienter la caméra vers la cible
  useEffect(() => {
    if (cameraRef.current && targetRef.current) {
      // Calculer la direction vers la cible
      cameraRef.current.lookAt(targetRef.current.position);
    }
  }, [targetPosition]); // L'effet sera déclenché à chaque changement de la position de la cible

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 500);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const timerPannel = setTimeout(() => setShowControlPannel(true), 3000);
    return () => clearTimeout(timerPannel);
  }, []);

  return (
    <>
      <Canvas>
        {/* Caméra de la scène */}
        <PerspectiveCamera
          makeDefault
          ref={cameraRef}
          position={[-1, 0, -20]} // Position initiale de la caméra
          fov={75}
          near={0.1}
          far={1000}
        />

        {/* Contrôles d'orbite */}
        <OrbitControls enabled={false} />

        {/* Environnement */}
        <Environment files="src/assets/modeles/night.hdr" ground={{ scale: 100 }} />

        {/* Lumières */}
        <directionalLight intensity={0.9} castShadow position={[-20, 20, 20]} />
        <ambientLight intensity={0.2} />

        {/* Physique */}
        <Physics timeStep="vary">
          <RigidBody type="fixed" colliders="trimesh">
            <Gltf position={[10, 0, 5]} castShadow receiveShadow scale={125} src="src/assets/modeles/Island.glb" />
          </RigidBody>

          {/* Affichage du vaisseau Ship */}
          <Ship position={[1, -1.8, -5]} scale={6} colors={playerData} takeoff={takeoff} />

          {/* Cible invisible pour la caméra */}
          <mesh ref={targetRef} position={targetPosition}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="red" visible={false} /> {/* Rendre la cible invisible */}
          </mesh>
        </Physics>
      </Canvas>
      {showPopup && (
        <Popup
          message={`Totu le monde est bien installé ? Bon il manque Klogsblurge, playerdata occupe toi du control pannel, c'est simple, amorce l'injection du Plutonium, active les propulseurs et appuie sur le gros bouton rouge`}
        />
      )}
      {showControlPannel && <ControlPannel takeoff={handleTakeoff} />}
    </>
  );
}
