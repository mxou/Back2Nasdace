import { useState } from "react";
import NewScene from "../components3D/NewScene";

export default function ControlPannel({ takeoff }) {
  const [fuelPercentage, setFuelPercentage] = useState(0); // État de la jauge de carburant
  const [propulseurState1, setPropulseurState1] = useState(false);
  const [propulseurState2, setPropulseurState2] = useState(false);
  const [propulseurState3, setPropulseurState3] = useState(false);
  const [propulseurState4, setPropulseurState4] = useState(false);
  //   const [takeoff, setTakeoff] = useState(false);

  const handleFuelInjection = () => {
    let start = 0;
    const duration = 4000; // Durée de l'animation (en ms)

    // Fonction pour animer le remplissage de la jauge
    const animateFuel = () => {
      if (start < 100) {
        start += 100 / (duration / 100); // Incrémente de manière linéaire
        setFuelPercentage(start);
        requestAnimationFrame(animateFuel); // Continue l'animation
      } else {
        setFuelPercentage(100); // Assure que la jauge est à 100% à la fin
      }
    };

    animateFuel(); // Lance l'animation
  };

  const handleTakeoff = () => {
    // Vérifier si fuelPercentage est à 100 et si tous les propulseurs sont activés
    if (fuelPercentage === 100 && propulseurState1 && propulseurState2 && propulseurState3 && propulseurState4) {
      takeoff(); // Appelle la fonction takeoff passée en prop
    } else {
      console.log("Il manque quelque chose pour le décollage.");
    }
  };

  return (
    <div style={styles.control_pannel}>
      <div style={styles.fuel_container}>
        <button onClick={handleFuelInjection}>Injecter le Plutonium</button>
        <div
          style={{
            ...styles.fuel_jauge,
            width: `${fuelPercentage}%`, // Dynamise la largeur en fonction du pourcentage
          }}
        ></div>
      </div>
      <div style={styles.propulseurs_container}>
        <div style={styles.propulseurs_buttons_container}>
          <div style={propulseurState1 ? styles.propulseurs_light_on : styles.propulseurs_light_off}></div>
          <button onClick={() => setPropulseurState1(!propulseurState1)}></button>
        </div>
        <div style={styles.propulseurs_buttons_container}>
          <div style={propulseurState2 ? styles.propulseurs_light_on : styles.propulseurs_light_off}></div>
          <button onClick={() => setPropulseurState2(!propulseurState2)}></button>
        </div>
        <div style={styles.propulseurs_buttons_container}>
          <div style={propulseurState3 ? styles.propulseurs_light_on : styles.propulseurs_light_off}></div>
          <button onClick={() => setPropulseurState3(!propulseurState3)}></button>
        </div>
        <div style={styles.propulseurs_buttons_container}>
          <div style={propulseurState4 ? styles.propulseurs_light_on : styles.propulseurs_light_off}></div>
          <button onClick={() => setPropulseurState4(!propulseurState4)}></button>
        </div>
      </div>
      <div style={styles.start_button_container}>
        <button style={styles.start_button} onClick={handleTakeoff}></button>
      </div>
    </div>
  );
}

const styles = {
  control_pannel: {
    width: "1200px",
    height: "300px",
    backgroundColor: "rgb(80, 80, 80)",
    position: "absolute",
    zIndex: 20,
    bottom: "0%",
    left: "5%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  fuel_container: {
    border: "2px solid red",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
  },
  fuel_jauge: {
    width: "0%", // Initialement vide
    height: "30px", // Hauteur de la jauge
    backgroundColor: "green", // Couleur de la jauge
    transition: "width 0.1s ease", // Ajout d'une transition pour lisser le changement
    border: "2px solid black",
  },
  propulseurs_container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "30%",
    border: "2px solid blue",
  },
  propulseurs_buttons_container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row-reverse",
    width: "50%",
  },
  propulseurs_light_off: {
    backgroundColor: "red",
    width: "10px",
    height: "10px",
    borderRadius: "50px",
  },
  propulseurs_light_on: {
    backgroundColor: "green",
    width: "10px",
    height: "10px",
    borderRadius: "50px",
  },
  start_button_container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid purple",
    width: "100%",
  },
  start_button: {
    backgroundColor: "red",
    width: "200px",
    height: "200px",
    borderRadius: "100px",
  },
};
