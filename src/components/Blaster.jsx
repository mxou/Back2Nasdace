import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import victorySound from "./../assets/audio/success.mp3";
import defeatSound from "./../assets/audio/fail.mp3";

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
  const [countdown, setCountdown] = useState(800);
  const [laser, setLaser] = useState(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [selectedVocab, setSelectedVocab] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
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

  // Sélectionner le vocabulaire et le mot cible au premier chargement seulement
  useEffect(() => {
    if (isInitialLoad) {
      const shuffled = [...vocabToUse].sort(() => 0.5 - Math.random());
      const vocabSelection = shuffled.slice(0, 4);
      setSelectedVocab(vocabSelection);

      // Choisir un mot cible parmi les mots corrects
      const correctVocab = vocabSelection.filter((item) => item.correct);
      if (correctVocab.length > 0) {
        const randomIndex = Math.floor(Math.random() * correctVocab.length);
        setCurrentWord(correctVocab[randomIndex].word);
      }

      setIsInitialLoad(false);
    }
  }, [vocabToUse, isInitialLoad]);

  // Regénérer uniquement les positions des astéroïdes quand la taille du conteneur change
  useEffect(() => {
    if (
      containerDimensions.width > 0 &&
      containerDimensions.height > 0 &&
      selectedVocab.length > 0
    ) {
      // Ne pas changer les mots, juste repositionner
      repositionTargets();
    }
  }, [containerDimensions, selectedVocab]);

  useEffect(() => {
    if (fuel <= 0) {
      onGameOver?.();
      navigate("/GameOver");
    }
  }, [fuel]);

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

  // Repositionner les astéroïdes sans changer les mots
  const repositionTargets = () => {
    if (!gameAreaRef.current || selectedVocab.length === 0) return;

    const gameWidth = containerDimensions.width;
    const gameHeight = containerDimensions.height - 100;

    const baseSize = Math.min(gameWidth, gameHeight) * 0.12;
    const maxSizeVariation = baseSize * 0.3;

    let newTargets = [];
    let maxAttempts = 100;

    for (let i = 0; i < selectedVocab.length; i++) {
      let x, y;
      let overlap = true;
      let attempts = 0;

      const size = baseSize + Math.random() * maxSizeVariation;

      while (overlap && attempts < maxAttempts) {
        attempts++;
        overlap = false;

        const margin = size / 2;
        x = margin + Math.random() * (gameWidth - size - margin * 2);
        y = margin + Math.random() * (gameHeight * 0.5);

        for (const target of newTargets) {
          const distance = Math.sqrt(
            Math.pow(target.x - x, 2) + Math.pow(target.y - y, 2)
          );
          const minDistance = target.size / 2 + size / 2 + 20;

          if (distance < minDistance) {
            overlap = true;
            break;
          }
        }
      }

      newTargets.push({
        id: Date.now() + i,
        word: selectedVocab[i].word,
        x,
        y,
        size,
        correct: selectedVocab[i].correct,
      });
    }

    setTargets(newTargets);

    if (!isGameActive) {
      setCountdown(800);
      setIsGameActive(true);
      setResult("");
    }
  };

  // Commence une nouvelle partie après une victoire ou une défaite
  const startNewGame = () => {
    // Sélectionner de nouveaux mots uniquement pour une nouvelle partie (pas pour un redimensionnement)
    const shuffled = [...vocabToUse].sort(() => 0.5 - Math.random());
    const vocabSelection = shuffled.slice(0, 4);
    setSelectedVocab(vocabSelection);

    // Choisir un nouveau mot cible
    const correctVocab = vocabSelection.filter((item) => item.correct);
    if (correctVocab.length > 0) {
      const randomIndex = Math.floor(Math.random() * correctVocab.length);
      setCurrentWord(correctVocab[randomIndex].word);
    }

    // Repositionner avec les nouveaux mots
    setTimeout(() => {
      repositionTargets();
    }, 0);

    setCountdown(800);
    setIsGameActive(true);
    setResult("");
  };

  const handleTimeout = () => {
    setIsGameActive(false);
    setResult("Temps écoulé !");
    setter((prev) => Math.max(0, prev - 10));

    defeatAudio.play();

    setTimeout(() => {
      if (fuel > 10) startNewGame(); // Nouvelle partie avec nouveaux mots
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
      setTimeout(startNewGame, 800); // Nouvelle partie avec nouveaux mots
    } else {
      setResult("Perdu !");
      setter((prev) => Math.max(0, prev - 10));
      if (fuel <= 10) {
        onGameOver?.();
      } else {
        setTimeout(() => {
          startNewGame(); // Nouvelle partie avec nouveaux mots
        }, 800);
      }
      defeatAudio.play();
    }
  };

  // Calculer la taille de la police en fonction de la taille de l'astéroïde
  const getAsteroidFontSize = (size) => {
    return Math.max(12, size * 0.25); // 25% de la taille de l'astéroïde, minimum 12px
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
            fontSize: `${getAsteroidFontSize(target.size)}px`,
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
        🚀
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    background: "linear-gradient(to bottom, #0a0a2a, #1e1e5a)",
    overflow: "hidden",
    color: "white",
  },
  hud: {
    textAlign: "center",
    padding: "10px",
    fontSize: "clamp(14px, 2vw, 18px)",
    display: "flex",
    justifyContent: "space-between",
  },
  targetContainer: {
    textAlign: "center",
    fontSize: "clamp(16px, 2.5vw, 20px)",
    fontWeight: "bold",
    padding: "10px 0",
  },
  targetText: {
    color: "#facc15",
  },
  success: {
    textAlign: "center",
    fontSize: "clamp(18px, 3vw, 24px)",
    color: "#4ade80",
  },
  failure: {
    textAlign: "center",
    fontSize: "clamp(18px, 3vw, 24px)",
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
    textAlign: "center",
    padding: "5px",
    wordBreak: "break-word",
    overflow: "hidden",
  },
  spaceship: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
  },
  laser: {
    position: "absolute",
    height: "3px",
    backgroundColor: "#ff0000",
    zIndex: 10,
  },
};

export default Blaster;
