import React, { useState, useEffect } from "react";
import victorySound from "./../assets/audio/success.mp3";
import defeatSound from "./../assets/audio/fail.mp3";

const Quiz = ({
  onGameOver,
  onScoreUpdate,
  setter,
  fuel,
  onClose,
  onComplete,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [countdown, setCountdown] = useState(8);
  const [result, setResult] = useState("");
  const [isGameActive, setIsGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [clickedIndex, setClickedIndex] = useState(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState([]);
  const [failedQuestions, setFailedQuestions] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const victoryAudio = new Audio(victorySound);
  const defeatAudio = new Audio(defeatSound);

  useEffect(() => {
    if (fuel <= 0) {
      onGameOver?.();
    }
  }, [fuel, onGameOver]);

  const questions = [
    {
      id: 1,
      question: "Quelle est la plus grande planète du système solaire ?",
      choices: ["Mars", "Saturne", "Jupiter", "Neptune"],
      correct: 2,
    },
    {
      id: 2,
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
      id: 3,
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
      id: 4,
      question: "Quelle est la galaxie la plus proche de la Voie lactée ?",
      choices: ["Andromède", "Triangle", "Grande Ourse", "Orion"],
      correct: 0,
    },
    {
      id: 5,
      question: "Quel est le nom du premier homme à avoir marché sur la Lune ?",
      choices: [
        "Buzz Aldrin",
        "Neil Armstrong",
        "Youri Gagarine",
        "Alan Shepard",
      ],
      correct: 1,
    },
    {
      id: 6,
      question: "Combien de planètes composent notre système solaire ?",
      choices: ["7", "8", "9", "10"],
      correct: 1,
    },
    {
      id: 7,
      question: "Quelle est la planète la plus proche du Soleil ?",
      choices: ["Mars", "Vénus", "Mercure", "Terre"],
      correct: 2,
    },
    {
      id: 8,
      question: "De quoi sont principalement composés les anneaux de Saturne ?",
      choices: [
        "De gaz",
        "De glace et de poussière",
        "De métal",
        "De roches volcaniques",
      ],
      correct: 1,
    },
    {
      id: 9,
      question: "Comment s'appelle le satellite naturel de la Terre ?",
      choices: ["Luna", "La Lune", "Titan", "Europe"],
      correct: 1,
    },
    {
      id: 10,
      question: "Quelle est la durée d'un jour sur Vénus ?",
      choices: [
        "24 heures",
        "243 jours terrestres",
        "18 heures",
        "30 jours terrestres",
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

  useEffect(() => {
    // Vérifier si toutes les questions ont été répondues correctement
    if (
      answeredCorrectly.length === questions.length &&
      failedQuestions.length === 0 &&
      !gameCompleted
    ) {
      setGameCompleted(true);
      setResult("🏆 Félicitations ! Quiz complété !");

      // Notifier le composant parent que le jeu est complété
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    }
  }, [answeredCorrectly, failedQuestions, gameCompleted, onComplete]);

  const selectNewQuestion = () => {
    // Priorité aux questions échouées
    if (failedQuestions.length > 0) {
      const randomFailedIndex = Math.floor(
        Math.random() * failedQuestions.length
      );
      const nextFailedQuestion = failedQuestions[randomFailedIndex];
      setCurrentQuestion(nextFailedQuestion);
      // Enlever cette question de la liste des questions échouées
      setFailedQuestions(
        failedQuestions.filter((_, index) => index !== randomFailedIndex)
      );
      return;
    }

    // Choisir une nouvelle question parmi celles non répondues correctement
    const unansweredQuestions = questions.filter(
      (q) => !answeredCorrectly.some((answered) => answered.id === q.id)
    );

    if (unansweredQuestions.length === 0) {
      // Toutes les questions ont été répondues correctement
      setResult("🏆 Félicitations ! Quiz complété !");
      return;
    }

    const randomIndex = Math.floor(Math.random() * unansweredQuestions.length);
    setCurrentQuestion(unansweredQuestions[randomIndex]);
  };

  const handleTimeout = () => {
    setIsGameActive(false);
    setResult("⏳ Temps écoulé !");
    setClickedIndex(null);

    // Ajouter la question actuelle aux questions échouées si elle n'y est pas déjà
    if (
      currentQuestion &&
      !failedQuestions.some((q) => q.id === currentQuestion.id)
    ) {
      setFailedQuestions((prev) => [...prev, currentQuestion]);
    }

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
      // Marquer cette question comme correctement répondue
      if (!answeredCorrectly.some((q) => q.id === currentQuestion.id)) {
        setAnsweredCorrectly((prev) => [...prev, currentQuestion]);
      }

      setScore((prev) => prev + 10);
      onScoreUpdate?.(score + 10);
      victoryAudio.play();
    } else {
      // Ajouter à la liste des questions échouées si pas déjà présente
      if (!failedQuestions.some((q) => q.id === currentQuestion.id)) {
        setFailedQuestions((prev) => [...prev, currentQuestion]);
      }

      setter((prev) => prev - 10);
      defeatAudio.play();
      if (fuel <= 10) onGameOver?.();
    }

    setTimeout(nextQuestion, 2000);
  };

  // Ajouter un bouton pour quitter le quiz
  const handleQuit = () => {
    onClose?.(gameCompleted);
  };

  if (!currentQuestion) return null;

  return (
    <div style={styles.container}>
      <div style={styles.hud}>
        <div style={styles.score}>💎 Score: {score}</div>
        <div style={styles.progress}>
          {answeredCorrectly.length}/{questions.length} questions
        </div>
        <div style={styles.timer}>{countdown}</div>
        <button onClick={handleQuit} style={styles.quitButton}>
          {gameCompleted ? "Terminer" : "Quitter"}
        </button>
      </div>

      {result && (
        <div
          style={
            result.includes("Victoire") || result.includes("Félicitations")
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
    flexWrap: "wrap",
  },
  score: {
    color: "cyan",
  },
  progress: {
    color: "yellow",
  },
  timer: {
    fontSize: "20px",
    color: "lime",
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
