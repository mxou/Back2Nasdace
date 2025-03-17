import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { Model } from "../components/Model";

export default function Ship({
  position = [0, 0, 0],
  scale = [4, 4, 4],
  colors,
  gravity = 1,
}) {
  const shipRef = useRef();
  const [isFlying, setIsFlying] = useState(false);

  // États pour les couleurs
  const [colorShip, setColorShip] = useState("#ff0000");
  const [colorLight, setColorLight] = useState("#00ff00");
  const [colorGlass, setColorGlass] = useState("#0000ff");
  const [colorBoost, setColorBoost] = useState("#ffff00");

  return (
    <RigidBody
      ref={shipRef}
      colliders="hull"
      gravityScale={gravity}
      restitution={0.5}
      type="dynamic"
      mass={5}
      friction={1}
      onClick={() => setIsFlying(!isFlying)}
    >
      <Model
        position={position}
        scale={scale}
        colorShip={colors.colorShip}
        colorLight={colors.colorLight}
        colorGlass={colors.colorGlass}
      />
    </RigidBody>
  );
}
