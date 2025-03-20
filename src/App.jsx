import { useState, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useOutletContext,
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
import ATH from "./components/ATH";

function Root({ fuel, setFuel }) {
  return (
    <>
      <ATH fuel={fuel} showChrono={false} />
      <main>
        <Outlet context={{ fuel, setFuel }} />
      </main>
    </>
  );
}

function App() {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fuel, setFuel] = useState(100);

  useEffect(() => {
    const storedPlayer = localStorage.getItem("playerData");

    if (storedPlayer) {
      setPlayerData(JSON.parse(storedPlayer));
      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, []);

  const handlePlayerSubmit = (data, colors) => {
    const completePlayerData = { ...data, ...colors };
    localStorage.setItem("playerData", JSON.stringify(completePlayerData));
    setPlayerData(completePlayerData);
  };

  if (loading) return <Loader />;

  const router = createBrowserRouter([
    {
      path: "/",
      element: playerData ? (
        <GameScene playerData={playerData} />
      ) : (
        <PlayerForm onSubmit={handlePlayerSubmit} />
      ),
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
    {
      element: <Root fuel={fuel} setFuel={setFuel} />, // Passer fuel et setFuel en props
      children: [
        { path: "/takeoff", element: <Takeoff playerData={playerData} /> },
        { path: "/ending", element: <EndingScene playerData={playerData} /> },
        { path: "/interior", element: <MiddleScene playerData={playerData} /> },
        { path: "/game-over", element: <GameOver playerData={playerData} /> },
        {
          path: "/explosion",
          element: <ExplosionScene playerData={playerData} />,
        },
        {
          path: "/rythm-game",
          element: <RythmGameScene playerData={playerData} />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
