import Chrono from "./Chrono"; // Import du composant Chrono

const ATH = ({ showChrono = true, fuel = 100 }) => {
  return (
    <div style={styles.athContainer}>
      {/* Afficher le chrono seulement si showChrono est true */}
      {showChrono && <Chrono initialTime={60} />}

      {/* Barre de carburant */}
      <div style={styles.fuelContainer}>
        <div style={{ ...styles.fuelBar, width: `${fuel}%` }} />
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
    // background: "rgba(0, 0, 0, 0.7)",
    color: "white",
    textAlign: "left",
    fontFamily: "Arial, sans-serif",
    userSelect: "none",
    zIndex: 1000,
  },
  fuelContainer: {
    height: "15px",
    background: "#444",
    borderRadius: "5px",
    overflow: "hidden",
    margin: "0 auto 5px auto",
  },
  fuelBar: {
    height: "100%",
    background: "limegreen",
    transition: "width 0.5s linear",
  },
};

export default ATH;
