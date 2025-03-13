import React, { useRef } from "react";
import { RigidBody } from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";

export default function Nasdace({ position = [0, 0, 0], scale = [4, 4, 4], rotation = [0, 180, 0] }) {
  const { scene } = useGLTF("./src/assets/modeles/Nasdace.glb");
  const bodyRef = useRef();

  const toRadians = (degrees) => (degrees * Math.PI) / 180; // Fonction pour convertir en radian
  const radianRotation = rotation.map(toRadians); // Convertit chaque axe en radian

  return (
    <RigidBody ref={bodyRef} colliders="hull" type="fixed" restitution={0.5} friction={1}>
      <primitive object={scene} position={position} scale={scale} rotation={radianRotation} />
    </RigidBody>
  );
}
