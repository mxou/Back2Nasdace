import { useState, useRef, useEffect } from "react";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Gltf, Environment, KeyboardControls, useProgress } from "@react-three/drei";
import Controller from "ecctrl";
import Amogus from "./components3D/Amogus.jsx";
import Ship from "./components3D/Ship.jsx";
import Popup from "./components/Popup.jsx";
import Loader from "./components/Loader.jsx";

function App() {
  const [showForm, setShowForm] = useState(false);
  const playerRef = useRef(); // Référence au joueur
  const [loading, setLoading] = useState(true);
  const { active } = useProgress();
  const [showPopup, setShowPopup] = useState(false);

  const keyboardMap = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
    { name: "rightward", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["Shift"] },
  ];

  useEffect(() => {
    if (!active) {
      const timer = setTimeout(() => setShowPopup(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  return (
    <>
      {active && <Loader />}
      {!loading && (
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
              <Gltf castShadow receiveShadow scale={23} src="src/assets/modeles/Nature.glb" />
              <Amogus position={[10, -1.2, 11]} scale={[0.8, 0.8, 0.8]} playerRef={playerRef} setShowForm={setShowForm} />
            </RigidBody>
            <Ship position={[15, 1, 17]} scale={[0.5, 0.5, 0.5]} />
          </Physics>
        </Canvas>
      )}
      {showPopup && <Popup message="Bienvenu(e) dans Back2NasdaceCity, pour commencer, allez voir sussy strong amogus" />}
      {showForm && <PopupForm setShowForm={setShowForm} />}
    </>
  );
}

// Formulaire de popup
function PopupForm({ setShowForm }) {
  return (
    <div style={styles.popup}>
      <p>Entrez votre nom :</p>
      <input type="text" placeholder="Nom..." />
      <button onClick={() => setShowForm(false)}>Valider</button>
    </div>
  );
}

// Styles pour la popup
const styles = {
  popup: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
  },
};

export default App;
