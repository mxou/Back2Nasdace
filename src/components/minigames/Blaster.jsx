import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import victorySound from "../../public/audios/pnj.mp3";
import defeatSound from "../../public/audios/pnj.mp3";

const Blaster = ({
  onGameOver,
  onScoreUpdate,
  setter,
  fuel,
  vocabulary = [],
}) => {
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState(null);
  const [isGameActive, setIsGameActive] = useState(true);
  const [result, setResult] = useState("");
  const [countdown, setCountdown] = useState(8); // Chrono de 8 secondes
  const [laser, setLaser] = useState(null);
  const gameAreaRef = useRef(null);
  const spaceshipRef = useRef(null);
  const navigate = useNavigate();

  const defaultVocabulary = [
    { word: "planète", correct: true },
    { word: "satellite", correct: true },
    { word: "galaxie", correct: true },
    { word: "étoile", correct: true },
    { word: "météorite", correct: true },
    { word: "voiture", correct: false },
    { word: "ordinateur", correct: false },
  ];

  const vocabToUse = vocabulary.length > 0 ? vocabulary : defaultVocabulary;
  const victoryAudio = new Audio(victorySound);
  const defeatAudio = new Audio(defeatSound);

  useEffect(() => {
    if (fuel <= 0) {
      onGameOver?.();
      navigate("/gameover");
    }
  }, [fuel]);

  // Générer les astéroïdes au démarrage du jeu
  useEffect(() => {
    startNewGame();
  }, []);

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

  // Créer une nouvelle partie avec de nouveaux astéroïdes et un nouveau mot
  const startNewGame = () => {
    const newTargets = generateTargets();
    setTargets(newTargets);

    // Choisir un mot parmi les astéroïdes générés
    const correctTargets = newTargets.filter((target) => target.correct);
    if (correctTargets.length > 0) {
      const randomIndex = Math.floor(Math.random() * correctTargets.length);
      setCurrentWord(correctTargets[randomIndex].word);
    }

    setCountdown(8);
    setIsGameActive(true);
    setResult("");
  };

  const generateTargets = () => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return [];

    const gameWidth = gameArea.clientWidth;
    const gameHeight = gameArea.clientHeight - 100;

    const shuffled = [...vocabToUse].sort(() => 0.5 - Math.random());
    const selectedVocab = shuffled.slice(0, 4);

    let newTargets = [];
    for (let i = 0; i < selectedVocab.length; i++) {
      let x, y;
      let overlap = true;
      while (overlap) {
        overlap = false;
        x = Math.random() * (gameWidth - 100);
        y = Math.random() * (gameHeight * 0.5) + 100;
        newTargets.forEach((target) => {
          const distance = Math.sqrt(
            Math.pow(target.x - x, 2) + Math.pow(target.y - y, 2)
          );
          if (distance < target.size + 50) {
            overlap = true;
          }
        });
      }

      newTargets.push({
        id: Date.now() + i,
        word: selectedVocab[i].word,
        x,
        y,
        size: 80 + Math.random() * 30,
        correct: selectedVocab[i].correct,
      });
    }

    return newTargets;
  };

  const handleTimeout = () => {
    setIsGameActive(false);
    setResult("Temps écoulé !");
    setter((prev) => Math.max(0, prev - 10));

    defeatAudio.play();

    setTimeout(() => {
      if (fuel > 10) startNewGame(); // Réinitialiser le jeu avec de nouveaux astéroïdes
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
      color: Math.random() > 0.5 ? "#ff0000" : "#00ff00",
    });

    // Supprimer le laser après l'animation
    setTimeout(() => {
      setLaser(null);
    }, 300);
  };

  const handleShoot = (targetId, event) => {
    if (!isGameActive) return;

    const target = targets.find((t) => t.id === targetId);
    if (!target) return;

    // Tirer le laser
    fireLaser(target.x, target.y, target.size);

    if (target.word === currentWord) {
      setResult("Victoire !");
      setScore((prev) => prev + 10);
      onScoreUpdate?.(score + 10);
      victoryAudio.play();

      // Explosion animation
      const targetElement = event.currentTarget;
      targetElement.style.animation = "explode 0.5s";

      setIsGameActive(false);
      setTimeout(startNewGame, 800); // Réinitialiser avec de nouveaux astéroïdes
    } else {
      setResult("Perdu !");
      setter((prev) => Math.max(0, prev - 10));
      if (fuel <= 10) {
        onGameOver?.();
      } else {
        // Réinitialiser avec de nouveaux astéroïdes après une défaite
        setTimeout(() => {
          startNewGame();
        }, 800);
      }
      defeatAudio.play();
    }
  };

  return (
    <div ref={gameAreaRef} style={styles.container}>
      <style>
        {`
          @keyframes explode {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.7; }
            100% { transform: scale(2); opacity: 0; }
          }
          
          @keyframes laserBeam {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
          }
        `}
      </style>

      <div style={styles.hud}>
        <div>Score: {score}</div>
        <div>Temps restant: {countdown}</div>
      </div>

      <div style={styles.targetContainer}>
        Trouvez: <span style={styles.targetText}>{currentWord}</span>
      </div>

      {result && (
        <div style={result === "Victoire !" ? styles.success : styles.failure}>
          {result}
        </div>
      )}

      {targets.map((target) => (
        <div
          key={target.id}
          onClick={(e) => handleShoot(target.id, e)}
          style={{
            ...styles.asteroid,
            left: `${target.x}px`,
            top: `${target.y}px`,
            width: `${target.size}px`,
            height: `${target.size}px`,
          }}
        >
          {target.word}
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
            transformOrigin: "left center",
            animation: "laserBeam 0.3s",
          }}
        />
      )}

      <div ref={spaceshipRef} style={styles.spaceship}>
        🚀
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "600px",
    background: "linear-gradient(to bottom, #0a0a2a, #1e1e5a)",
    overflow: "hidden",
    color: "white",
  },
  hud: {
    textAlign: "center",
    padding: "10px",
    fontSize: "18px",
    display: "flex",
    justifyContent: "space-between",
  },
  targetContainer: {
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "bold",
    padding: "10px 0",
  },
  targetText: {
    color: "#facc15",
  },
  success: {
    textAlign: "center",
    fontSize: "24px",
    color: "#4ade80",
  },
  failure: {
    textAlign: "center",
    fontSize: "24px",
    color: "#f87171",
  },
  asteroid: {
    position: "absolute",
    backgroundColor: "#4338ca",
    border: "2px solid #818cf8",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  spaceship: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "40px",
  },
  laser: {
    position: "absolute",
    height: "3px",
    backgroundColor: "#ff0000",
    zIndex: 10,
  },
};

export default Blaster;
