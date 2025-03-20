import Chrono from "./Chrono"; // Import du composant Chrono

const ATH = ({ showChrono = true, fuel = 100 }) => {
  return (
    <div style={styles.athContainer}>
      {/* Afficher le chrono seulement si showChrono est true */}
      {showChrono && <Chrono initialTime={60} />}

      {/* Barre de carburant */}
      <div style={styles.fuelContainer}>
        <div
          style={{
            ...styles.fuelBar,
            width: `${fuel}%`,
            background: `linear-gradient(90deg, #ff0000, #ffff00, #00ff00)`,
          }}
        />
      </div>

      <span>⛽ Plutonium 95 : {fuel}%</span>
    </div>
  );
};

const styles = {
  athContainer: {
    position: "fixed",
    top: "20px",
    left: "20px",
    width: "30vw",
    color: "white",
    textAlign: "left",
    fontFamily: "Arial, sans-serif",
    userSelect: "none",
  },
  fuelContainer: {
    height: "10px",
    background: "#222",
    borderRadius: "10px",
    overflow: "hidden",
    margin: "0 auto 5px auto",
    boxShadow: "inset 0px 0px 5px rgba(0,0,0,0.5)",
  },
  fuelBar: {
    height: "100%",
    transition: "width 0.5s ease-in-out",
    borderRadius: "10px",
  },
};

export default ATH;
