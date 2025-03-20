import React, { useRef, useState, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { KeyboardControls, Html, useTexture } from "@react-three/drei";
import Controller from "ecctrl";
import { Gltf } from "@react-three/drei";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import Exam from "./Exam";
import Blaster from "./Blaster";
import SpaceshipGame from "./SpaceshipGame";
import ATH from "./ATH";
import NasdaceModel from "/src/assets/modeles/Nasdace.glb";
import ghostModel from "/src/assets/modeles/ghost_w_tophat-transformed.glb";
import doda from "/src/assets/modeles/doda 2.glb";
import galaxyImage from "/public/images/space.jpg";
import asteroidHit from "/public/audio/musicMiddleScene.mp3";
import Dialogues from "/src/components/Dialogues/Dialogues";

// Importez les fichiers de dialogue pour chaque alien
import blasterDialogue from "/src/assets/dialogues/blaster.json";
// Créez ces fichiers ou importez-les s'ils existent déjà
import quizDialogue from "/src/assets/dialogues/quiz.json";
import spaceshipDialogue from "/src/assets/dialogues/spaceship.json";

// Ajout du composant de contrôle de position du joueur
const PlayerPositionMonitor = ({
  playerRef,
  respawnPosition = [0, -3, 0],
  minHeight = -10,
}) => {
  useFrame(() => {
    if (!playerRef.current) return;

    // Obtenir la position actuelle du joueur
    const playerPosition = new THREE.Vector3();

    // Essayer d'accéder à la position du joueur selon le type d'objet
    try {
      if (playerRef.current.getWorldPosition) {
        playerRef.current.getWorldPosition(playerPosition);
      } else if (playerRef.current.position) {
        playerPosition.copy(playerRef.current.position);
      } else if (playerRef.current.translation) {
        const translation = playerRef.current.translation();
        playerPosition.set(translation.x, translation.y, translation.z);
      } else {
        // Fallback - chercher dans les enfants
        const child = playerRef.current.children?.[0];
        if (child && child.position) {
          playerPosition.copy(child.position);
        } else {
          return; // Impossible de trouver la position
        }
      }

      // Vérifier si le joueur est tombé trop bas
      if (playerPosition.y < minHeight) {
        console.log("Joueur tombé! Respawn...");

        // Effectuer le respawn en réinitialisant la position du joueur
        if (playerRef.current.teleportPosition) {
          // Pour les contrôleurs ecctrl qui ont une fonction teleport
          playerRef.current.teleportPosition({
            x: respawnPosition[0],
            y: respawnPosition[1],
            z: respawnPosition[2],
          });
        } else if (playerRef.current.setTranslation) {
          // Pour les RigidBody de Rapier
          playerRef.current.setTranslation({
            x: respawnPosition[0],
            y: respawnPosition[1],
            z: respawnPosition[2],
          });
        } else if (playerRef.current.position) {
          // Pour les objets Three.js standard
          playerRef.current.position.set(...respawnPosition);
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de la position du joueur:",
        error
      );
    }
  });

  return null;
};

// Composant pour le fond de la scène
const SceneBackground = () => {
  const { scene } = useThree();
  const texture = useTexture(galaxyImage);
  const soundRef = useRef(null);
  const soundInitialized = useRef(false);

  useEffect(() => {
    // Configurer la texture comme fond
    scene.background = texture;

    // Vérifier si la musique a déjà été initialisée
    if (!soundInitialized.current) {
      // Créer et jouer la musique de fond
      const listener = new THREE.AudioListener();
      scene.add(listener);

      const sound = new THREE.Audio(listener);
      soundRef.current = sound;

      const audioLoader = new THREE.AudioLoader();

      audioLoader.load(asteroidHit, (buffer) => {
        if (soundRef.current) {
          sound.setBuffer(buffer);
          sound.setLoop(true);
          sound.setVolume(0.5);
          sound.play();
          soundInitialized.current = true;
        }
      });
    }

    // Nettoyage
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
      }
      scene.background = null;
    };
  }, [scene, texture]);

  return null;
};

