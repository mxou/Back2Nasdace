// App.jsx
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import PlayerForm from "/src/components/PlayerForm";
import GameScene from "/src/components/GameScene";
import Loader from "/src/components/Loader";
import MiddleScene from "/src/scenes/MiddleScene";
import GameOver from "/src/scenes/GameOver";
import EndingScene from "/src/scenes/EndingScene";
import ExplosionScene from "/src/scenes/ExplosionScene";
import RythmGameScene from "/src/scenes/RythmGameScene";
import Takeoff from "./Takeoff";

function App() {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedPlayer = localStorage.getItem("playerData");

    if (storedPlayer) {
      setPlayerData(JSON.parse(storedPlayer));
      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setLoading(false); // Pas de délai si aucun joueur n'est trouvé
    }
  }, []);

  const handlePlayerSubmit = (data, colors) => {
    // Fusionner les données du joueur et les couleurs pour maintenir la compatibilité
    const completePlayerData = {
      ...data,
      ...colors, // Inclure les couleurs dans playerData
    };

    localStorage.setItem("playerData", JSON.stringify(completePlayerData));
    setPlayerData(completePlayerData);
    console.log(playerData);
  };

  if (loading) return <Loader />;
  return (
    <Router>
      <Routes>
        {/* Route vers le formulaire de joueur */}
        <Route
          path="/"
          element={
            playerData ? (
              <GameScene playerData={playerData} />
            ) : (
              <PlayerForm onSubmit={handlePlayerSubmit} />
            )
          }
        />

        {/* Exemple de route vers Takeoff */}
        <Route path="/Takeoff" element={<Takeoff playerData={playerData} />} />

        {/* Votre route de développement */}
        <Route
          path="/ending"
          element={<EndingScene playerData={playerData} />}
        />
        <Route
          path="/interior"
          element={<MiddleScene playerData={playerData} />}
        />
        <Route
          path="/game-over"
          element={<GameOver playerData={playerData} />}
        />

        <Route
          path="/explosion"
          element={<ExplosionScene playerData={playerData} />}
        />

        <Route
          path="/rythm-game"
          element={<RythmGameScene playerData={playerData} />}
        />

        {/* Redirection si route inconnue */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
