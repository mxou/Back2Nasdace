import { useState, useEffect } from "react";
import "./App.css";
import PlayerForm from "./components/PlayerForm";
import GameScene from "./components/GameScene";
import Loader from "./components/Loader";

function App() {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedPlayer = localStorage.getItem("playerData");
    if (storedPlayer) {
      setPlayerData(JSON.parse(storedPlayer));
    }
    setLoading(false);
  }, []);

  const handlePlayerSubmit = (data) => {
    localStorage.setItem("playerData", JSON.stringify(data));
    setPlayerData(data);
  };

  if (loading) return <Loader />;

  return <>{playerData ? <GameScene playerData={playerData} /> : <PlayerForm onSubmit={handlePlayerSubmit} />}</>;
}

export default App;