// Composant pour le panneau d'avertissement
const WarningSign = ({ position, rotation = [0, 0, 0], isGameActive }) => {
  // Ne pas afficher le panneau d'avertissement si un jeu est actif
  if (isGameActive) return null;

  return (
    <group position={position} rotation={rotation}>
      {/* Panneau */}
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial color="#ffdd00" />
      </mesh>

      {/* Pied du panneau */}
      <mesh castShadow receiveShadow position={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.1, 0.1, 2, 16]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Texte d'avertissement */}
      <Html
        position={[2.7, 1, 0.06]}
        transform
        distanceFactor={10}
        rotation={[0, 0, 0]}
      >
        <div
          style={{
            width: "100px",
            backgroundColor: "transparent",
            color: "black",
            fontWeight: "bold",
            textAlign: "center",
            padding: "5px",
            fontSize: "8px",
            fontFamily: "Arial",
            whiteSpace: "normal",
            transform: "translateX(-100%)",
            userSelect: "none",
          }}
        >
          ATTENTION!
          <br />
          LES NASDACES NE COUVRENT PAS
          <br />
          SI CHUTE
        </div>
      </Html>
    </group>
  );
};

// Composant Alien avec modification pour désactiver l'interaction après complétion
const Alien = ({
  position,
  color,
  name,
  onInteract,
  playerRef,
  isCompleted,
  isGameActive,
}) => {
  const alienRef = useRef();
  const [showInteractionHint, setShowInteractionHint] = useState(false);

  const checkDistance = () => {
    // Ne pas vérifier la distance si un jeu est actif ou si le défi est déjà complété
    if (isGameActive || isCompleted) {
      setShowInteractionHint(false);
      return false;
    }

    if (playerRef.current && alienRef.current) {
      try {
        // Créer des vecteurs pour obtenir les positions mondiales
        const playerPosition = new THREE.Vector3();
        const alienPosition = new THREE.Vector3();

        // Si playerRef.current est un objet Controller, essayons d'accéder à sa position
        if (playerRef.current.getWorldPosition) {
          playerRef.current.getWorldPosition(playerPosition);
        } else if (playerRef.current.position) {
          playerPosition.copy(playerRef.current.position);
        } else if (playerRef.current.translation) {
          // Pour les objets RigidBody de Rapier
          playerPosition.set(
            playerRef.current.translation().x,
            playerRef.current.translation().y,
            playerRef.current.translation().z
          );
        } else {
          // Fallback - chercher dans les enfants
          const child = playerRef.current.children?.[0];
          if (child && child.position) {
            playerPosition.copy(child.position);
          } else {
            return false; // Impossible de trouver la position
          }
        }

        // Obtenir la position de l'alien
        alienRef.current.getWorldPosition(alienPosition);

        const dx = playerPosition.x - alienPosition.x;
        const dz = playerPosition.z - alienPosition.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Si le joueur est à moins de 3 unités de distance
        if (distance < 3) {
          setShowInteractionHint(true);
          return true;
        } else {
          setShowInteractionHint(false);
          return false;
        }
      } catch (error) {
        console.error("Erreur lors du calcul de distance:", error);
        return false;
      }
    }
    return false;
  };

  // Vérifier la distance à chaque frame
  React.useEffect(() => {
    const interval = setInterval(() => {
      checkDistance();
    }, 100);

    return () => clearInterval(interval);
  }, [playerRef, isGameActive, isCompleted]);

  // Quand le joueur clique et est proche de l'alien
  const handleInteraction = () => {
    // Ne pas permettre l'interaction si le défi est déjà complété
    if (!isCompleted && checkDistance()) {
      onInteract(name);
    }
  };

  return (
    <>
      <group ref={alienRef} position={position} onClick={handleInteraction}>
        {/* Ajustement de la position et échelle du modèle */}
        <Gltf
          castShadow
          receiveShadow
          scale={1}
          position={[0, -1.6, 0]}
          visible={true}
          src={NasdaceModel}
        />

        {/* Déplacer la sphère colorée plus haut pour ne pas masquer le modèle */}
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={isCompleted ? "#00FF00" : color}
            transparent
            opacity={0.6}
            emissive={isCompleted ? "#00FF00" : "black"}
            emissiveIntensity={isCompleted ? 0.5 : 0}
          />
        </mesh>
      </group>

      {/* Afficher un message différent pour les défis complétés */}
      {showInteractionHint && !isGameActive && (
        <Html position={[position[0], position[1] + 3, position[2]]} center>
          <div
            className="interaction-hint"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "5px 10px",
              borderRadius: "5px",
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "14px",
              userSelect: "none",
            }}
          >
            {isCompleted
              ? `${name} (Défi déjà complété)`
              : `Cliquez pour parler à ${name}`}
          </div>
        </Html>
      )}
    </>
  );
};

