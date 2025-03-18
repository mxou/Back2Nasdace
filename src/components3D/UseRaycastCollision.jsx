import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export const useRaycastCollision = (objectRef, onCollision) => {
  const { scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const direction = new THREE.Vector3(0, 0, -1); // Direction du rayon (vers l'avant)

  useEffect(() => {
    const checkCollision = () => {
      if (!objectRef.current || !objectRef.current.position) return; // Check if objectRef.current and position are valid

      // Ensure the position is a valid Vector3 object
      raycaster.current.set(objectRef.current.position, direction);
      const intersects = raycaster.current.intersectObjects(
        scene.children,
        true
      );

      if (intersects.length > 0) {
        onCollision(intersects[0]);
      }

      requestAnimationFrame(checkCollision);
    };

    checkCollision();
  }, [objectRef, scene, onCollision]);
};
