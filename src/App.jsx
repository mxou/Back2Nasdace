import { useState } from "react";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Gltf, Environment, Fisheye, KeyboardControls } from "@react-three/drei";
import Controller from "ecctrl";
import Tree from "./components3D/Tree.jsx";
import Rocket from "./components3D/Rocket.jsx";
import Ship from "./components3D/Ship.jsx";

function App() {
  const keyboardMap = [
    { name: "forward", keys: ["ArrowUp", "KeyW"] },
    { name: "backward", keys: ["ArrowDown", "KeyS"] },
    { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
    { name: "rightward", keys: ["ArrowRight", "KeyD"] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["Shift"] },
  ];

  return (
    <Canvas shadows onPointerDown={(e) => e.target.requestPointerLock()}>
      <Environment files="src/assets/modeles/night.hdr" ground={{ scale: 100 }} />
      <directionalLight intensity={0.9} castShadow shadow-bias={-0.0004} position={[-20, 20, 20]}>
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
      </directionalLight>
      <ambientLight intensity={0.2} />
      <Physics timeStep="vary">
        <KeyboardControls map={keyboardMap}>
          <Controller maxVelLimit={5}>
            <Gltf castShadow receiveShadow scale={0.315} position={[0, -0.55, 0]} src="src/assets/modeles/ghost_w_tophat-transformed.glb" />
          </Controller>
        </KeyboardControls>
        <RigidBody type="fixed" colliders="trimesh">
          <Gltf castShadow receiveShadow scale={3} src="src/assets/modeles/jardin.gltf" />

          {/* <Tree castShadow receiveShadow position={[1, 1, 1]} /> */}
        </RigidBody>
        <Ship position={[19, 0.6, 2]} scale={[0.6, 0.6, 0.6]} />
      </Physics>
    </Canvas>
  );
}

export default App;
