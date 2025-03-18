import { useState } from "react";
import NewScene from "../components3D/NewScene";
import "./styles/ControlPannel.css";

export default function ControlPannel({ takeoff }) {
  const [fuelPercentage, setFuelPercentage] = useState(0);
  const [propulseurState1, setPropulseurState1] = useState(false);
  const [propulseurState2, setPropulseurState2] = useState(false);
  const [propulseurState3, setPropulseurState3] = useState(false);
  const [propulseurState4, setPropulseurState4] = useState(false);

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

    animateFuel();
  };

  const handleTakeoff = () => {
    if (fuelPercentage === 100 && propulseurState1 && propulseurState2 && propulseurState3 && propulseurState4) {
      takeoff(); // Appelle la fonction takeoff passée en prop
    } else {
      console.log("Il manque quelque chose pour le décollage.");
    }
  };

  return (
    <div className="control-panel">
      <div className="panel-section fuel-container">
        <h3 className="section-title">RÉSERVOIR DE CARBURANT</h3>
        <div className="fuel-gauge-container">
          <div className="fuel-gauge-background">
            <div className="fuel-gauge-fill" style={{ width: `${fuelPercentage}%` }}>
              <div className="fuel-gauge-glow"></div>
            </div>
          </div>
          <div className="fuel-percentage">{fuelPercentage}%</div>
        </div>
        <button className="fuel-injection-button" onClick={handleFuelInjection}>
          <span className="button-icon">⚛️</span>
          <span className="button-text">INJECTER LE PLUTONIUM</span>
        </button>
      </div>

      <div className="panel-section propulseurs-container">
        <h3 className="section-title">PROPULSEURS</h3>
        <div className="propulseurs-grid">
          <div className="propulseur-unit">
            <div className={`propulseur-light ${propulseurState1 ? "active" : ""}`}>
              <div className="light-glow"></div>
            </div>
            <button className={`propulseur-button ${propulseurState1 ? "active" : ""}`} onClick={() => setPropulseurState1(!propulseurState1)}>
              P1
            </button>
            <div className="propulseur-label">PRINCIPAL</div>
          </div>

          <div className="propulseur-unit">
            <div className={`propulseur-light ${propulseurState2 ? "active" : ""}`}>
              <div className="light-glow"></div>
            </div>
            <button className={`propulseur-button ${propulseurState2 ? "active" : ""}`} onClick={() => setPropulseurState2(!propulseurState2)}>
              P2
            </button>
            <div className="propulseur-label">SECONDAIRE</div>
          </div>

          <div className="propulseur-unit">
            <div className={`propulseur-light ${propulseurState3 ? "active" : ""}`}>
              <div className="light-glow"></div>
            </div>
            <button className={`propulseur-button ${propulseurState3 ? "active" : ""}`} onClick={() => setPropulseurState3(!propulseurState3)}>
              P3
            </button>
            <div className="propulseur-label">AUXILIAIRE</div>
          </div>

          <div className="propulseur-unit">
            <div className={`propulseur-light ${propulseurState4 ? "active" : ""}`}>
              <div className="light-glow"></div>
            </div>
            <button className={`propulseur-button ${propulseurState4 ? "active" : ""}`} onClick={() => setPropulseurState4(!propulseurState4)}>
              P4
            </button>
            <div className="propulseur-label">STABILISATEUR</div>
          </div>
        </div>
      </div>

      <div className="panel-section launch-container">
        <h3 className="section-title">DÉCOLLAGE</h3>
        <button className="launch-button" onClick={handleTakeoff}>
          <div className="launch-button-inner">
            <div className="launch-button-text">LANCER</div>
          </div>
        </button>
        <div className="launch-warning">ATTENTION: VÉRIFIER TOUS LES SYSTÈMES</div>
      </div>

      <div className="panel-decorations">
        <div className="panel-lights">
          <div className="panel-light"></div>
          <div className="panel-light"></div>
          <div className="panel-light"></div>
        </div>
        <div className="panel-brand">COSMOS-X</div>
      </div>
    </div>
  );
}
