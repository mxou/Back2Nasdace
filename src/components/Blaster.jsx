import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import victorySound from "./../assets/audio/success.mp3";
import defeatSound from "./../assets/audio/fail.mp3";

const Blaster = ({ onGameOver, setter, fuel, onClose, onComplete }) => {
  const [threats, setThreats] = useState([]);
  const [virusTarget, setVirusTarget] = useState(null);
  const [isGameActive, setIsGameActive] = useState(true);
  const [result, setResult] = useState("");
  const [countdown, setCountdown] = useState(12);
  const [laser, setLaser] = useState(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [level, setLevel] = useState(1);
  const [securityLevel, setSecurityLevel] = useState(1);
  const [gameCompleted, setGameCompleted] = useState(false);
  const gameAreaRef = useRef(null);
  const spaceshipRef = useRef(null);
  const navigate = useNavigate();

  // Types of cyber threats with their emojis
  const threatTypes = [
    { name: "ordinateur", emoji: "💻", isVirus: false },
    { name: "smartphone", emoji: "📱", isVirus: false },
    { name: "wifi", emoji: "📶", isVirus: false },
    { name: "serveur", emoji: "🖥️", isVirus: false },
    { name: "antenne", emoji: "📡", isVirus: false },
    { name: "cloud", emoji: "☁️", isVirus: false },
    { name: "carte-sd", emoji: "💾", isVirus: false },
    { name: "cd", emoji: "💿", isVirus: false },
    { name: "réseau", emoji: "🌐", isVirus: false },
    { name: "robot", emoji: "🤖", isVirus: false },
    { name: "chiffrement", emoji: "🔒", isVirus: false },
    { name: "email", emoji: "📧", isVirus: false },
    { name: "virus", emoji: "🦠", isVirus: true },
  ];

  const victoryAudio = new Audio(victorySound);
  const defeatAudio = new Audio(defeatSound);

  // Observer la taille du conteneur
  useEffect(() => {
    if (!gameAreaRef.current) return;

    const updateContainerSize = () => {
      if (gameAreaRef.current) {
        setContainerDimensions({
          width: gameAreaRef.current.clientWidth,
          height: gameAreaRef.current.clientHeight,
        });
      }
    };

    // Initialiser les dimensions
    updateContainerSize();

    // Observer les changements de taille
    const resizeObserver = new ResizeObserver(updateContainerSize);
    resizeObserver.observe(gameAreaRef.current);

    // Nettoyer l'observer
    return () => {
      if (gameAreaRef.current) {
        resizeObserver.unobserve(gameAreaRef.current);
      }
    };
  }, []);

  // Sélectionner les menaces et le virus au premier chargement seulement
  useEffect(() => {
    if (isInitialLoad) {
      generateNewThreatSet(level);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  // Regénérer uniquement les positions des menaces quand la taille du conteneur change
  useEffect(() => {
    if (
      containerDimensions.width > 0 &&
      containerDimensions.height > 0 &&
      selectedEntities.length > 0
    ) {
      // Ne pas changer les menaces, juste repositionner
      repositionThreats();
    }
  }, [containerDimensions, selectedEntities]);

  useEffect(() => {
    if (fuel <= 0) {
      onGameOver?.();
      navigate("/game-over");
    }
  }, [fuel, onGameOver, navigate]);

  useEffect(() => {
    // Vérifier si le niveau max est atteint (condition de victoire complète)
    if (securityLevel > 8 && !gameCompleted) {
      setGameCompleted(true);
      setResult("SÉCURITÉ MAXIMALE ATTEINTE - VICTOIRE !");

      // Notifier le composant parent que le jeu est complété après un délai
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    }
  }, [securityLevel, gameCompleted, onComplete]);

  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive]);

  // Fonction pour calculer le nombre de menaces basé sur le niveau
  const getThreatCount = (currentLevel) => {
    // Niveau fixe selon les specs: 1:2, 2:4, 3:8, 4:16, 5:32, 6:64, 7:128, 8:256
    const threatCounts = [2, 4, 8, 16, 32, 64, 128, 256];
    return threatCounts[currentLevel - 1] || 2; // Fallback à 2 si niveau non défini
  };

  // Générer un nouveau set de menaces incluant un virus
  const generateNewThreatSet = (currentLevel) => {
    // Utiliser le niveau actuel pour déterminer le nombre de menaces
    const threatCount = getThreatCount(currentLevel);

    // Toujours inclure un virus
    const virus = threatTypes.find((threat) => threat.isVirus);

    // Sélectionner des menaces aléatoires (non-virus)
    const nonVirusThreats = threatTypes.filter((threat) => !threat.isVirus);

    // Créer un tableau avec le nombre requis de menaces (peut contenir des répétitions)
    const selectedThreats = [];
    for (let i = 0; i < threatCount - 1; i++) {
      const randomIndex = Math.floor(Math.random() * nonVirusThreats.length);
      selectedThreats.push(nonVirusThreats[randomIndex]);
    }

    // Combiner le virus avec les autres menaces
    const newEntities = [...selectedThreats, virus];

    // Mélanger l'ordre
    const finalEntities = [...newEntities].sort(() => 0.5 - Math.random());

    setSelectedEntities(finalEntities);
    // Le virus est toujours notre cible
    setVirusTarget(virus);
  };

  // Repositionner les menaces sans changer leurs types
  const repositionThreats = () => {
    if (!gameAreaRef.current || selectedEntities.length === 0) return;

    const gameWidth = containerDimensions.width;
    const gameHeight = containerDimensions.height - 100;

    // Calculer la taille optimale des menaces en fonction de leur nombre
    const totalThreats = selectedEntities.length;
    const areaPerThreat = (gameWidth * gameHeight) / totalThreats;
    const optimalThreatRadius = Math.sqrt(areaPerThreat / Math.PI) * 0.4;

    // Limiter la taille minimale et maximale
    const minSize = Math.max(10, optimalThreatRadius * 0.5);
    const maxSize = Math.min(50, optimalThreatRadius * 1.5);

    // Taille de base ajustée pour le nombre de menaces
    const baseSize = Math.max(minSize, Math.min(maxSize, optimalThreatRadius));
    const maxSizeVariation = baseSize * 0.3;

    let newThreats = [];

    // Créer une grille pour placer les menaces
    const rows = Math.ceil(Math.sqrt(totalThreats));
    const cols = Math.ceil(totalThreats / rows);
    const cellWidth = gameWidth / cols;
    const cellHeight = gameHeight / rows;

    for (let i = 0; i < selectedEntities.length; i++) {
      const size = baseSize + Math.random() * maxSizeVariation;

      // Utiliser une approche de grille pour répartir les menaces
      const row = Math.floor(i / cols);
      const col = i % cols;

      // Position de base au centre de la cellule
      let x = col * cellWidth + cellWidth / 2;
      let y = row * cellHeight + cellHeight / 2;

      // Ajouter un peu de variation aléatoire dans la cellule
      x += (Math.random() - 0.5) * cellWidth * 0.5;
      y += (Math.random() - 0.5) * cellHeight * 0.5;

      // Vérifier que les menaces ne sont pas trop près des bords
      const margin = size / 2;
      x = Math.max(margin, Math.min(gameWidth - margin, x));
      y = Math.max(margin, Math.min(gameHeight * 0.9 - margin, y));

      newThreats.push({
        id: `threat-${i}-${Date.now()}`,
        entity: selectedEntities[i],
        x,
        y,
        size,
        isVirus: selectedEntities[i].isVirus,
      });
    }

    setThreats(newThreats);

    if (!isGameActive) {
      setCountdown(12); // Chrono fixe à 8 secondes
      setIsGameActive(true);
      setResult("");
    }
  };

  // Commence une nouvelle partie après une victoire ou une défaite
  const startNewGame = (levelUp = false) => {
    // Déterminer le niveau à utiliser
    let nextLevel = level;

    // Mettre à jour le niveau si c'est une victoire
    if (levelUp) {
      if (level < 8) {
        nextLevel = level + 1;
        setLevel(nextLevel);
        setSecurityLevel(nextLevel);

        generateNewThreatSet(nextLevel);
      } else {
        // Si niveau 8 réussi, marquer comme victoire complète
        setResult("SÉCURITÉ MAXIMALE ATTEINTE - VICTOIRE !");
        setGameCompleted(true);

        // Notification au composant parent après délai
        setTimeout(() => {
          onComplete?.();
        }, 2000);

        return; // Pas de nouveau niveau
      }
    } else {
      // En cas d'échec, on reste au même niveau mais on regénère les menaces
      setTimeout(() => {
        generateNewThreatSet(nextLevel);
      }, 0);

      // Repositionner avec les nouvelles menaces
      setTimeout(() => {
        repositionThreats();
      }, 100);
    }

    setCountdown(12); // Toujours 12 secondes
    setIsGameActive(true);
    setResult("");
  };

  const handleTimeout = () => {
    setIsGameActive(false);
    setResult("Temps écoulé !");
    setter((prev) => Math.max(0, prev - 10));

    defeatAudio.play();

    setTimeout(() => {
      if (fuel > 10) {
        startNewGame(false); // Nouvelle partie sans augmenter le niveau
      } else {
        onGameOver?.();
      }
    }, 1000);
  };

  const fireLaser = (targetX, targetY, targetSize) => {
    if (!spaceshipRef.current) return;

    const shipRect = spaceshipRef.current.getBoundingClientRect();
    const gameRect = gameAreaRef.current.getBoundingClientRect();

    // Position de départ du laser (centre du vaisseau)
    const startX = shipRect.left + shipRect.width / 2 - gameRect.left;
    const startY = shipRect.top - gameRect.top;

    // Position d'arrivée du laser (centre de la cible)
    const endX = targetX + targetSize / 2;
    const endY = targetY + targetSize / 2;

    // Calculer l'angle pour orienter le laser
    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

    // Calculer la longueur du laser
    const length = Math.sqrt(
      Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
    );

    // Créer le laser
    setLaser({
      startX,
      startY,
      angle,
      length,
      color: Math.random() > 0.5 ? "#00ffff" : "#00ff80", // Cyan ou vert néon
    });

    // Supprimer le laser après l'animation
    setTimeout(() => {
      setLaser(null);
    }, 300);
  };

  const handleShoot = (threatId, event) => {
    if (!isGameActive) return;

    const threat = threats.find((t) => t.id === threatId);
    if (!threat) return;

    // Tirer le laser
    fireLaser(threat.x, threat.y, threat.size);

    if (threat.isVirus) {
      // Message de victoire avec niveau
      setResult(`Niveau de sécurité ${securityLevel} sécurisé !`);
      victoryAudio.play();

      // Explosion animation
      const threatElement = event.currentTarget;
      threatElement.style.animation = "cyberExplode 0.5s";

      setIsGameActive(false);

      // Vérifier si c'est la dernière niveau
      if (level >= 8) {
        setTimeout(() => {
          setGameCompleted(true);
          onComplete?.();
        }, 1500);
      } else {
        setTimeout(() => startNewGame(true), 1500); // Augmenter le niveau
      }
    } else {
      setResult("Cible non-hostile ! -10 Plutonium 95 !");
      setter((prev) => Math.max(0, prev - 10));
      if (fuel <= 10) {
        onGameOver?.();
      } else {
        setTimeout(() => {
          startNewGame(false); // Nouvelle partie sans augmenter le niveau
        }, 800);
      }
      defeatAudio.play();
    }
  };

  // Ajouter un bouton pour quitter le jeu, comme dans Quiz
  const handleQuit = () => {
    onClose?.(gameCompleted);
  };

  // Calculer la taille de l'emoji en fonction de la taille de la menace
  const getThreatFontSize = (size) => {
    return Math.max(12, size * 0.6); // 60% de la taille de la menace, minimum 12px
  };

  return (
    <div ref={gameAreaRef} style={styles.container}>
      <style>
        {`
          @keyframes cyberExplode {
            0% { transform: scale(1); opacity: 1; box-shadow: 0 0 5px #00ffff; }
            50% { transform: scale(1.5); opacity: 0.7; box-shadow: 0 0 20px #00ffff; }
            100% { transform: scale(2); opacity: 0; box-shadow: 0 0 40px #00ffff; }
          }
          
          @keyframes laserBeam {
            0% { opacity: 0.7; }
            50% { opacity: 1; box-shadow: 0 0 8px currentColor; }
            100% { opacity: 0.7; }
          }
          
          @keyframes scanLine {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
        `}
      </style>

      {/* Scan lines overlay */}
      <div style={styles.scanLines}></div>

      <div style={styles.hud}>
        <div style={styles.hudItem}>
          SÉCURITÉ: <span style={styles.hudValue}>{securityLevel}/8</span>
        </div>
        <div style={styles.hudItem}>
          TEMPS: <span style={styles.hudValue}>{countdown}</span>
        </div>
        <div style={styles.hudItem}>
          MENACES: <span style={styles.hudValue}>{threats.length}</span>
        </div>
        <button onClick={handleQuit} style={styles.quitButton}>
          {gameCompleted ? "Terminer" : "Quitter"}
        </button>
      </div>

      <div style={styles.targetContainer}>
        ALERTE: <span style={styles.targetText}>VIRUS DÉTECTÉ 🦠</span>
      </div>

      {result && (
        <div
          style={
            result.includes("sécurisé")
              ? styles.success
              : result.includes("MAXIMALE")
              ? styles.megaSuccess
              : styles.failure
          }
        >
          {result}
        </div>
      )}

      {threats.map((threat) => (
        <div
          key={threat.id}
          onClick={(e) => handleShoot(threat.id, e)}
          style={{
            ...styles.threat,
            left: `${threat.x}px`,
            top: `${threat.y}px`,
            width: `${threat.size}px`,
            height: `${threat.size}px`,
            fontSize: `${getThreatFontSize(threat.size)}px`,
          }}
        >
          {threat.entity.emoji}
        </div>
      ))}

      {laser && (
        <div
          style={{
            ...styles.laser,
            left: `${laser.startX}px`,
            top: `${laser.startY}px`,
            width: `${laser.length}px`,
            transform: `rotate(${laser.angle}deg)`,
            backgroundColor: laser.color,
            boxShadow: `0 0 8px ${laser.color}`,
            transformOrigin: "left center",
            animation: "laserBeam 0.3s",
          }}
        />
      )}

      <div
        ref={spaceshipRef}
        style={{
          ...styles.spaceship,
          fontSize: `${
            Math.min(containerDimensions.width, containerDimensions.height) *
            0.06
          }px`,
        }}
      >
        🛸
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    background: "linear-gradient(to bottom, #000428, #004e92)",
    overflow: "hidden",
    color: "#00ffff",
    fontFamily: "'Courier New', monospace",
  },

  scanLines: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage:
      "linear-gradient(transparent 50%, rgba(0, 255, 255, 0.05) 50%)",
    backgroundSize: "100% 4px",
    pointerEvents: "none",
    zIndex: 10,
  },
  hud: {
    textAlign: "center",
    padding: "10px",
    fontSize: "clamp(14px, 2vw, 18px)",
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 20, 0.7)",
    borderBottom: "2px solid #00ffff",
    boxShadow: "0 0 10px #00ffff",
  },
  hudItem: {
    fontWeight: "bold",
  },
  hudValue: {
    color: "#00ffff",
    fontWeight: "normal",
  },
  quitButton: {
    padding: "5px 10px",
    background: "rgba(255, 50, 50, 0.7)",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  targetContainer: {
    textAlign: "center",
    fontSize: "clamp(16px, 2.5vw, 20px)",
    fontWeight: "bold",
    padding: "10px 0",
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    borderBottom: "1px solid #ff3333",
    animation: "pulse 2s infinite",
  },
  targetText: {
    color: "#ff3333",
    textShadow: "0 0 5px #ff3333",
  },
  success: {
    textAlign: "center",
    fontSize: "clamp(18px, 3vw, 24px)",
    color: "#00ffaa",
    textShadow: "0 0 10px #00ffaa",
    fontWeight: "bold",
    letterSpacing: "1px",
  },
  megaSuccess: {
    textAlign: "center",
    fontSize: "clamp(22px, 4vw, 28px)",
    color: "#ffff00",
    fontWeight: "bold",
    textShadow: "0 0 10px #ffff00, 0 0 20px #ffff00",
    letterSpacing: "2px",
  },
  failure: {
    textAlign: "center",
    fontSize: "clamp(18px, 3vw, 24px)",
    color: "#ff3333",
    textShadow: "0 0 10px #ff3333",
  },
  threat: {
    position: "absolute",
    backgroundColor: "rgba(0, 40, 80, 0.8)",
    border: "2px solid #00ffff",
    borderRadius: "10%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    cursor: "pointer",
    textAlign: "center",
    padding: "5px",
    overflow: "hidden",
    transition: "box-shadow 0.2s",
    boxShadow: "0 0 5px #00ffff",
  },
  spaceship: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    filter: "drop-shadow(0 0 5px #00ffff)",
  },
  laser: {
    position: "absolute",
    height: "3px",
    backgroundColor: "#00ffff",
    zIndex: 10,
  },
};

export default Blaster;
