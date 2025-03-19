import React, { useRef, useEffect, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Environment, useGLTF } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import Ship from "../components3D/Ship";
import galaxyImage from "../assets/images/space.jpg";

// Préchargement du modèle d'astéroïde
useGLTF.preload("/src/assets/modeles/asteroid_1.glb");

// Composant pour charger le modèle 3D d'astéroïde
const AsteroidModel = ({ scale = 1 }) => {
  const modelRef = useRef();
  const { scene } = useGLTF("/src/assets/modeles/asteroid_1.glb"); // Chemin relatif

  // Créer une copie unique du modèle pour chaque instance
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // Rotation aléatoire pour chaque astéroïde
  const rotX = useRef(Math.random() * 0.01);
  const rotY = useRef(Math.random() * 0.01);
  const rotZ = useRef(Math.random() * 0.01);

  // Couleur légèrement différente pour chaque astéroïde
  const color = useMemo(() => {
    return new THREE.Color(
      0.5 + Math.random() * 0.3,
      0.5 + Math.random() * 0.3,
      0.5 + Math.random() * 0.3
    );
  }, []);

  // Appliquer la couleur au modèle cloné
  useEffect(() => {
    clonedScene.traverse((node) => {
      if (node.isMesh) {
        node.material = node.material.clone();
        node.material.color = color;
      }
    });
  }, [clonedScene, color]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.x += rotX.current;
      modelRef.current.rotation.y += rotY.current;
      modelRef.current.rotation.z += rotZ.current;
    }
  });

  return (
    <group ref={modelRef} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

// Composant pour les astéroïdes avec la physique
const Asteroid = ({ position, speed, onCollision, debugMode }) => {
  const asteroidRef = useRef();
  const collisionRef = useRef(false);
  const scale = useRef(0.5 + Math.random() * 0.7);

  useFrame(() => {
    if (asteroidRef.current) {
      // Déplacement de l'astéroïde
      asteroidRef.current.setTranslation({
        x: asteroidRef.current.translation().x,
        y: asteroidRef.current.translation().y - speed,
        z: 0,
      });

      // Repositionnement quand l'astéroïde sort de l'écran
      if (asteroidRef.current.translation().y < -10) {
        asteroidRef.current.setTranslation({
          x: Math.random() * 8 - 4,
          y: 10,
          z: 0,
        });
        scale.current = 0.5 + Math.random() * 0.5;
        collisionRef.current = false; // Réinitialiser l'état de collision pour ce nouvel astéroïde
      }
    }
  });

  // Utiliser la fonction concrète de collision plutôt que l'événement
  useFrame(() => {
    if (asteroidRef.current && onCollision && !collisionRef.current) {
      const asteroidPosition = asteroidRef.current.translation();

      // Obtenir la position du vaisseau (si disponible)
      const shipInfo = onCollision.getShipInfo
        ? onCollision.getShipInfo()
        : null;

      if (shipInfo) {
        const shipPosition = shipInfo.position;

        // Calculer la distance entre l'astéroïde et le vaisseau
        const dx = asteroidPosition.x - shipPosition.x;
        const dy = asteroidPosition.y - shipPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Si la distance est inférieure à un seuil, considérer qu'il y a collision
        // Ajuster cette valeur selon la taille de vos modèles
        const collisionThreshold = 1.5 * scale.current;

        if (distance < collisionThreshold) {
          // Éviter les collisions multiples avec le même astéroïde
          collisionRef.current = true;

          // Déclencher l'effet de collision
          if (onCollision.triggerEffect) {
            console.log("Collision détectée à distance:", distance);
            onCollision.triggerEffect();
          }
        }
      }
    }
  });

  return (
    <RigidBody
      ref={asteroidRef}
      position={position}
      type="kinematicPosition"
      colliders="hull"
      sensor={true}
      name="asteroid"
    >
      <AsteroidModel scale={scale.current} />
      {debugMode && (
        <mesh>
          <sphereGeometry args={[1.2 * scale.current, 16, 16]} />
          <meshBasicMaterial wireframe color="red" transparent opacity={0.5} />
        </mesh>
      )}
    </RigidBody>
  );
};

// Composant pour le vaisseau et son contrôle
const GameScene = ({ keysPressed, onCollision, debug }) => {
  const shipRef = useRef(null);
  const shipModelRef = useRef(null);

  useFrame(() => {
    if (shipRef.current) {
      let moveX = 0;
      let moveY = 0;
      const moveSpeed = 0.1;

      if (keysPressed.current["ArrowUp"]) moveY = moveSpeed;
      if (keysPressed.current["ArrowDown"]) moveY = -moveSpeed;
      if (keysPressed.current["ArrowLeft"]) moveX = -moveSpeed;
      if (keysPressed.current["ArrowRight"]) moveX = moveSpeed;

      if (moveX === 0 && moveY === 0) return;

      const currentX = shipRef.current.translation().x;
      const currentY = shipRef.current.translation().y;

      const xLimit = 6;
      const yLimit = 4;

      const newX = Math.max(-xLimit, Math.min(xLimit, currentX + moveX));
      const newY = Math.max(-yLimit, Math.min(yLimit, currentY + moveY));

      shipRef.current.setTranslation({
        x: newX,
        y: newY,
        z: 0,
      });
    }
  });

  // Fonction pour obtenir les informations du vaisseau
  const getShipInfo = () => {
    if (shipRef.current) {
      return {
        position: {
          x: shipRef.current.translation().x,
          y: shipRef.current.translation().y,
        },
      };
    }
    return null;
  };

  const asteroidCount = 5;
  const asteroidSpeed = 0.02;

  return (
    <>
      <Environment preset="night" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 10]} intensity={1} />
      <Physics>
        <RigidBody
          ref={shipRef}
          type="kinematicPosition"
          name="ship"
          lockRotations={true}
          enabledRotations={[false, false, false]}
          linearDamping={100}
          angularDamping={100}
          mass={0}
          ccd={true}
          sensor={true}
          position={[0, -3, 0]}
        >
          <Ship
            ref={shipModelRef}
            scale={[2, 2, 2]}
            colors={{
              colorShip: "#4a4a4a",
              colorLight: "#f9d71c",
              colorGlass: "#8ab4f8",
            }}
          />
          {debug && (
            <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.5, 2.5, 1, 8]} />
              <meshBasicMaterial
                wireframe
                color="yellow"
                transparent
                opacity={0.5}
              />
            </mesh>
          )}
        </RigidBody>

        {/* Astéroïdes */}
        {[...Array(asteroidCount)].map((_, i) => (
          <Asteroid
            key={i}
            position={[Math.random() * 8 - 4, 10 + i * 5, 0]}
            speed={asteroidSpeed}
            onCollision={{
              getShipInfo: getShipInfo,
              triggerEffect: onCollision,
            }}
            debugMode={debug}
          />
        ))}
      </Physics>
    </>
  );
};

