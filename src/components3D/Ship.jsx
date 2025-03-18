import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { Model } from "../components/Model";

export default function Ship({ position = [0, 0, 0], scale = [4, 4, 4], colors, takeoff }) {
  const shipRef = useRef();
  const [yPos, setYPos] = useState(position[1]); // Suivi de la position Y

  // États pour les couleurs
  const [colorShip, setColorShip] = useState("#ff0000");
  const [colorLight, setColorLight] = useState("#00ff00");
  const [colorGlass, setColorGlass] = useState("#0000ff");
  const [colorBoost, setColorBoost] = useState("#ffff00");

  // Utilisation de useFrame pour animer le décollage
  useFrame(() => {
    if (takeoff && yPos < 20) {
      // Condition pour décoller (faire monter le vaisseau jusqu'à Y = 20)
      setYPos((prevY) => prevY + 0.05); // Incrémenter la position Y de manière fluide
    }
  });
  return (
    <RigidBody ref={shipRef} colliders="hull" gravityScale={1} restitution={0.5} type="fixed" mass={5} friction={1}>
      <Model
        position={[position[0], yPos, position[2]]}
        scale={scale}
        colorShip={colors.colorShip}
        colorLight={colors.colorLight}
        colorGlass={colors.colorGlass}
      />
    </RigidBody>
  );
}
