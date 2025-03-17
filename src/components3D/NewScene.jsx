import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Gltf } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import Ship from "../components3D/Ship.jsx"; // Importer ton composant Ship

export default function NewScene({ playerData }) {
  const cameraRef = useRef(); // Référence pour la caméra
  const shipRef = useRef(); // Référence pour le vaisseau

  // Cette fonction doit être à l'intérieur du Canvas pour utiliser useFrame
  useFrame(() => {
    if (cameraRef.current && shipRef.current) {
      // Suivre le vaisseau
      const shipPosition = shipRef.current.position;
      cameraRef.current.position.lerp(
        { x: shipPosition.x, y: shipPosition.y + 5, z: shipPosition.z + 10 }, // Ajuste la position de la caméra par rapport au vaisseau
        0.1 // Lerp pour un mouvement fluide
      );
      cameraRef.current.lookAt(shipPosition); // La caméra regarde toujours le vaisseau
    }
  });

  return (
    <Canvas>
      {/* Caméra de la scène */}
      <PerspectiveCamera makeDefault ref={cameraRef} position={[0, 5, 10]} fov={75} near={0.1} far={1000} />

      {/* Environnement, avec l'usage du même HDR */}
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
        <Ship ref={shipRef} position={[0, 1, 0]} scale={6} colors={playerData} />
      </Physics>
    </Canvas>
  );
}