// Composant principal
const SpaceshipGame = ({ setter, fuel }) => {
  const navigate = useNavigate();
  const keysPressed = useRef({});
  const containerRef = useRef(null);
  const lastCollisionTime = useRef(0);
  const [hitEffect, setHitEffect] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (fuel <= 0) {
      navigate("/gameover");
    }
  }, [fuel, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;
      if (e.key === "d") {
        setDebugMode((prev) => !prev);
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Fonction de gestion des collisions
  const handleAsteroidCollision = () => {
    const now = Date.now();
    if (now - lastCollisionTime.current > 1000) {
      lastCollisionTime.current = now;

      console.log("Avant collision - Fuel:", fuel);

      // Réduction du carburant
      if (typeof setter === "function") {
        setter((prev) => {
          const newFuel = Math.max(0, prev - 10);
          console.log("Collision! Nouveau fuel:", newFuel);
          return newFuel;
        });
      } else {
        console.error("Le setter n'est pas une fonction valide");
      }

      // Effet visuel de collision
      setHitEffect(true);
      setTimeout(() => setHitEffect(false), 300);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        border: "2px solid #333",
        backgroundImage: `url(${galaxyImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Effet visuel de collision */}
      {hitEffect && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 0, 0, 0.2)",
            zIndex: 5,
            pointerEvents: "none",
          }}
        />
      )}

      <Canvas>
        <Suspense fallback={null}>
          <GameScene
            keysPressed={keysPressed}
            onCollision={handleAsteroidCollision}
            debug={debugMode}
          />
        </Suspense>
      </Canvas>

      {/* Affichage du carburant */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          color: "white",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: "5px 10px",
          borderRadius: "5px",
          fontFamily: "monospace",
        }}
      >
        Fuel: {fuel}
      </div>

      {/* Bouton de test pour vérifier que le setter fonctionne */}
      <button
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          padding: "5px 10px",
          zIndex: 100,
        }}
        onClick={() => {
          if (typeof setter === "function") {
            setter((prev) => Math.max(0, prev - 10));
            console.log("Test button clicked, reducing fuel");
          } else {
            console.error("Le setter n'est pas une fonction valide");
          }
        }}
      >
        Test -10 fuel
      </button>

      {debugMode && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            color: "white",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "5px",
            fontFamily: "monospace",
          }}
        >
          Debug Mode: ON (Press 'D' to toggle)
          <br />
          Yellow: Ship Hitbox | Red: Asteroid Hitbox
        </div>
      )}
    </div>
  );
};

export default SpaceshipGame;
