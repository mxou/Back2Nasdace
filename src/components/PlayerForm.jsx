import React, { useState } from "react";

export default function PlayerForm({ onSubmit }) {
  const [player, setPlayer] = useState({ name: "", age: "", taille: "" });
  const [colorsShip, setColorsShip] = useState({
    colorShip: "",
    colorLight: "",
    colorGlass: "",
  });

  const handleChange = (e) => {
    setPlayer({ ...player, [e.target.name]: e.target.value });
    setColorsShip({ ...colorsShip, [e.target.name]: e.target.value });
    // Récupère l'état actuel de player (...player), target les inputs avec les propriétés names (genre name="age", name="name") et replace avec les nouvelles values
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (player.name && player.age && player.taille) {
      onSubmit(player, colorsShip);
    } else {
      alert("Veuillez remplir tous les champs !");
    }
  };

  return (
    <div style={styles.formContainer}>
      <div style={styles.formContent}>
        <h2 style={styles.title}>Bienvenue dans Back2NasdaceCity</h2>
        <p style={styles.subtitle}>
          Avant de commencer, entrez vos informations :
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              name="name"
              placeholder="Nom du voyageur"
              value={player.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="number"
              name="age"
              placeholder="Âge terrestre"
              value={player.age}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="text"
              name="taille"
              placeholder="Taille (en unités terrestres)"
              value={player.taille}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroupColors}>
            <div>
              <label htmlFor="colorShip">Couleur du vaisseau</label>
              <input
                type="color"
                name="colorShip"
                value={colorsShip.colorShip}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div>
              <label htmlFor="colorLight">Couleur des lights</label>
              <input
                type="color"
                name="colorLight"
                value={colorsShip.colorLight}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div>
              <label htmlFor="colorGlass">Couleur du verre</label>
              <input
                type="color"
                name="colorGlass"
                placeholder=""
                value={colorsShip.colorGlass}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" style={styles.button}>
            <span>Lancer le voyage</span>
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  formContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #000428 0%, #004e92 100%)",
    fontFamily: "'Quantico', 'Arial', sans-serif",
    overflow: "hidden",
    zIndex: 1000,
  },

  formContent: {
    background: "rgba(13, 20, 40, 0.8)",
    borderRadius: "15px",
    padding: "40px",
    width: "90%",
    maxWidth: "480px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(64, 194, 255, 0.3)",
    boxShadow:
      "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(64, 194, 255, 0.4), inset 0 0 15px rgba(64, 194, 255, 0.2)",
    position: "relative",
    // animation: "pulse 4s ease-in-out infinite",
    transform: "translateY(0px)",
    transition: "transform 0.3s ease",
  },

  title: {
    fontFamily: "'Quantico', sans-serif",
    fontSize: "1.8rem",
    marginBottom: "20px",
    textAlign: "center",
    color: "#fff",
    textShadow: "0 0 10px #0ff, 0 0 20px #0ff",
    letterSpacing: "2px",
  },

  subtitle: {
    color: "#b8e0ff",
    marginBottom: "30px",
    textAlign: "center",
    fontFamily: "'Quantico', sans-serif",
    fontSize: "0.9rem",
    letterSpacing: "1px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  inputGroup: {
    position: "relative",
    width: "100%",
    marginBottom: "10px",
  },
  inputGroupColors: {
    position: "relative",
    width: "100%",
    marginBottom: "10px",
    display: "flex",
    flexDirection: "row",
  },

  input: {
    width: "90%",
    padding: "15px",
    background: "rgba(9, 14, 34, 0.6)",
    border: "1px solid rgba(64, 194, 255, 0.2)",
    borderRadius: "8px",
    color: "#e0f7ff",
    fontFamily: "'Quantico', sans-serif",
    fontSize: "0.9rem",
    boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.5)",
    transition: "all 0.3s ease",
    outline: "none",
    "&:focus": {
      borderColor: "#0ff",
      boxShadow:
        "0 0 10px rgba(64, 194, 255, 0.5), inset 0 2px 10px rgba(0, 0, 0, 0.5)",
    },
    "&::placeholder": {
      color: "rgba(135, 206, 250, 0.5)",
    },
  },

  button: {
    position: "relative",
    padding: "15px 30px",
    background: "linear-gradient(135deg, #0575E6 0%, #021B79 100%)",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontFamily: "'Quantico', sans-serif",
    fontWeight: "bold",
    letterSpacing: "1px",
    textTransform: "uppercase",
    cursor: "pointer",
    overflow: "hidden",
    marginTop: "15px",
    transition: "all 0.3s ease",
    boxShadow: "0 5px 15px rgba(5, 117, 230, 0.4)",
    "&:hover": {
      boxShadow: "0 0 15px #0ff, 0 0 20px #0ff, 0 0 30px #0ff",
      transform: "translateY(-2px)",
    },
  },
};