// Composant pour l'intérieur du vaisseau
const SpaceshipInterior = ({ playerData }) => {
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const [showDialogue, setShowDialogue] = useState(false);
  const [currentAlien, setCurrentAlien] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [fuel, setFuel] = useState(100);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  // Position de départ/respawn du joueur
  const spawnPosition = [0, -3, 0];

  // État pour suivre les défis complétés
  const [gameCompletions, setGameCompletions] = useState({
    ZarxBlablx: false,
    Grogksblux: false,
    Zglubugl: false,
  });

  // Déterminer si un jeu est actif pour cacher les éléments d'interface
  const isGameActive = activeGame !== null;

  // Fonction pour obtenir le bon dialogue selon l'alien
  const getCurrentDialogue = () => {
    switch (currentAlien) {
      case "ZarxBlablx":
        return quizDialogue;
      case "Grogksblux":
        return blasterDialogue;
      case "Zglubugl":
        return spaceshipDialogue;
      default:
        return [];
    }
  };

  const keyboardMap = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
    { name: "rightward", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["Shift"] },
  ];

  const handleAlienInteraction = (alienName) => {
    setCurrentAlien(alienName);
    setShowDialogue(true);
  };

  const handleGameSelect = (alienName) => {
    setShowDialogue(false);

    // Chaque alien lance un jeu différent
    switch (alienName) {
      case "ZarxBlablx":
        setActiveGame("quiz");
        break;
      case "Grogksblux":
        setActiveGame("blaster");
        break;
      case "Zglubugl":
        setActiveGame("spaceship");
        break;
      default:
        setActiveGame(null);
    }
  };

  const handleCloseDialogue = () => {
    setShowDialogue(false);
    setCurrentAlien(null);
  };

  const handleGameClose = (completed = false) => {
    // Si le jeu est complété, marquer comme terminé
    if (completed && currentAlien) {
      setGameCompletions((prev) => ({
        ...prev,
        [currentAlien]: true,
      }));

      console.log(`${currentAlien} challenge completed!`);
    }

    setActiveGame(null);
  };

  // Message de fin quand tous les défis sont complétés
  const CompletionMessage = () => (
    <div style={styles.completionOverlay}>
      <div style={styles.completionMessage}>
        <h2 style={styles.completionTitle}>Félicitations!</h2>
        <p style={styles.completionText}>
          Vous avez complété tous les défis du vaisseau!
        </p>
        <p style={styles.completionText}>
          Préparation pour le prochain niveau...
        </p>
      </div>
    </div>
  );

  // Vérifier si tous les défis sont complétés
  useEffect(() => {
    const allCompleted = Object.values(gameCompletions).every(
      (status) => status
    );
    if (allCompleted) {
      console.log("All challenges completed!");
      // Afficher un message de transition
      setShowCompletionMessage(true);

      // Attendre quelques secondes avant de naviguer
      const timer = setTimeout(() => {
        navigate("/rythm-game", { state: { playerData, fuel } });
      }, 3000); // 3 secondes avant de naviguer

      return () => clearTimeout(timer);
    }
  }, [gameCompletions, navigate, playerData]);

  // Déterminer si le dialogue devrait être affiché avec état de complétion
  const getDialogueForAlien = () => {
    if (!currentAlien) return null;

    // Si le défi est déjà complété, utilisez un dialogue différent ou modifiez le dialogue existant
    const isCompleted = gameCompletions[currentAlien];

    // Retourner le dialogue approprié pour l'alien avec état de complétion
    return getCurrentDialogue();
  };

  return (
    <>
      <div style={{ width: "100%", height: "100%" }}>
        <Canvas shadows>
          <SceneBackground />
          <directionalLight intensity={0.5} castShadow position={[0, 5, 5]} />
          <pointLight intensity={1} position={[-5, 0, 0]} color="#ffffff" />
          <pointLight intensity={1} position={[5, 0, 0]} color="#ffffff" />
          <ambientLight intensity={0.7} />

          <Physics>
            <KeyboardControls map={keyboardMap}>
              <Controller ref={playerRef} maxVelLimit={5}>
                <Gltf
                  castShadow
                  receiveShadow
                  scale={0.315}
                  position={[0, 0, 0]}
                  src={ghostModel}
                />
              </Controller>
            </KeyboardControls>
            <PlayerPositionMonitor
              playerRef={playerRef}
              respawnPosition={spawnPosition}
              minHeight={-10}
            />
            <RigidBody type="fixed" colliders="trimesh">
              {/* Modèle de l'intérieur du vaisseau */}
              <Gltf receiveShadow scale={15} position={[0, 2, 0]} src={doda} />
            </RigidBody>

            {/* Panneau d'avertissement près d'une zone glissante - caché pendant les jeux */}
            <WarningSign
              position={[-2, -3.5, 6]}
              rotation={[0, 9, 0]}
              isGameActive={isGameActive}
            />

            {/* Les trois aliens avec prise en compte de l'état du jeu */}
            <Alien
              position={[-5, -4, 0]}
              color="blue"
              name="ZarxBlablx"
              onInteract={handleAlienInteraction}
              playerRef={playerRef}
              isCompleted={gameCompletions["ZarxBlablx"]}
              isGameActive={isGameActive}
            />
            <Alien
              position={[0, -4, 4]}
              color="red"
              name="Grogksblux"
              onInteract={handleAlienInteraction}
              playerRef={playerRef}
              isCompleted={gameCompletions["Grogksblux"]}
              isGameActive={isGameActive}
            />
            <Alien
              position={[4, -4, 0]}
              color="green"
              name="Zglubugl"
              onInteract={handleAlienInteraction}
              playerRef={playerRef}
              isCompleted={gameCompletions["Zglubugl"]}
              isGameActive={isGameActive}
            />
          </Physics>
        </Canvas>

        {/* ATH (Affichage Tête Haute) - toujours visible */}
        <div style={styles.athContainer}>
          <ATH showChrono={false} fuel={fuel} />
        </div>

        {/* Nouveau composant Dialogues - visible uniquement si un dialogue est actif */}
        {showDialogue && currentAlien && !isGameActive && (
          <div style={styles.dialogueContainer}>
            <Dialogues
              dialogFile={getDialogueForAlien()}
              userName={playerData?.name || "Joueur"}
              onComplete={() => handleGameSelect(currentAlien)}
              autoSkip={true}
            />
          </div>
        )}

        {/* Jeux */}
        {activeGame === "quiz" && (
          <div style={styles.gameContainer}>
            <Exam
              setter={setFuel}
              fuel={fuel}
              onClose={(completed) => handleGameClose(completed)}
              onComplete={() => handleGameClose(true)}
            />
          </div>
        )}
        {activeGame === "blaster" && (
          <div style={styles.gameContainer}>
            <Blaster
              setter={setFuel}
              fuel={fuel}
              onClose={handleGameClose}
              onComplete={() => handleGameClose(true)}
            />
          </div>
        )}
        {activeGame === "spaceship" && (
          <div style={styles.gameContainer}>
            <SpaceshipGame
              setter={setFuel}
              fuel={fuel}
              onClose={handleGameClose}
              onComplete={() => handleGameClose(true)}
              playerData={playerData}
            />
          </div>
        )}

        {/* Message de fin quand tous les défis sont complétés */}
        {showCompletionMessage && <CompletionMessage />}
      </div>
    </>
  );
};

