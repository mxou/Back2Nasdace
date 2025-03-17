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
      <span>⛽ Carburant : {fuel}%</span>
    </div>
  );
};

const styles = {
  athContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    padding: "10px",
    background: "rgba(0, 0, 0, 0.7)",
    color: "white",
    borderBottom: "2px solid #fff",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
  },
  fuelContainer: {
    width: "80%",
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
