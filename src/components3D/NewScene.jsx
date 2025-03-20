import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Gltf, OrbitControls } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import { useNavigate } from "react-router-dom";
import Ship from "../components3D/Ship.jsx";
import * as THREE from "three";
import Popup from "../components/Popup.jsx";
import ControlPannel from "../components/ControlPannel.jsx";
import MusicPlayer from "../components/MusicPlayer.jsx";
import marioGalaxyFile from "/audio/galaxyAmbient.mp3";
import nightFile from "/src/assets/modeles/night.hdr";
import islandModel from "/src/assets/modeles/Island.glb";

export default function NewScene({ playerData }) {
  const cameraRef = useRef();
  const targetRef = useRef(); // Création d'une référence pour la cible à regarder
  const targetPosition = [0, 1, 0]; // Position de la cible à regarder
  const [showPopup, setShowPopup] = useState(false);
  const [showControlPannel, setShowControlPannel] = useState(false);
  const [takeoff, setTakeoff] = useState(false);
  const navigate = useNavigate();

  const handleTakeoff = () => {
    setTakeoff(true); // Met l'état de décollage à true
    console.log("Décollage lancé !");
    setTimeout(() => {
      navigate("/interior");
    }, 3000);
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
    const timerPannel = setTimeout(() => setShowControlPannel(true), 10);
    return () => clearTimeout(timerPannel);
  }, []);

  return (
    <>
      <MusicPlayer path={marioGalaxyFile} />
      <Canvas>
        {/* Caméra de la scène */}
        <PerspectiveCamera
          makeDefault
          ref={cameraRef}
          position={[-1, -0.5, -20]} // Position initiale de la caméra
          fov={75}
          near={0.1}
          far={1000}
        />

        {/* Contrôles d'orbite */}
        <OrbitControls enabled={false} />

        {/* Environnement */}
        <Environment files={nightFile} ground={{ scale: 100 }} />

        {/* Lumières */}
        <directionalLight intensity={0.9} castShadow position={[-20, 20, 20]} />
        <ambientLight intensity={0.2} />

        {/* Physique */}
        <Physics timeStep="vary">
          <RigidBody type="fixed" colliders="trimesh">
            <Gltf position={[10, 0, 5]} castShadow receiveShadow scale={125} src={islandModel} />
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
          message={`${playerData.name} occupe toi du control pannel nous on peut pas, on a pas de bras, c'est simple, active tout PUIS appuie sur le gros bouton rouge`}
        />
      )}
      {showControlPannel && <ControlPannel takeoff={handleTakeoff} />}
    </>
  );
}