const styles = {
  dialogueContainer: {
    position: "absolute",
    bottom: "10%",
    left: "50%",
    zIndex: 20,
    width: "100%",
    pointerEvents: "auto",
  },
  athContainer: {
    position: "absolute",
    top: "10px",
    left: "10px",
    zIndex: 10,
  },
  gameContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 100,
    background: "rgba(0, 0, 0, 0.8)",
  },
  completionOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 200,
    background: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  completionMessage: {
    background:
      "linear-gradient(135deg, rgba(20, 40, 100, 0.95) 0%, rgba(40, 80, 160, 0.95) 100%)",
    padding: "30px 40px",
    borderRadius: "20px",
    color: "#ffffff",
    textAlign: "center",
    maxWidth: "500px",
    border: "3px solid rgba(100, 200, 255, 0.7)",
    boxShadow:
      "0 0 40px rgba(100, 200, 255, 0.6), inset 0 0 20px rgba(100, 200, 255, 0.3)",
  },
  completionTitle: {
    fontSize: "32px",
    margin: "0 0 20px 0",
    fontWeight: "bold",
    textShadow: "0 0 15px rgba(120, 220, 255, 0.8)",
  },
  completionText: {
    fontSize: "18px",
    margin: "10px 0",
  },
};

export default SpaceshipInterior;
