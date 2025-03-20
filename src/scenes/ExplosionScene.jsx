import React, { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import ShipSus from "../components3D/ShipSus";
import NasdaceCity from "../components3D/NasdaceCity";
import ExplosionHandler from "../3Dhandlers/ExplosionHandler";
import { Stars } from "@react-three/drei";
import GameOver from "../components/GameOver.jsx/GameOver";
import { useNavigate } from "react-router-dom";
import explosionFile from "/src/assets/audio/explosion.mp3";

export default function ExplosionScene({ playerData }) {
  const shipRef = useRef();
  const cityRef = useRef();
  const [explosionTriggered, setExplosionTriggered] = useState(false);
  const [removeObjects, setRemoveObjects] = useState(false);

  const navigate = useNavigate();

  const explosionSound = new Audio(explosionFile);

  useEffect(() => {
    if (!playerData) {
      navigate("/");
    }
  });

  function CameraController() {
    const { camera } = useThree();

    useEffect(() => {
      camera.position.set(0, 15, 80);
      camera.lookAt(-20, 0, 0);
    }, [camera]);

    return null;
  }

  useEffect(() => {
    const extiming = setTimeout(() => {
      setExplosionTriggered(true);
      explosionSound.currentTime = 1;
      explosionSound.play();
      setTimeout(() => {
        setRemoveObjects(true); // Supprime Ship et NasdaceCity après 2 secondes
      }, 500);
    }, 1500);
    return () => clearInterval(extiming);
  }, []);

  // Fonction qui sera déclenchée lors de la collision
  const handleCollision = () => {
    setExplosionTriggered(true); // Déclenche l'explosion quand la collision est détectée
  };

  return (
    <>
      {removeObjects && (
        <GameOver
          reason={"Vous n'avez pas réussi à satisfaire le vaisseau."}
          onRestart={() => {
            navigate("/dev/rythm-game");
          }}
          onMainMenu={() => {
            navigate("/");
          }}
        />
      )}
      <Canvas>
        <CameraController />
        <Stars radius={100} depth={500} count={5000} factor={4} />
        <directionalLight intensity={1.5} castShadow position={[5, 10, 5]} />
        <ambientLight intensity={0.4} />

        <Physics>
          {!removeObjects ? (
            <NasdaceCity
              ref={cityRef}
              position={[0, -20, 0]}
              scale={[0.1, 0.1, 0.1]}
            />
          ) : null}

          {!explosionTriggered ? (
            <ShipSus
              ref={shipRef}
              position={[-80, 10, 50]} // Position initiale du vaisseau
              colors={playerData}
              onCollisionEnter={handleCollision} // Détection de collision pour le vaisseau
              isMoving={true}
            />
          ) : null}
        </Physics>

        <ExplosionHandler
          shipRef={shipRef}
          cityRef={cityRef}
          position={[0, -10, 0]}
          duration={3} // Durée de l'explosion
          explosionTriggered={explosionTriggered}
          setExplosionTriggered={setExplosionTriggered}
          scale={[6, 6, 6]}
        />
      </Canvas>
    </>
  );
}
