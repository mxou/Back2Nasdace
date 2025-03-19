import React, { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, useGLTF } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  CuboidCollider,
  BallCollider,
  useRapier,
} from "@react-three/rapier";

// Composant pour la planète avec un collider physique
const Planet = ({ onCollision }) => {
  const rigidBodyRef = useRef();
  const { rapier, world } = useRapier();

  // Configuration du gestionnaire d'événements de collision
  useEffect(() => {
    if (!rigidBodyRef.current) return;

    // Récupérer le rigidBody
    const rigidBody = rigidBodyRef.current;

    // Fonction du gestionnaire d'événements
    const handleCollision = (event) => {
      // Vérifie si la collision implique le vaisseau
      if (event.colliderHandle === rigidBody.colliderHandle) {
        onCollision();
      }
    };

    // Abonnement aux événements de collision
    world.on("contactForceEvent", handleCollision);

    // Nettoyage à la destruction du composant
    return () => {
      world.off("contactForceEvent", handleCollision);
    };
  }, [onCollision]);

  return (
    <RigidBody ref={rigidBodyRef} type="fixed" colliders={false}>
      <BallCollider args={[2]} />
      <Sphere args={[2, 32, 32]}>
        <meshStandardMaterial color="blue" roughness={0.8} />
      </Sphere>
    </RigidBody>
  );
};

// Composant pour le vaisseau spatial avec un collider physique
const Spaceship = ({ initialPosition }) => {
  const rigidBodyRef = useRef();

  // Application d'une impulsion initiale
  useEffect(() => {
    if (rigidBodyRef.current) {
      // Appliquer une impulsion vers la planète
      const impulse = { x: 10, y: 1, z: 2 };
      rigidBodyRef.current.applyImpulse(impulse, true);
    }
  }, []);

  return (
    <RigidBody ref={rigidBodyRef} position={initialPosition} colliders={false}>
      <CuboidCollider args={[0.5, 0.2, 0.6]} />
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 0.4, 1.2]} />
          <meshStandardMaterial color="silver" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.3, -0.4]}>
          <boxGeometry args={[0.6, 0.2, 0.6]} />
          <meshStandardMaterial color="silver" metalness={0.8} />
        </mesh>
      </group>
    </RigidBody>
  );
};

// Composant pour l'explosion
const Explosion = ({ position, visible }) => {
  const explosionRef = useRef();
  const [particles, setParticles] = useState([]);

  // Créer les particules d'explosion quand visible devient true
  useEffect(() => {
    if (visible) {
      const newParticles = [];
      for (let i = 0; i < 60; i++) {
        newParticles.push({
          id: i,
          position: [
            position[0] + (Math.random() * 2 - 1) * 0.5,
            position[1] + (Math.random() * 2 - 1) * 0.5,
            position[2] + (Math.random() * 2 - 1) * 0.5,
          ],
          velocity: [
            (Math.random() * 2 - 1) * 0.2,
            (Math.random() * 2 - 1) * 0.2,
            (Math.random() * 2 - 1) * 0.2,
          ],
          scale: Math.random() * 0.4 + 0.1,
          color:
            Math.random() > 0.6
              ? "orange"
              : Math.random() > 0.3
              ? "yellow"
              : "red",
        });
      }
      setParticles(newParticles);
    }
  }, [visible, position]);

  // Animer les particules
  useFrame(() => {
    if (!visible) return;

    setParticles(
      (prevParticles) =>
        prevParticles
          .map((particle) => ({
            ...particle,
            position: [
              particle.position[0] + particle.velocity[0],
              particle.position[1] + particle.velocity[1],
              particle.position[2] + particle.velocity[2],
            ],
            scale: particle.scale * 0.98, // Les particules rétrécissent progressivement
          }))
          .filter((particle) => particle.scale > 0.05) // Supprime les particules trop petites
    );
  });

  if (!visible) return null;

  return (
    <group ref={explosionRef}>
      {particles.map((particle) => (
        <Sphere
          key={particle.id}
          args={[particle.scale, 8, 8]}
          position={particle.position}
        >
          <meshStandardMaterial
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={2}
          />
        </Sphere>
      ))}
    </group>
  );
};

// Fond étoilé
const Stars = () => {
  const starsRef = useRef();
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const newStars = [];
    for (let i = 0; i < 300; i++) {
      newStars.push({
        id: i,
        position: [
          Math.random() * 150 - 75,
          Math.random() * 150 - 75,
          Math.random() * 150 - 75,
        ],
        size: Math.random() * 0.1 + 0.05,
      });
    }
    setStars(newStars);
  }, []);

  return (
    <group ref={starsRef}>
      {stars.map((star) => (
        <Sphere key={star.id} args={[star.size, 8, 8]} position={star.position}>
          <meshBasicMaterial color="white" />
        </Sphere>
      ))}
    </group>
  );
};

// Scène principale
const SpaceCollisionScene = () => {
  const [collided, setCollided] = useState(false);
  const [showPlanet, setShowPlanet] = useState(true);

  const handleCollision = () => {
    if (!collided) {
      setCollided(true);

      // Faire disparaître la planète après un court délai
      setTimeout(() => {
        setShowPlanet(false);
      }, 100);
    }
  };

  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars />

        <Physics gravity={[0, 0, 0]}>
          {showPlanet && <Planet onCollision={handleCollision} />}
          {!collided && <Spaceship initialPosition={[-15, 0, 0]} />}
        </Physics>

        <Explosion position={[0, 0, 0]} visible={collided} />
      </Canvas>
    </div>
  );
};

export default SpaceCollisionScene;
