import React, { useState, useEffect } from "react";
import victorySound from "./../assets/audio/success.mp3";
import defeatSound from "./../assets/audio/fail.mp3";
import { useNavigate } from "react-router-dom";

const Exam = ({ onGameOver, onClose, onComplete, setter, fuel }) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [countdown, setCountdown] = useState(8);
  const [result, setResult] = useState("");
  const [isGameActive, setIsGameActive] = useState(true);
  const [clickedIndex, setClickedIndex] = useState(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState([]);
  const [failedQuestions, setFailedQuestions] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [askedQuestions, setAskedQuestions] = useState([]); // Tracker pour les questions déjà posées
  const victoryAudio = new Audio(victorySound);
  const defeatAudio = new Audio(defeatSound);

  useEffect(() => {
    if (fuel <= 0) {
      onGameOver?.();
      navigate("/game-over");
    }
  }, [fuel, onGameOver, navigate]);

  const questions = [
    {
      id: 1,
      question: "Quel surnom donne-t-on à Mars en raison de sa couleur ?",
      choices: [
        "La planète bleue",
        "La planète rouge",
        "La planète dorée",
        "La planète verte",
      ],
      correct: 1,
    },
    {
      id: 2,
      question: "Combien de satellites naturels Mars possède-t-elle ?",
      choices: ["Aucun", "1", "2", "4"],
      correct: 2,
    },
    {
      id: 3,
      question: "Comment s'appellent les deux lunes de Mars ?",
      choices: [
        "Ganymède et Callisto",
        "Titan et Encelade",
        "Phobos et Deimos",
        "Europa et Io",
      ],
      correct: 2,
    },
    {
      id: 4,
      question: "Quelle est la distance entre la Terre et Mars ?",
      choices: [
        "62 Millions de Km",
        "69 Millions de Km",
        "32 Millions de Km",
        "86 Millions de Km",
      ],
      correct: 0,
    },
    {
      id: 5,
      question:
        "Quel est le nom du plus grand volcan du système solaire, situé sur Mars ?",
      choices: ["Olympus Mons", "Tharsis Montes", "Elysium Mons", "Arsia Mons"],
      correct: 0,
    },
    {
      id: 6,
      question: "Quelle est la température moyenne à la surface de Mars ?",
      choices: ["15°C", "-63°C", "-20°C", "-120°C"],
      correct: 1,
    },
    {
      id: 7,
      question:
        "Quel rover a été le premier à explorer avec succès la surface de Mars en 1997 ?",
      choices: ["Curiosity", "Opportunity", "Sojourner", "Perseverance"],
      correct: 2,
    },
    {
      id: 8,
      question: "Combien de temps dure une année sur Mars ?",
      choices: [
        "365 jours terrestres",
        "687 jours terrestres",
        "550 jours terrestres",
        "780 jours terrestres",
      ],
      correct: 1,
    },
    {
      id: 9,
      question:
        "Quelle vallée martienne est considérée comme le plus grand canyon du système solaire ?",
      choices: [
        "Valles Marineris",
        "Noctis Labyrinthus",
        "Melas Chasma",
        "Hebes Chasma",
      ],
      correct: 0,
    },
    {
      id: 10,
      question: "Sous quelle forme l'eau est-elle présente sur Mars ?",
      choices: ["Aucune", "Glace", "Vapeur", "Glace et vapeur"],
      correct: 3,
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
    if (answeredCorrectly.length === questions.length && !gameCompleted) {
      setGameCompleted(true);
      setResult("🏆 Félicitations ! Exam complété !");

      // Notifier le composant parent que le jeu est complété
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    }
  }, [answeredCorrectly, gameCompleted, onComplete, questions.length]);

  const selectNewQuestion = () => {
    // Nettoyer les failedQuestions pour ne pas inclure les questions déjà répondues correctement
    const updatedFailedQuestions = failedQuestions.filter(
      (q) => !answeredCorrectly.some((correct) => correct.id === q.id)
    );

    // Mettre à jour le state avec la liste nettoyée
    if (updatedFailedQuestions.length !== failedQuestions.length) {
      setFailedQuestions(updatedFailedQuestions);
    }

    // Priorité aux questions échouées
    if (updatedFailedQuestions.length > 0) {
      const randomFailedIndex = Math.floor(
        Math.random() * updatedFailedQuestions.length
      );
      const nextFailedQuestion = updatedFailedQuestions[randomFailedIndex];
      setCurrentQuestion(nextFailedQuestion);
      // Enlever cette question de la liste des questions échouées
      setFailedQuestions((prev) =>
        prev.filter((q) => q.id !== nextFailedQuestion.id)
      );
      // Marquer comme posée
      if (!askedQuestions.includes(nextFailedQuestion.id)) {
        setAskedQuestions((prev) => [...prev, nextFailedQuestion.id]);
      }
      return;
    }

    // Choisir une nouvelle question parmi celles non répondues correctement
    const remainingQuestions = questions.filter(
      (q) =>
        !answeredCorrectly.some((answered) => answered.id === q.id) &&
        !askedQuestions.includes(q.id)
    );

    // Si toutes les questions restantes ont déjà été posées, mais pas répondues correctement
    // alors on peut réutiliser les questions non répondues
    if (remainingQuestions.length === 0) {
      const unansweredQuestions = questions.filter(
        (q) => !answeredCorrectly.some((answered) => answered.id === q.id)
      );

      if (unansweredQuestions.length === 0) {
        // Toutes les questions ont été répondues correctement
        setResult("🏆 Félicitations ! Exam complété !");
        setGameCompleted(true);
        return;
      }

      const randomIndex = Math.floor(
        Math.random() * unansweredQuestions.length
      );
      const nextQuestion = unansweredQuestions[randomIndex];
      setCurrentQuestion(nextQuestion);

      // Réinitialiser les questions posées si on a fait le tour
      setAskedQuestions([nextQuestion.id]);
      return;
    }

    // Sinon on prend une question non encore posée
    const randomIndex = Math.floor(Math.random() * remainingQuestions.length);
    const nextQuestion = remainingQuestions[randomIndex];
    setCurrentQuestion(nextQuestion);

    // Marquer comme posée
    setAskedQuestions((prev) => [...prev, nextQuestion.id]);
  };

  const handleTimeout = () => {
    setIsGameActive(false);
    setResult("⏳ Temps écoulé !");
    setClickedIndex(null);

    // Réduire le carburant lorsque le temps est écoulé
    setter((prev) => prev - 10);
    defeatAudio.play();

    // Vérifier si la question actuelle est déjà dans answeredCorrectly
    const alreadyAnsweredCorrectly = answeredCorrectly.some(
      (q) => q.id === currentQuestion.id
    );

    // Ajouter la question actuelle aux questions échouées seulement si pas déjà répondue correctement
    if (
      currentQuestion &&
      !alreadyAnsweredCorrectly &&
      !failedQuestions.some((q) => q.id === currentQuestion.id)
    ) {
      setFailedQuestions((prev) => [...prev, currentQuestion]);
    }

    // Vérifier si le carburant est épuisé après la pénalité
    if (fuel <= 10) onGameOver?.();

    setTimeout(nextQuestion, 2000);
  };

  const nextQuestion = () => {
    // Vérifier si la question actuelle a été correctement répondue
    if (currentQuestion && result.includes("Victoire")) {
      // Ajouter à answeredCorrectly si pas déjà présente
      if (!answeredCorrectly.some((q) => q.id === currentQuestion.id)) {
        setAnsweredCorrectly((prev) => [...prev, currentQuestion]);

        // Retirer de failedQuestions si présente
        if (failedQuestions.some((q) => q.id === currentQuestion.id)) {
          setFailedQuestions((prev) =>
            prev.filter((q) => q.id !== currentQuestion.id)
          );
        }
      }
    }

    selectNewQuestion();
    setCountdown(8);
    setIsGameActive(true);
    setResult("");
    setClickedIndex(null);
  };

  const handleAnswer = (selectedIndex) => {
    if (!isGameActive) return;

    setClickedIndex(selectedIndex);
    const isCorrect = selectedIndex === currentQuestion.correct;
    setResult(isCorrect ? "✅ Victoire !" : "❌ Perdu !");
    setIsGameActive(false);

    if (isCorrect) {
      // Ajouter aux questions répondues correctement
      if (!answeredCorrectly.some((q) => q.id === currentQuestion.id)) {
        setAnsweredCorrectly((prev) => [...prev, currentQuestion]);

        // Retirer des questions échouées si présente
        if (failedQuestions.some((q) => q.id === currentQuestion.id)) {
          setFailedQuestions((prev) =>
            prev.filter((q) => q.id !== currentQuestion.id)
          );
        }
      }
      victoryAudio.play();
    } else {
      // Ajouter aux questions échouées seulement si pas déjà répondue correctement
      if (!answeredCorrectly.some((q) => q.id === currentQuestion.id)) {
        setFailedQuestions((prev) => {
          if (!prev.some((q) => q.id === currentQuestion.id)) {
            return [...prev, currentQuestion];
          }
          return prev;
        });
      }

      setter((prev) => prev - 10);
      defeatAudio.play();
      if (fuel <= 10) onGameOver?.();
    }

    setTimeout(nextQuestion, 2000);
  };

  // Ajouter un bouton pour quitter le Exam
  const handleQuit = () => {
    onClose?.(gameCompleted);
  };

  if (!currentQuestion) return null;

  // Fonction pour le debugging
  const getStatusInfo = () => {
    return {
      currentQuestionId: currentQuestion?.id,
      answeredCorrectlyIds: answeredCorrectly.map((q) => q.id),
      failedQuestionsIds: failedQuestions.map((q) => q.id),
      askedQuestionsIds: askedQuestions,
    };
  };

  // Afficher les informations de débogage dans la console
  console.log("Status:", getStatusInfo());

  return (
    <div style={styles.container}>
      <div style={styles.hud}>
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
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 999,
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

export default Exam;
