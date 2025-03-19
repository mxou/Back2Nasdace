import React from "react";

export default function ClearStorageButton() {
  const handleClearStorage = () => {
    localStorage.clear();
    window.location.reload(); // Recharge la page pour afficher le formulaire
  };

  return (
    <button onClick={handleClearStorage} style={styles.button}>
      Réinitialiser le jeu
    </button>
  );
}

const styles = {
  button: {
    position: "fixed",
    top: "20px",
    right: "20px",
    backgroundColor: "red",
    color: "white",
    border: "none",
    padding: "10px 15px",
    fontSize: "14px",
    cursor: "pointer",
    borderRadius: "5px",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.2)",
  },
};
