import React, { useRef, useEffect, useState } from "react";
import { RigidBody } from "@react-three/rapier";
import { Model } from "../components/Model";
import { useFrame } from "@react-three/fiber";
import { useRaycastCollision } from "./UseRaycastCollision";

const ShipSus = React.forwardRef(
  (
    {
      position = [0, 0, 0],
      scale = [4, 4, 4],
      colors,
      gravity = 0,
      isMoving = false, // Contrôle du mouvement passé par le parent
      isAtterrissaging = false,
      onCollisionEnter,
      idleSpace = false, // Nouvelle propriété qui contrôle le mouvement continu
    },
    ref
  ) => {
    const shipRef = useRef();
    const [yOffset, setYOffset] = useState(0); // Suivi de la position Y pour le mouvement continu

    // Collision
    useRaycastCollision(shipRef, (collision) => {
      console.log("Collision détectée avec :", collision.object.name);
      onCollisionEnter?.(collision);
    });

    // Mouvement continu en haut/bas si idleSpace est activé
    useFrame(() => {
      if (shipRef.current && idleSpace) {
        const translation = shipRef.current.translation();
        if (translation) {
          // Mouvement vertical sinusoïdal
          setYOffset(Math.sin(Date.now() * 0.002) * 0.5); // Vitesse et amplitude du mouvement vertical
        }
      }

      if (shipRef.current && isAtterrissaging) {
        const translation = shipRef.current.translation();
        if (translation && translation.y >= -90) {
          shipRef.current.setTranslation({
            x: translation.x + 0,
            y: translation.y - 0.1,
            z: translation.z - 0,
          });
        }
      }

      // Si le vaisseau est en mouvement (contrôlé par isMoving)
      if (shipRef.current && isMoving) {
        const translation = shipRef.current.translation();
        if (translation) {
          shipRef.current.setTranslation({
            x: translation.x + 0.4,
            y: translation.y - 0.1,
            z: translation.z - 0.25,
          });
        }
      }
    });

    useEffect(() => {
      const handleCollision = () => {
        if (onCollisionEnter) {
          onCollisionEnter();
        }
      };

      const ship = shipRef.current;
      if (ship) {
        ship.onCollisionEnter = handleCollision;
      }

      return () => {
        if (ship) {
          ship.onCollisionEnter = null;
        }
      };
    }, [onCollisionEnter]);

    return (
      <RigidBody
        ref={shipRef}
        colliders="hull"
        gravityScale={gravity}
        restitution={0.5}
        type="dynamic"
        mass={5}
        friction={1}
      >
        <Model
          position={[position[0], position[1] + yOffset, position[2]]} // Applique le déplacement Y sinusoïdal ici
          scale={scale}
          colorShip={colors.colorShip}
          colorLight={colors.colorLight}
          colorGlass={colors.colorGlass}
        />
      </RigidBody>
    );
  }
);

ShipSus.displayName = "ShipSus";

export default ShipSus;
