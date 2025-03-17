import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { Model } from "../components/Model";

const Ship = React.forwardRef(
  (
    {
      position = [0, 0, 0],
      scale = [4, 4, 4],
      colors,
      gravity = 1,
      startAnimation,
    },
    ref
  ) => {
    const shipRef = useRef();
    const [isFlying, setIsFlying] = useState(false);

    // États pour les couleurs
    const [colorShip, setColorShip] = useState("#ff0000");
    const [colorLight, setColorLight] = useState("#00ff00");
    const [colorGlass, setColorGlass] = useState("#0000ff");
    const [colorBoost, setColorBoost] = useState("#ffff00");

    // L'animation ne se déclenche que lorsque startAnimation est vrai
    useFrame(() => {
      if (shipRef.current && startAnimation) {
        // Vérification supplémentaire pour s'assurer que shipRef.current est défini avant d'essayer d'accéder à la position
        const translation = shipRef.current.translation();

        if (translation) {
          // Mise à jour de la position Z pour donner l'impression que le vaisseau avance
          shipRef.current.setTranslation({
            x: translation.x,
            y: translation.y,
            z: translation.z - 0.1,
          });
        }
      }
    });

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
);

// Donner un nom au composant pour le débogage
Ship.displayName = "Ship";

export default Ship;
