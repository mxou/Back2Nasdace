import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { Model } from "../components/Model";

export default function Ship({ position = [0, 1, 0], scale = [5, 5, 5] }) {
  const shipRef = useRef();
  const [isFlying, setIsFlying] = useState(false);

  useFrame(() => {
    if (isFlying && shipRef.current) {
      shipRef.current.position.y += 0.05; // Monte doucement
      shipRef.current.rotation.y += 0.01; // Tourne légèrement
    }
  });

  return (
    <RigidBody ref={shipRef} colliders="hull" gravityScale={1} restitution={0.5} type="dynamic" mass={5} friction={1} onClick={() => setIsFlying(!isFlying)}>
      <Model scale={scale} />
    </RigidBody>
  );
}
