import React from "react";
import { useNavigate } from "react-router-dom";

const GameOver = ({ resetFuel }) => {
  const navigate = useNavigate();

  const handleRestart = () => {
    resetFuel(); // Remet le fuel à 100
    navigate("/"); // Retour à l'accueil
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white text-center">
      <h1 className="text-5xl font-bold text-red-500 mb-6">Game Over</h1>
      <p className="text-xl mb-4">Vous avez épuisé tout votre carburant !</p>
      <button
        onClick={handleRestart}
        className="bg-purple-600 hover:bg-purple-800 text-white px-6 py-3 rounded-lg text-lg font-semibold transition"
      >
        Rejouer
      </button>
    </div>
  );
};

export default GameOver;
