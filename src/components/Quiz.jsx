import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import victorySound from "./../assets/audio/success.mp3";
import defeatSound from "./../assets/audio/fail.mp3";

const Quiz = ({ onGameOver, onScoreUpdate, setter, fuel }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [countdown, setCountdown] = useState(8);
  const [result, setResult] = useState("");
  const [isGameActive, setIsGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [clickedIndex, setClickedIndex] = useState(null);
  const navigate = useNavigate();
  const victoryAudio = new Audio(victorySound);
  const defeatAudio = new Audio(defeatSound);
  useEffect(() => {
    if (fuel <= 0) {
      navigate("/gameover");
    }
  }, [fuel, navigate]);

  const questions = [
    {
      question: "Quelle est la plus grande planète du système solaire ?",
      choices: ["Mars", "Saturne", "Jupiter", "Neptune"],
      correct: 2,
    },
    {
      question: "Quelle est la distance moyenne entre la Terre et le Soleil ?",
      choices: [
        "150 millions km",
        "100 millions km",
        "200 millions km",
        "250 millions km",
      ],
      correct: 0,
    },
    {
      question: "Qu'est-ce qu'un trou noir ?",
      choices: [
        "Une étoile morte",
        "Un objet si dense que même la lumière ne peut s'en échapper",
        "Une planète sombre",
        "Un astéroïde noir",
      ],
      correct: 1,
    },
    {
      question: "Quelle est la galaxie la plus proche de la Voie lactée ?",
      choices: ["Andromède", "Triangle", "Grande Ourse", "Orion"],
      correct: 0,
    },
    {
      question: "Quel est le nom du premier homme à avoir marché sur la Lune ?",
      choices: [
        "Buzz Aldrin",
        "Neil Armstrong",
        "Youri Gagarine",
        "Alan Shepard",
      ],
      correct: 1,
    },
  ];

  useEffect(() => {
    selectNewQuestion();
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

  const selectNewQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestion(questions[randomIndex]);
  };

  const handleTimeout = () => {
    setIsGameActive(false);
    setResult("⏳ Temps écoulé !");
    setClickedIndex(null);

    if (fuel === 0) onGameOver?.();
    setTimeout(nextQuestion, 2000);
  };

  const nextQuestion = () => {
    selectNewQuestion();
    setCountdown(8);
    setIsGameActive(true);
    setResult("");
    setClickedIndex(null);
  };

  const handleAnswer = (selectedIndex) => {
    if (!isGameActive) return;

    const isCorrect = selectedIndex === currentQuestion.correct;
    setResult(isCorrect ? "✅ Victoire !" : "❌ Perdu !");
    setIsGameActive(false);
    setClickedIndex(selectedIndex);

    if (isCorrect) {
      setScore((prev) => prev + 10);
      onScoreUpdate?.(score + 10);
      victoryAudio.play();
    } else {
      setter((prev) => prev - 10);
      defeatAudio.play();
      if (fuel <= 10) onGameOver?.();
    }

    setTimeout(nextQuestion, 2000);
  };

  if (!currentQuestion) return null;

  return (
    <div style={styles.container}>
      <div style={styles.hud}>
        <div style={styles.score}>💎 Score: {score}</div>
        <div style={styles.timer}>{countdown}</div>
      </div>

      {result && (
        <div
          style={
            result.includes("Victoire")
              ? styles.successMessage
              : styles.errorMessage
          }
        >
          {result}
        </div>
      )}

      <div style={styles.question}>{currentQuestion.question}</div>

      <div style={styles.choicesContainer}>
        {currentQuestion.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={!isGameActive}
            style={{
              ...styles.choiceButton,
              ...(clickedIndex === index
                ? result.includes("Victoire")
                  ? styles.correctChoice
                  : styles.wrongChoice
                : {}),
            }}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    background: "rgba(0, 0, 0, 0.8)",
    borderRadius: "10px",
    boxShadow: "0 0 15px cyan",
    color: "white",
    fontFamily: "Orbitron, sans-serif",
    textAlign: "center",
  },
  hud: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "18px",
    fontWeight: "bold",
    textShadow: "0 0 5px cyan",
  },
  score: {
    color: "cyan",
  },
  timer: {
    fontSize: "20px",
    color: "lime",
  },
  question: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "10px",
    textShadow: "0 0 5px yellow",
  },
  choicesContainer: {
    display: "grid",
    gap: "10px",
  },
  choiceButton: {
    padding: "10px",
    borderRadius: "5px",
    border: "2px solid cyan",
    background: "linear-gradient(45deg, #0000ff, #00ffff)",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "transform 0.3s, box-shadow 0.3s",
    textShadow: "0 0 5px black",
  },
  correctChoice: {
    background: "lime",
    boxShadow: "0 0 20px lime",
    transform: "scale(1.05)",
  },
  wrongChoice: {
    background: "red",
    boxShadow: "0 0 15px red",
    animation: "shake 0.3s",
  },
  successMessage: {
    color: "lime",
    fontSize: "22px",
    fontWeight: "bold",
    textShadow: "0 0 10px lime",
    animation: "pulse 0.5s infinite alternate",
  },
  errorMessage: {
    color: "red",
    fontSize: "22px",
    fontWeight: "bold",
    textShadow: "0 0 10px red",
    animation: "glitch 0.3s infinite",
  },
};

export default Quiz;
