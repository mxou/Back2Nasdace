// App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import PlayerForm from "./components/PlayerForm";
import GameScene from "./components/GameScene";
import Loader from "./components/Loader";
import MiddleScene from "./pages/MiddleScene";
import GameOver from "./pages/GameOver";
import EndingScene from "./scenes/EndingScene";
import ExplosionScene from "./scenes/ExplosionScene";
import SpaceCollisionScene from "./scenes/SpaceCollisionScene";
import RythmGame from "./scenes/RythmGameScene";
import RythmGameScene from "./scenes/RythmGameScene";
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
  };

  if (loading) return <Loader />;
  return (
    <Router>
      <Routes>
        {/* Route vers le formulaire de joueur */}
        <Route path="/" element={playerData ? <GameScene playerData={playerData} /> : <PlayerForm onSubmit={handlePlayerSubmit} />} />

        {/* Exemple de route vers Takeoff */}
        <Route path="/Takeoff" element={<Takeoff playerData={playerData} />} />

        {/* Votre route de développement */}
        <Route path="/dev/ending-scene" element={<EndingScene playerData={playerData} />} />
        <Route path="/dev/MiddleScene" element={<MiddleScene playerData={playerData} />} />
        <Route path="/GameOver" element={<GameOver playerData={playerData} />} />

        <Route path="/dev/explosion-scene" element={<ExplosionScene playerData={playerData} />} />

        <Route path="/dev/rythm-game" element={<RythmGameScene playerData={playerData} />} />
        <Route path="/dev/test" element={<SpaceCollisionScene />} />

        {/* Redirection si route inconnue */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
