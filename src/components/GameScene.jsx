// MODULES
import { useRef, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Gltf, Environment, KeyboardControls } from "@react-three/drei";
import Controller from "ecctrl";
import { useNavigate } from "react-router-dom";
// MODULES

// COMPONENTS
import Amogus from "../components3D/Amogus.jsx";
import Ship from "../components3D/Ship.jsx";
import Popup from "./Popup.jsx";
import ClearStorageButton from "./ClearStorageButton.jsx";
import Crosshair from "./Crosshair.jsx";
import Nasdace from "../components3D/Nasdace.jsx";
import Quiz from "./Quiz.jsx";
import NewScene from "../components3D/NewScene.jsx";
import MusicPlayer from "./MusicPlayer.jsx";
// COMPONENTS

export default function GameScene({ playerData }) {
  const playerRef = useRef();
  const [showPopup, setShowPopup] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [sceneChanged, setSceneChanged] = useState(false);
  const navigate = useNavigate();

  const keyboardMap = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
    { name: "rightward", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["Shift"] },
  ];

  const handleQuizStart = () => {
    setShowQuiz(true);
  };

  const handleQuizAnswer = (result) => {
    setQuizResult(result);
    const timerQuizAnswer = setTimeout(() => setQuizResult(null), 3000);
    if (result === "Réussi") {
      navigate("/Takeoff");
    }
    setShowQuiz(false); // Fermer le quiz après la réponse
    return () => clearTimeout(timerQuizAnswer);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (sceneChanged) {
    return <NewScene playerData={playerData} />;
  }

  return (
    <>
      <MusicPlayer path="/audio/konoha.mp3" />
      <Canvas shadows onPointerDown={(e) => e.target.requestPointerLock()}>
        <Environment files="src/assets/modeles/night.hdr" ground={{ scale: 100 }} />
        <directionalLight intensity={0.9} castShadow position={[-20, 20, 20]} />
        <ambientLight intensity={0.2} />
        <Physics timeStep="vary">
          <KeyboardControls map={keyboardMap}>
            <Controller ref={playerRef} maxVelLimit={5}>
              <Gltf castShadow receiveShadow scale={0.315} position={[0, -0.55, 0]} src="src/assets/modeles/ghost_w_tophat-transformed.glb" />
            </Controller>
          </KeyboardControls>
          <RigidBody type="fixed" colliders="trimesh">
            <Gltf position={[10, 0, 5]} castShadow receiveShadow scale={125} src="src/assets/modeles/Island.glb" />
            <Amogus position={[1, -2.48, -14]} scale={[0.8, 0.8, 0.8]} playerRef={playerRef} onQuizStart={handleQuizStart} />
            <Nasdace position={[4, -4, 4]} scale={1} rotation={[0, 180, 0]} playerData={playerData} />
          </RigidBody>
          <Ship position={[10, -1.8, -8]} scale={6} colors={playerData} />
        </Physics>
      </Canvas>
      <ClearStorageButton />
      <Crosshair />
      {showPopup && <Popup message={`Bienvenue ${playerData.name} dans Back2NasdaceCity !`} />}
      {showQuiz && <Quiz onAnswer={handleQuizAnswer} onClose={() => setShowQuiz(false)} />}
      {quizResult && (
        <div style={styles.quizResult}>
          <p style={styles.resultText}>{quizResult}</p>
          {quizResult === "Perdu" && (
            <p style={styles.hintText}>C'est pourtant logique, ça prends pas se temps la utilisant une orbite de transfert de Hohmann... redflag</p>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  quizResult: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "linear-gradient(135deg, rgba(15, 25, 65, 0.9) 0%, rgba(30, 40, 90, 0.9) 100%)",
    padding: "25px 30px",
    borderRadius: "15px",
    color: "#e6f7ff",
    fontSize: "22px",
    fontFamily: "'Rajdhani', 'Orbitron', sans-serif",
    zIndex: 20,
    border: "2px solid rgba(100, 180, 255, 0.6)",
    boxShadow: "0 0 30px rgba(80, 160, 255, 0.4), inset 0 0 15px rgba(80, 160, 255, 0.2)",
    textAlign: "center",
    minWidth: "300px",
  },
  resultText: {
    margin: "0 0 15px 0",
    fontWeight: "bold",
    fontSize: "28px",
    textShadow: "0 0 10px rgba(100, 180, 255, 0.7)",
    color: "rgb(252, 58, 58)",
  },
  hintText: {
    margin: "10px 0 0 0",
    fontSize: "16px",
    fontStyle: "italic",
    opacity: "0.9",
  },
};
