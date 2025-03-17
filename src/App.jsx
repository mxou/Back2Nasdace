import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import PlayerForm from "./components/PlayerForm";
import GameScene from "./components/GameScene";
import Loader from "./components/Loader";
import YourDevPage from "./pages/EndingScene"; // Votre page de développement
import EndingScene from "./pages/EndingScene";

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

  // Composant principal
  const MainGame = () =>
    playerData ? (
      <GameScene playerData={playerData} />
    ) : (
      <PlayerForm onSubmit={handlePlayerSubmit} />
    );

  return (
    <BrowserRouter>
      <Routes>
        {/* Route principale du jeu */}
        <Route path="/" element={<MainGame />} />

        {/* Votre route de développement */}
        <Route
          path="/dev/your-part"
          element={<EndingScene playerData={playerData} />}
        />

        {/* Redirection si route inconnue */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
