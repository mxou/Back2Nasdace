import { useRef, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Gltf, Environment, KeyboardControls } from "@react-three/drei";
import Controller from "ecctrl";
import { useNavigate } from "react-router-dom";
import Amogus from "../components3D/Amogus.jsx";
import Ship from "../components3D/Ship.jsx";
import Popup from "./Popup.jsx";
import ClearStorageButton from "./ClearStorageButton.jsx";
import Crosshair from "./Crosshair.jsx";
import Nasdace from "../components3D/Nasdace.jsx";
import Quiz from "./Quiz.jsx";
import NewScene from "../components3D/NewScene.jsx";

export default function GameScene({ playerData }) {
  const playerRef = useRef();
  const [showPopup, setShowPopup] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false); // Afficher ou non le quiz
  const [quizResult, setQuizResult] = useState(null); // Résultat du quiz
  const [sceneChanged, setSceneChanged] = useState(false); // Suivi de l'état de la scène
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
    setShowQuiz(true); // Afficher le quiz
  };

  const handleQuizAnswer = (result) => {
    setQuizResult(result); // Log du résultat
    if (result === "Réussi") {
      // Si l'utilisateur a réussi, on change de scène
      // setSceneChanged(true);
      navigate("/Takeoff");
    }
    setShowQuiz(false); // Fermer le quiz après la réponse
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
          <Ship position={[10, 1, -8]} scale={6} colors={playerData} />
        </Physics>
      </Canvas>
      <ClearStorageButton />
      <Crosshair />
      {showPopup && <Popup message={`Bienvenue ${playerData.name} dans Back2NasdaceCity !`} />}
      {showQuiz && <Quiz onAnswer={handleQuizAnswer} onClose={() => setShowQuiz(false)} />}
      {quizResult && (
        <div style={styles.quizResult}>
          <p>{quizResult}</p>
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: "20px",
    borderRadius: "8px",
    color: "white",
    fontSize: "20px",
    fontFamily: "Arial, sans-serif",
    zIndex: 20,
  },
};
