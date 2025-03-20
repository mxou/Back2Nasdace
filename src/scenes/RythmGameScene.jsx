import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Stars, OrbitControls } from "@react-three/drei";
import ShipSus from "../components3D/ShipSus";
import ATH from "../components/ATH";
import Dialogues from "../components/Dialogues/Dialogues";
import dialogIa from "/src/assets/dialogues/ia-folle";
import { useNavigate } from "react-router-dom";
import hitSoundFile from "/src/assets/audio/hit.wav";
import RhythmGame from "../components/RythmGame/RythmGame";
import missSoundFile from "/src/assets/audio/miss.wav";
import GameFailed from "/src/assets/dialogues/dialogIaFailed";
import GameSuccess from "/src/assets/dialogues/dialogIaSuccess";
import altaleFile from "/src/assets/audio/altale.mp3";
import spaceTheme from "/src/assets/audio/Space.mp3";
import { useLocation } from "react-router-dom";

export default function RythmGameScene({ playerData }) {
  const [showDialog, setShowDialog] = useState(false);
  const [gameStart, setGameStart] = useState(false);
  const [playSpace, setPlaySpace] = useState(true);
  const [lastDialog, setLastDialog] = useState(false);
  const location = useLocation();
  const { fuel } = location.state || {};
  const [onGameFinished, setOnGameFinished] = useState({
    file: null,
    action: null,
  });

  const navigate = useNavigate();

  // Sons classiques (créés normalement)
  const hitSound = new Audio(hitSoundFile);
  const missSound = new Audio(missSoundFile);
  const altale = new Audio(altaleFile);

  hitSound.volume = 0.3;
  missSound.volume = 0.3;
  altale.volume = 0.1;

  // Référence pour space (musique de fond)
  const spaceRef = useRef(new Audio(spaceTheme));

  useEffect(() => {
    spaceRef.current.volume = 0.1;
    spaceRef.current.loop = true; // Pour qu'elle tourne en boucle

    const playMusic = async () => {
      try {
        spaceRef.current.currentTime = 0;
        await spaceRef.current.play();
      } catch (err) {
        console.warn("Lecture automatique bloquée, en attente d'un clic.");
      }
    };

    if (playSpace) {
      playMusic();
    } else {
      spaceRef.current.pause();
    }
  }, [playSpace]);

  // Fonction qui autorise la lecture de `space` après une interaction utilisateur
  const enableAudio = () => {
    spaceRef.current.play();
    document.removeEventListener("click", enableAudio);
  };

  useEffect(() => {
    document.addEventListener("click", enableAudio);
    return () => document.removeEventListener("click", enableAudio);
  }, []);

  const handlegameStart = () => {
    setPlaySpace(false);
    setGameStart(true);
  };

  const GameFinished = (gameStatus) => {
    setGameStart(false);
    setPlaySpace(true);
    if (gameStatus) {
      setOnGameFinished({
        file: GameSuccess,
        action: () => {
          navigate("/ending", { state: { fuel } });
          setPlaySpace(false);
        },
      });
    } else {
      setOnGameFinished({
        file: GameFailed,
        action: () => {
          navigate("/explosion ", { state: { fuel } });
          setPlaySpace(false);
        },
      });
    }
    setLastDialog(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDialog(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ATH showChrono={false} fuel={fuel} />
      {showDialog && (
        <Dialogues
          dialogFile={dialogIa}
          onComplete={handlegameStart}
          userName={playerData.name}
        />
      )}
      {lastDialog && (
        <Dialogues
          dialogFile={onGameFinished.file}
          onComplete={() => onGameFinished.action()}
          userName={playerData.name}
        />
      )}
      {gameStart && (
        <RhythmGame
          hasScored={false}
          setHasScored={() => {}}
          hitSound={hitSound}
          missSound={missSound}
          onComplete={GameFinished}
          music={altale}
        />
      )}
      <Canvas shadows camera={{ position: [10, 10, 20], fov: 45 }}>
        <Stars radius={100} depth={500} count={5000} factor={4} />
        <directionalLight intensity={1.5} castShadow position={[5, 10, 5]} />
        <ambientLight intensity={0.4} />
        <Physics>
          <ShipSus
            position={[0, 0, 0]}
            scale={6}
            colors={playerData}
            idleSpace
            gravity={0}
          />
        </Physics>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
