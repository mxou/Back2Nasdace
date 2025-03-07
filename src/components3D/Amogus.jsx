import React, { useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { Html } from "@react-three/drei";

export default function Amogus({ position, scale = [5, 5, 5], playerRef, setShowForm }) {
  const { scene } = useGLTF("src/assets/modeles/amogus.glb");
  const [isNear, setIsNear] = useState(false);

  // Vérifier la distance entre le joueur et Amogus
  useEffect(() => {
    const checkProximity = () => {
      if (!playerRef.current) return;

      const playerPosition = playerRef.current.translation(); // Position du joueur
      const distance = Math.sqrt((playerPosition.x - position[0]) ** 2 + (playerPosition.z - position[2]) ** 2);

      setIsNear(distance < 3);
    };

    const interval = setInterval(checkProximity, 500);
    return () => clearInterval(interval);
  }, [position, playerRef]);

  // Écoute de la touche "E"
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "e" && isNear) {
        setShowForm(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isNear, setShowForm]);

  return (
    <RigidBody type="fixed" colliders="hull">
      <primitive object={scene} position={position} scale={scale} />

      {/* Affichage du message si le joueur est proche */}
      {isNear && (
        <Html position={[10, 1, 11]} center>
          <div style={styles.interactionText}>Press E to interact</div>
        </Html>
      )}
    </RigidBody>
  );
}

// Style du message d'interaction
const styles = {
  interactionText: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    padding: "5px 10px",
    borderRadius: "5px",
    fontSize: "14px",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
  },
};
