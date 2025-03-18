import React, { useState } from "react";
import "./styles/Quiz.css";

const Quiz = ({ onAnswer, onClose }) => {
  // Question du quiz et ses options
  const question =
    "Pour entrer dans le vaisseau, tu devras répondre a une question. Combien de temps faut il en moyenne pour faire le trajet Terre - Mars dans de bonne conditions ?";
  const options = ["2-5 mois", "6-9 mois", "2 heures si on prend l'autoroute A6", "1 an et 6 mois"];
  //
  const correctAnswer = "6-9 mois";

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
    <div className="quiz-container">
      <div className="quiz-content">
        <h2 className="quiz-question">{question}</h2>
        <div className="quiz-options-grid">
          {options.map((option, index) => (
            <button key={index} onClick={() => handleAnswer(option)} className={`quiz-option ${selectedAnswer === option ? "selected" : ""}`}>
              {option}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="quiz-close-button">
          Fermer
        </button>
      </div>
    </div>
  );
};

export default Quiz;
