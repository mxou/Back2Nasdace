import React from "react";
import { useGLTF } from "@react-three/drei";

export default function NasdaceCity(props) {
  const { scene } = useGLTF("/src/assets/modeles/NasdaceCity.glb");

  return <primitive object={scene} {...props} />;
}
