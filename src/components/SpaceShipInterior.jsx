import { useRef } from "react";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

// Nouveau composant pour les éléments intérieurs du vaisseau
const WallsAndFloor = () => (
  <group>
    {/* Sol */}
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[20, 0.2, 20]} />
        <meshStandardMaterial color="#344055" metalness={0.8} roughness={0.2} />
      </mesh>
    </RigidBody>

    {/* Murs */}
    <RigidBody type="fixed" colliders="cuboid">
      {/* Mur arrière */}
      <mesh position={[0, 2, -10]} receiveShadow castShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#566273" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Mur avant */}
      <mesh position={[0, 2, 10]} receiveShadow castShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#566273" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Mur gauche */}
      <mesh position={[-10, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 5, 20]} />
        <meshStandardMaterial color="#566273" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Mur droit */}
      <mesh position={[10, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.2, 5, 20]} />
        <meshStandardMaterial color="#566273" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Plafond */}
      <mesh position={[0, 4.5, 0]} receiveShadow>
        <boxGeometry args={[20, 0.2, 20]} />
        <meshStandardMaterial color="#344055" metalness={0.8} roughness={0.2} />
      </mesh>
    </RigidBody>
  </group>
);

// Panneaux de contrôle
const ControlPanels = () => (
  <group>
    <RigidBody type="fixed" colliders="cuboid">
      {/* Console centrale */}
      <mesh position={[0, 0.5, -7]} castShadow>
        <boxGeometry args={[6, 1, 2]} />
        <meshStandardMaterial color="#2a3a4a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Écrans sur la console */}
      <mesh position={[0, 1.2, -7]} castShadow>
        <boxGeometry args={[5.5, 0.1, 1.5]} />
        <meshStandardMaterial
          color="#67c7eb"
          emissive="#67c7eb"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Tables latérales */}
      <mesh position={[-7, 0.5, -5]} castShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color="#2a3a4a" metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh position={[7, 0.5, -5]} castShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color="#2a3a4a" metalness={0.9} roughness={0.1} />
      </mesh>
    </RigidBody>
  </group>
);

// Éclairage du vaisseau
const ShipLighting = () => (
  <group position={[0, 4, 0]}>
    {/* Lumière centrale */}
    <pointLight intensity={2} position={[0, 0, 0]} color="#a0c8ff" castShadow />

    {/* Lumières d'ambiance */}
    <pointLight intensity={0.5} position={[5, 0, 5]} color="#7fb8ff" />
    <pointLight intensity={0.5} position={[-5, 0, -5]} color="#7fb8ff" />

    {/* Lumière spot sur la console */}
    <spotLight
      position={[0, 0, -5]}
      angle={0.3}
      penumbra={0.3}
      intensity={2}
      color="#67c7eb"
      target-position={[0, 0, -7]}
      castShadow
    />
  </group>
);

// Sièges du vaisseau
const Seats = () => (
  <group>
    <RigidBody type="fixed" colliders="hull">
      <mesh position={[-1.5, 0.6, -4]} rotation={[0, Math.PI, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 16]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      <mesh position={[-1.5, 1.3, -4]} castShadow>
        <boxGeometry args={[0.8, 1, 0.2]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>

      <mesh position={[1.5, 0.6, -4]} rotation={[0, Math.PI, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 16]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      <mesh position={[1.5, 1.3, -4]} castShadow>
        <boxGeometry args={[0.8, 1, 0.2]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
    </RigidBody>
  </group>
);

// Détails techniques du vaisseau
const TechDetails = () => (
  <group>
    <RigidBody type="fixed">
      {/* Tuyaux */}
      <mesh position={[-9.8, 1, 8]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 3, 16]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[9.8, 1, 8]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 3, 16]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Boîtes électriques */}
      <mesh position={[-9.8, 2, 0]} castShadow>
        <boxGeometry args={[0.3, 1, 2]} />
        <meshStandardMaterial color="#3f4c5c" metalness={0.5} roughness={0.5} />
      </mesh>

      <mesh position={[9.8, 2, 0]} castShadow>
        <boxGeometry args={[0.3, 1, 2]} />
        <meshStandardMaterial color="#3f4c5c" metalness={0.5} roughness={0.5} />
      </mesh>
    </RigidBody>
  </group>
);

// Porte du vaisseau
const ShipDoor = () => (
  <group>
    <RigidBody type="fixed">
      <mesh position={[0, 2, 9.9]} castShadow>
        <boxGeometry args={[4, 3, 0.1]} />
        <meshStandardMaterial color="#424c5d" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Fenêtre de la porte */}
      <mesh position={[0, 2.5, 9.95]} castShadow>
        <boxGeometry args={[1, 1, 0.05]} />
        <meshStandardMaterial
          color="#67c7eb"
          emissive="#67c7eb"
          emissiveIntensity={0.3}
          opacity={0.7}
          transparent
        />
      </mesh>
    </RigidBody>
  </group>
);

const SpaceshipInterior = () => {
  return (
    <group>
      <WallsAndFloor />
      <ControlPanels />
      <ShipLighting />
      <Seats />
      <TechDetails />
      <ShipDoor />
    </group>
  );
};

export default SpaceshipInterior;
