import React, { useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { KeyboardControls, Html } from "@react-three/drei";
import Controller from "ecctrl";
import { Gltf } from "@react-three/drei";
import * as THREE from "three";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Exam from "./Exam";
import Blaster from "./Blaster";
import SpaceshipGame from "./SpaceshipGame";
import ATH from "./ATH";

// Composant Alien
const Alien = ({
  position,
  color,
  name,
  onInteract,
  playerRef,
  isCompleted,
}) => {
  const alienRef = useRef();
  const [showInteractionHint, setShowInteractionHint] = useState(false);

  const checkDistance = () => {
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
  }, [playerRef]);

  // Quand le joueur clique et est proche de l'alien
  const handleInteraction = () => {
    if (checkDistance()) {
      onInteract(name);
    }
  };

  return (
    <>
      <group ref={alienRef} position={position} onClick={handleInteraction}>
        <Gltf
          castShadow
          receiveShadow
          scale={0.5}
          src="/src/assets/modeles/Nasdace.glb"
        />
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={isCompleted ? "#00FF00" : color}
            transparent
            opacity={0.8}
            emissive={isCompleted ? "#00FF00" : "black"}
            emissiveIntensity={isCompleted ? 0.5 : 0}
          />
        </mesh>
      </group>

      {showInteractionHint && (
        <Html position={[0, 2, 0]} center>
          <div className="interaction-hint">
            {isCompleted
              ? `${name} (Défi complété)`
              : `Cliquez pour parler à ${name}`}
          </div>
        </Html>
      )}
    </>
  );
};

// Composant pour la boîte de dialogue
const DialogueBox = ({ alienName, onClose, onSelect, isCompleted }) => {
  return (
    <div style={styles.dialogueBox}>
      <h3 style={styles.dialogueTitle}>{alienName} vous parle</h3>
      <p style={styles.dialogueText}>
        {isCompleted
          ? "Excellent travail ! Vous avez déjà réussi mon défi."
          : "Bonjour voyageur ! Voulez-vous participer à un défi ?"}
      </p>
      <div style={styles.buttonContainer}>
        {!isCompleted && (
          <button style={styles.button} onClick={() => onSelect(alienName)}>
            Oui
          </button>
        )}
        <button style={styles.button} onClick={onClose}>
          {isCompleted ? "Merci" : "Non"}
        </button>
      </div>
    </div>
  );
};

// Composant pour l'intérieur du vaisseau
const SpaceshipInterior = ({ playerData }) => {
  const navigate = useNavigate(); // Ajouter useNavigate
  const playerRef = useRef(null);
  const [showDialogue, setShowDialogue] = useState(false);
  const [currentAlien, setCurrentAlien] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [fuel, setFuel] = useState(100);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  // État pour suivre les défis complétés
  const [gameCompletions, setGameCompletions] = useState({
    "Quiz Master": false, // gameComplete1
    "Blaster Pro": false, // gameComplete2
    "Captain Nasdace": false, // gameComplete3
  });

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
      case "Quiz Master":
        setActiveGame("quiz");
        break;
      case "Blaster Pro":
        setActiveGame("blaster");
        break;
      case "Captain Nasdace":
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
        navigate("/dev/ending-scene", { state: { playerData } });
      }, 3000); // 3 secondes avant de naviguer

      return () => clearTimeout(timer);
    }
  }, [gameCompletions, navigate, playerData]);

  return (
    <>
      <div style={{ width: "100%", height: "100%" }}>
        <Canvas shadows>
          <directionalLight intensity={0.5} castShadow position={[0, 5, 5]} />
          <ambientLight intensity={0.5} />

          <Physics>
            <KeyboardControls map={keyboardMap}>
              <Controller ref={playerRef} maxVelLimit={5}>
                <Gltf
                  castShadow
                  receiveShadow
                  scale={0.315}
                  position={[0, 0, 0]}
                  src="/src/assets/modeles/ghost_w_tophat-transformed.glb"
                />
              </Controller>
            </KeyboardControls>

            <RigidBody type="fixed" colliders="trimesh">
              {/* Modèle de l'intérieur du vaisseau */}
              <Gltf
                receiveShadow
                scale={15}
                position={[0, 2, 0]}
                src="/src/assets/modeles/doda 2.glb"
              />
            </RigidBody>

            {/* Les trois aliens */}
            <Alien
              position={[-5, -4, 0]}
              color="blue"
              name="Quiz Master"
              onInteract={handleAlienInteraction}
              playerRef={playerRef}
              isCompleted={gameCompletions["Quiz Master"]}
            />
            <Alien
              position={[0, -4, 4]}
              color="red"
              name="Blaster Pro"
              onInteract={handleAlienInteraction}
              playerRef={playerRef}
              isCompleted={gameCompletions["Blaster Pro"]}
            />
            <Alien
              position={[4, -4, 0]}
              color="green"
              name="Captain Nasdace"
              onInteract={handleAlienInteraction}
              playerRef={playerRef}
              isCompleted={gameCompletions["Captain Nasdace"]}
            />
          </Physics>
        </Canvas>

        {/* ATH (Affichage Tête Haute) */}
        <div style={styles.athContainer}>
          <ATH showChrono={false} fuel={fuel} />
        </div>

        {/* Boîte de dialogue */}
        {showDialogue && (
          <DialogueBox
            alienName={currentAlien}
            onClose={handleCloseDialogue}
            onSelect={handleGameSelect}
            isCompleted={currentAlien ? gameCompletions[currentAlien] : false}
          />
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
  dialogueBox: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background:
      "linear-gradient(135deg, rgba(15, 25, 65, 0.9) 0%, rgba(30, 40, 90, 0.9) 100%)",
    padding: "25px 30px",
    borderRadius: "15px",
    color: "#e6f7ff",
    fontSize: "18px",
    fontFamily: "'Rajdhani', 'Orbitron', sans-serif",
    zIndex: 20,
    border: "2px solid rgba(100, 180, 255, 0.6)",
    boxShadow:
      "0 0 30px rgba(80, 160, 255, 0.4), inset 0 0 15px rgba(80, 160, 255, 0.2)",
    textAlign: "center",
    minWidth: "300px",
  },
  dialogueTitle: {
    margin: "0 0 15px 0",
    fontWeight: "bold",
    fontSize: "24px",
    textShadow: "0 0 10px rgba(100, 180, 255, 0.7)",
  },
  dialogueText: {
    margin: "10px 0",
    fontSize: "16px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "20px",
  },
  button: {
    padding: "10px 20px",
    background: "rgba(80, 120, 200, 0.7)",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    fontFamily: "'Rajdhani', sans-serif",
    transition: "all 0.3s ease",
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
