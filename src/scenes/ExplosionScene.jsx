import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import Ship from "../components3D/Ship";
import NasdaceCity from "../components3D/NasdaceCity";
import ExplosionHandler from "../3Dhandlers/ExplosionHandler";
import { Stars } from "@react-three/drei";

export default function ExplosionScene(playerData) {
  const shipRef = useRef();
  const cityRef = useRef();
  const [explosionTriggered, setExplosionTriggered] = useState(false);

  useEffect(() => {
    const extiming = setTimeout(() => {
      setExplosionTriggered(true);
    }, 700);
    return () => clearInterval(extiming);
  }, []);

  // Fonction qui sera déclenchée lors de la collision
  const handleCollision = () => {
    setExplosionTriggered(true); // Déclenche l'explosion quand la collision est détectée
  };

  return (
    <Canvas
      camera={{
        position: [0, 15, 80], // Caméra éloignée
        fov: 50, // FOV cinématique
      }}
    >
      <Stars radius={100} depth={500} count={5000} factor={4} />
      <directionalLight intensity={1.5} castShadow position={[5, 10, 5]} />
      <ambientLight intensity={0.4} />
      {!explosionTriggered ? (
        <Physics>
          <NasdaceCity ref={cityRef} position={[0, -15, 0]} />

          <Ship
            ref={shipRef}
            position={[-50, 0, 30]} // Position initiale du vaisseau
            colors={playerData}
            onCollisionEnter={handleCollision} // Détection de collision pour le vaisseau
            isMoving={true}
          />
        </Physics>
      ) : null}

      <ExplosionHandler
        shipRef={shipRef}
        cityRef={cityRef}
        position={[0, -10, 0]}
        duration={2} // Durée de l'explosion
        explosionTriggered={explosionTriggered}
        setExplosionTriggered={setExplosionTriggered}
        scale={[6, 6, 6]}
      />
    </Canvas>
  );
}
