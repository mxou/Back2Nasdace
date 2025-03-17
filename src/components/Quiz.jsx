import React, { useState } from "react";

const Quiz = ({ onAnswer, onClose }) => {
  // Question du quiz et ses options
  const question = "Quelle est la capitale de la France ?";
  const options = ["Paris", "Londres", "Berlin", "Madrid"];
  const correctAnswer = "Paris";

  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (answer === correctAnswer) {
      onAnswer("Réussi");
    } else {
      onAnswer("Perdu");
    }
  };

  return (
    <div style={styles.quizContainer}>
      <h2>{question}</h2>
      {options.map((option, index) => (
        <button key={index} onClick={() => handleAnswer(option)} style={styles.option}>
          {option}
        </button>
      ))}
      <button onClick={onClose} style={styles.closeButton}>
        Fermer
      </button>
    </div>
  );
};

const styles = {
  quizContainer: {
    position: "absolute",
    top: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: "20px",
    borderRadius: "8px",
    color: "white",
    fontFamily: "Arial, sans-serif",
    zIndex: 10,
  },
  option: {
    backgroundColor: "#3d3d3d",
    border: "none",
    color: "white",
    padding: "10px 20px",
    margin: "5px",
    cursor: "pointer",
    borderRadius: "5px",
  },
  closeButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#ff4f4f",
    border: "none",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Quiz;
