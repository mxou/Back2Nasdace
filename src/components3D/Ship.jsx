import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import * as THREE from "three";

export default function Ship({ position, scale = [5, 5, 5] }) {
  const { scene } = useGLTF("./src/assets/modeles/ship.glb");
  const shipRef = useRef();
  const [isFlying, setIsFlying] = useState(false);

  useFrame(() => {
    if (isFlying && shipRef.current) {
      shipRef.current.position.y += 0.05; // Monte doucement
      shipRef.current.rotation.y += 0.01; // Tourne légèrement
    }
  });

  return (
    <RigidBody colliders="hull" gravityScale={1} restitution={0.5} type="dynamic" mass={5} friction={1}>
      <primitive object={scene} position={position} scale={scale} ref={shipRef} onClick={() => setIsFlying(!isFlying)} />;
    </RigidBody>
  );
}
