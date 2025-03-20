import React, { useRef, useEffect, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Environment, useGLTF } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import Ship from "../components3D/ShipPlayable";
import galaxyImage from "/public/images/space.jpg";
import asteroid from "/src/assets/modeles/asteroid_1.glb";
import asteroidHit from "/public/audio/rock.mp3";
import ATH from "./ATH";

// Préchargement du modèle d'astéroïde
useGLTF.preload(asteroid);

// Composant pour charger le modèle 3D d'astéroïde
const AsteroidModel = ({ scale = 1 }) => {
  const modelRef = useRef();
  const { scene } = useGLTF(asteroid); // Chemin relatif

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
const Asteroid = ({ position, speed, onCollision }) => {
  const asteroidRef = useRef();
  const initialPosition = useRef(position);
  const scale = useRef(0.2 + Math.random() * 0.4);

  // Utiliser useFrame pour le mouvement continu sans reset à chaque rendu
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
        scale.current = 0.2 + Math.random() * 0.4;
      }
    }
  });

  // Vérification de collision
  useFrame(() => {
    if (asteroidRef.current && onCollision) {
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
        const collisionThreshold = 1.2 * scale.current;

        if (distance < collisionThreshold) {
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
    </RigidBody>
  );
};

// Composant pour le vaisseau et son contrôle
const GameScene = ({ keysPressed, onCollision, playerData }) => {
  const shipRef = useRef(null);
  const shipModelRef = useRef(null);

  useFrame(() => {
    if (shipRef.current) {
      let moveX = 0;
      let moveY = 0;
      const moveSpeed = 0.05;

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

  const asteroidCount = 20;
  const asteroidSpeed = 0.05;

  // Positions initiales des astéroïdes - calculées une seule fois
  const asteroidPositions = useMemo(() => {
    return Array(asteroidCount)
      .fill()
      .map((_, i) => [Math.random() * 8 - 4, 10 + i * 5, 0]);
  }, [asteroidCount]);

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
            scale={[1, 1, 1]}
            colors={{
              colorShip: playerData?.shipColor || "#ff0000",
              colorLight: playerData?.lightColor || "#00ff00",
              colorGlass: playerData?.glassColor || "#0000ff",
            }}
          />
        </RigidBody>

        {/* Astéroïdes */}
        {asteroidPositions.map((position, i) => (
          <Asteroid
            key={i}
            position={position}
            speed={asteroidSpeed}
            onCollision={{
              getShipInfo: getShipInfo,
              triggerEffect: onCollision,
            }}
          />
        ))}
      </Physics>
    </>
  );
};

// Composant principal
const SpaceshipGame = ({ setter, fuel, onComplete, playerData }) => {
  const navigate = useNavigate();
  const keysPressed = useRef({});
  const containerRef = useRef(null);
  const lastCollisionTime = useRef(0);
  const [hitEffect, setHitEffect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Gestion du chronomètre
  useEffect(() => {
    let timerInterval;

    if (timeLeft > 0 && !gameCompleted) {
      timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && !gameCompleted) {
      setGameCompleted(true);
      // Appel de la fonction onComplete pour signaler la fin du jeu
      if (typeof onComplete === "function") {
        onComplete();
      }
    }

    return () => {
      clearInterval(timerInterval);
    };
  }, [timeLeft, gameCompleted, onComplete]);

  useEffect(() => {
    if (fuel <= 0) {
      navigate("/game-over");
    }
  }, [fuel, navigate]);

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

  // Fonction de gestion des collisions
  const handleAsteroidCollision = () => {
    const now = Date.now();
    if (now - lastCollisionTime.current > 300) {
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
      // Jouer le son de collision
      const hitSound = new Audio(asteroidHit);
      hitSound.volume = 0.7; // Volume à 70%
      hitSound.play().catch((error) => {
        console.error("Erreur lors de la lecture du son:", error);
      });

      // Effet visuel de collision
      setHitEffect(true);
      setTimeout(() => setHitEffect(false), 300);
    }
  };

  // Style pour le chronomètre
  const getTimerColor = () => {
    if (timeLeft <= 5) return "#ff0000"; // Rouge quand il reste peu de temps
    if (timeLeft <= 10) return "#ff9900"; // Orange quand le temps diminue
    return "#ffffff"; // Blanc par défaut
  };

  // Fonction pour continuer après la fin du jeu
  const handleContinue = () => {
    if (typeof onComplete === "function") {
      onComplete();
    } else {
      navigate("/game-over");
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

      {/* Message de victoire/survie */}
      {gameCompleted && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#4ef542",
            padding: "20px",
            borderRadius: "10px",
            fontFamily: "monospace",
            fontSize: "24px",
            textAlign: "center",
            zIndex: 100,
            width: "60%",
            maxWidth: "500px",
            boxShadow: "0 0 20px #4ef542",
            border: "2px solid #4ef542",
          }}
        >
          <h2 style={{ margin: "0 0 20px 0" }}>MISSION RÉUSSIE!</h2>
          <p>Vous avez survécu à la tempête d'astéroïdes!</p>
          <button
            style={{
              backgroundColor: "#4ef542",
              color: "black",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              fontSize: "18px",
              cursor: "pointer",
              marginTop: "20px",
              fontWeight: "bold",
            }}
            onClick={handleContinue}
          >
            CONTINUER
          </button>
        </div>
      )}

      <Canvas>
        <Suspense fallback={null}>
          <GameScene
            keysPressed={keysPressed}
            onCollision={handleAsteroidCollision}
          />
        </Suspense>
      </Canvas>

      <ATH showChrono={false} fuel={fuel} />

      {/* Affichage du chronomètre */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          color: getTimerColor(),
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: "8px 15px",
          borderRadius: "5px",
          fontFamily: "monospace",
          fontSize: "20px",
          fontWeight: "bold",
          border: timeLeft <= 5 ? `2px solid ${getTimerColor()}` : "none",
          boxShadow: timeLeft <= 5 ? `0 0 10px ${getTimerColor()}` : "none",
          transition: "all 0.3s",
        }}
      >
        Temps: {timeLeft}s
      </div>
    </div>
  );
};

export default SpaceshipGame;
