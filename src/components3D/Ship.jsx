import React, { useRef, useEffect } from "react";
import { RigidBody } from "@react-three/rapier";
import { Model } from "../components/Model";
import { useFrame } from "@react-three/fiber";
import { useRaycastCollision } from "./UseRaycastCollision";

const Ship = React.forwardRef(
  (
    {
      position = [0, 0, 0],
      scale = [4, 4, 4],
      colors,
      gravity = 0,
      isMoving = false, // Contrôle du mouvement passé par le parent
      onCollisionEnter,
    },
    ref
  ) => {
    const shipRef = useRef();

    useRaycastCollision(shipRef, (collision) => {
      console.log("Collision détectée avec :", collision.object.name);
      onCollisionEnter?.(collision);
    });

    useFrame(() => {
      if (shipRef.current && isMoving) {
        const translation = shipRef.current.translation();
        if (translation) {
          shipRef.current.setTranslation({
            x: translation.x + 0.8,
            y: translation.y - 0.2,
            z: translation.z - 0.5,
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

Ship.displayName = "Ship";

export default Ship;
