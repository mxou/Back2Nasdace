import React, { useRef } from "react";
import { RigidBody } from "@react-three/rapier";
import { useGLTF, Html } from "@react-three/drei";
import "./styles/Nasdace.css"; // Importer le fichier CSS
import NasdaceModel from "/src/assets/modeles/Nasdace.glb";

export default function Nasdace({ playerData, position = [0, 0, 0], scale = [4, 4, 4], rotation = [0, 180, 0] }) {
  const { scene } = useGLTF(NasdaceModel);
  const bodyRef = useRef();

  const toRadians = (degrees) => (degrees * Math.PI) / 180; // Fonction pour convertir en radian
  const radianRotation = rotation.map(toRadians); // Convertit chaque axe en radian

  return (
    <RigidBody ref={bodyRef} colliders="hull" type="fixed" restitution={0.5} friction={1}>
      <primitive object={scene} position={position} scale={scale} rotation={radianRotation} />
      <Html position={[4, 1, 4]} center>
        <div className="nasdace-text">
          <div className="nasdace-text-content">
            Salut, tu dois être {playerData.name} ! On t'attendait, il faut vite qu'on y aille, si on part maintenant, vu l'alignement de la Terre et Mars on
            devrait arriver qu'en 228 jours. Va voir Amogus Lerouge il te fera entrer dans le vaisseau !
          </div>
          <div className="nasdace-pointer"></div>
        </div>
      </Html>
    </RigidBody>
  );
}
