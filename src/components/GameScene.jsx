import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Gltf, Environment, KeyboardControls } from "@react-three/drei";
import Controller from "ecctrl";
import Amogus from "../components3D/Amogus.jsx";
import Ship from "../components3D/Ship.jsx";
import Popup from "./Popup.jsx";
import ClearStorageButton from "./ClearStorageButton.jsx";
import Crosshair from "./Crosshair.jsx";

export default function GameScene({ playerData }) {
  const playerRef = useRef();
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
    const timer = setTimeout(() => setShowPopup(true), 1000);
    return () => clearTimeout(timer);
  }, []);

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
            <Gltf castShadow receiveShadow scale={23} src="src/assets/modeles/Nature.glb" />
            <Amogus position={[10, -1.2, 11]} scale={[0.8, 0.8, 0.8]} playerRef={playerRef} />
          </RigidBody>
          <Ship position={[0, 1, 0]} />
        </Physics>
      </Canvas>
      <ClearStorageButton />
      <Crosshair />
      {showPopup && <Popup message={`Bienvenue ${playerData.name} dans Back2NasdaceCity !`} />}
    </>
  );
}
