import React from "react";
import { Canvas } from "@react-three/fiber";
import Explosion from "../components3D/Explosion";

export default function ExplosionScene() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <Explosion position={[0, 0, 0]} duration={3} />
    </Canvas>
  );
}
