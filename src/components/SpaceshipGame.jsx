// SpaceshipGame.js
import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Environment, useGLTF } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import Ship from "../components3D/Ship";
import galaxyImage from "../assets/images/space.jpg";

// Composant pour charger le modèle 3D d'astéroïde
const AsteroidModel = ({ scale = 1 }) => {
  const modelRef = useRef();
  const { scene } = useGLTF("/src/assets/modeles/asteroid_1.glb"); // Chemin relatif
  // Rotation aléatoire pour chaque astéroïde
  const rotX = useRef(Math.random() * 0.01);
  const rotY = useRef(Math.random() * 0.01);
  const rotZ = useRef(Math.random() * 0.01);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.x += rotX.current;
      modelRef.current.rotation.y += rotY.current;
      modelRef.current.rotation.z += rotZ.current;
    }
  });

  return (
    <group ref={modelRef} scale={scale}>
      <primitive object={scene} />
    </group>
  );
};

// Composant pour les astéroïdes avec la physique
const Asteroid = ({ position, speed, onCollision }) => {
  const asteroidRef = useRef();
  const lastCollisionTime = useRef(0);

  // Taille aléatoire pour plus de variété
  const scale = useRef(0.5 + Math.random() * 0.5);

  useFrame(() => {
    if (asteroidRef.current) {
      // Mouvement des astéroïdes
      asteroidRef.current.setTranslation({
        x: asteroidRef.current.translation().x,
        y: asteroidRef.current.translation().y - speed,
        z: 0,
      });

      // Repositionnement lorsque l'astéroïde sort de l'écran
      if (asteroidRef.current.translation().y < -10) {
        asteroidRef.current.setTranslation({
          x: Math.random() * 8 - 4,
          y: 15 + Math.random() * 5,
          z: 0,
        });

        // Nouvelle taille aléatoire
        scale.current = 0.5 + Math.random() * 0.5;
      }

      // Vérification de distance pour simuler une collision visuelle
      const shipPosition = onCollision.getShipPosition();
      if (shipPosition) {
        const dx = asteroidRef.current.translation().x - shipPosition.x;
        const dy = asteroidRef.current.translation().y - shipPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Collision avec rayon ajusté
        const now = Date.now();
        if (distance < 1.8 && now - lastCollisionTime.current > 1000) {
          lastCollisionTime.current = now;
          onCollision.triggerEffect();
        }
      }
    }
  });

  return (
    <RigidBody
      ref={asteroidRef}
      position={position}
      type="kinematicPosition"
      colliders="ball"
      sensor={true}
    >
      <AsteroidModel scale={scale.current} />
    </RigidBody>
  );
};

// Composant pour le vaisseau et son contrôle - À l'intérieur du Canvas
const GameScene = ({ keysPressed, onCollision }) => {
  const shipRef = useRef(null);

  useFrame(() => {
    if (shipRef.current) {
      let moveX = 0;
      let moveY = 0;
      const moveSpeed = 0.1; // Vitesse réduite pour plus de fluidité

      // Lecture des touches pressées pour déterminer le mouvement
      if (keysPressed.current["ArrowUp"]) moveY = moveSpeed;
      if (keysPressed.current["ArrowDown"]) moveY = -moveSpeed;
      if (keysPressed.current["ArrowLeft"]) moveX = -moveSpeed;
      if (keysPressed.current["ArrowRight"]) moveX = moveSpeed;

      if (moveX === 0 && moveY === 0) return;

      // Position actuelle
      const currentX = shipRef.current.translation().x;
      const currentY = shipRef.current.translation().y;

      // Limites du jeu
      const xLimit = 6;
      const yLimit = 4;

      // Nouvelle position avec limites strictes
      const newX = Math.max(-xLimit, Math.min(xLimit, currentX + moveX));
      const newY = Math.max(-yLimit, Math.min(yLimit, currentY + moveY));

      // Application de la nouvelle position sans autre effet physique
      shipRef.current.setTranslation({
        x: newX,
        y: newY,
        z: 0,
      });
    }
  });

  // Fonction pour obtenir la position actuelle du vaisseau
  const getShipPosition = () => {
    if (shipRef.current) {
      return {
        x: shipRef.current.translation().x,
        y: shipRef.current.translation().y,
      };
    }
    return null;
  };

  // Moins d'astéroïdes
  const asteroidCount = 3;
  // Vitesse plus lente
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
        >
          <Ship
            position={[0, -3, 0]}
            scale={[2, 2, 2]}
            colors={{
              colorShip: "#4a4a4a",
              colorLight: "#f9d71c",
              colorGlass: "#8ab4f8",
            }}
          />
        </RigidBody>

        {/* Génération d'astéroïdes avec modèle 3D */}
        {[...Array(asteroidCount)].map((_, i) => (
          <Asteroid
            key={i}
            position={[
              Math.random() * 8 - 4,
              10 + i * 5, // Distribution verticale pour éviter le groupement
              0,
            ]}
            speed={asteroidSpeed}
            onCollision={{
              getShipPosition: getShipPosition,
              triggerEffect: onCollision,
            }}
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

  useEffect(() => {
    if (fuel <= 0) {
      navigate("/gameover");
    }
  }, [fuel, navigate]);

  // Gestion des touches enfoncées pour un mouvement fluide
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;
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

  // Gestion de la collision avec un astéroïde - effet visuel uniquement
  const handleAsteroidCollision = () => {
    const now = Date.now();
    // Empêcher les collisions multiples trop rapides (cooldown de 1 seconde)
    if (now - lastCollisionTime.current > 1000) {
      lastCollisionTime.current = now;
      setter((prev) => {
        const newFuel = Math.max(0, prev - 10);
        console.log("Collision! Fuel:", newFuel);
        return newFuel;
      });

      // Effet visuel temporaire lors d'une collision
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
      {/* Effet de collision */}
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
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SpaceshipGame;
