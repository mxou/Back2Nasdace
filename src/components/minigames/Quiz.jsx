import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Quiz = ({ onGameOver, onScoreUpdate, setter, fuel }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [countdown, setCountdown] = useState(8);
  const [result, setResult] = useState("");
  const [isGameActive, setIsGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

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
    }, 800);

    return () => clearInterval(timer);
  }, [isGameActive]);

  const selectNewQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestion(questions[randomIndex]);
  };

  const handleTimeout = () => {
    setIsGameActive(false);
    setResult("Temps écoulé !");
    setter((prev) => prev - 10);
    if (fuel === 0) onGameOver?.();
    setTimeout(nextQuestion, 1500);
  };

  const nextQuestion = () => {
    selectNewQuestion();
    setCountdown(8);
    setIsGameActive(true);
    setResult("");
  };

  const handleAnswer = (selectedIndex) => {
    if (!isGameActive) return;

    const isCorrect = selectedIndex === currentQuestion.correct;
    setResult(isCorrect ? "Victoire !" : "Perdu !");
    setIsGameActive(false);

    if (isCorrect) {
      setScore((prev) => prev + 10);
      onScoreUpdate?.(score + 10);
    } else {
      setter((prev) => prev - 10);
      if (fuel <= 10) onGameOver?.();
    }

    setTimeout(nextQuestion, 1500);
  };

  if (!currentQuestion) return null;

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "10px",
        boxShadow: "0 0 10px #ff00ff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <div style={{ fontSize: "18px" }}>Score: {score}</div>
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>{countdown}</div>
      </div>

      {result && (
        <div
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "bold",
            marginBottom: "10px",
            color: result === "Victoire !" ? "#00ff00" : "#ff0000",
          }}
        >
          {result}
        </div>
      )}

      <div
        style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}
      >
        {currentQuestion.question}
      </div>

      <div>
        {currentQuestion.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={!isGameActive}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginBottom: "5px",
              borderRadius: "5px",
              border: "2px solid #ff00ff",
              background: "linear-gradient(45deg, #ff00ff, #00ff00)",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              transition: "0.3s",
              opacity: isGameActive ? 1 : 0.5,
            }}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Quiz;
