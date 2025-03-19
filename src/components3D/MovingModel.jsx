import "./../App.css";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import collisionSoundFile from "/src/assets/audio/mcoof.mp3";
import rs6SoundFile from "/src/assets/audio/rs6_short.mp3";
import * as THREE from "three";

export default function MovingModel({ position, trees, onPadEnter }) {
  const ref = useRef();
  const { scene, animations } = useGLTF(
    "/src/assets/black_spiderman/scene.gltf"
  ); // Charge le modèle
  const [keys, setKeys] = useState({});
  const [isMoving, setIsMoving] = useState(false);
  const [collisionPlaying, setCollisionPlaying] = useState(false);
  const { actions } = useAnimations(animations, ref); // 🔹 Récupère les animations

  // Sons
  const collisionSound = useRef(new Audio(collisionSoundFile)).current;
  const rs6Sound = useRef(new Audio(rs6SoundFile)).current;

  useEffect(() => {
    collisionSound.load();
    rs6Sound.load();

    const handleKeyDown = (event) =>
      setKeys((keys) => ({ ...keys, [event.key]: true }));
    const handleKeyUp = (event) =>
      setKeys((keys) => ({ ...keys, [event.key]: false }));

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Vérification de collision
  const checkCollision = (x, z) => {
    return trees.some((tree) => {
      const dx = x - tree.x;
      const dz = z - tree.z;
      return Math.sqrt(dx * dx + dz * dz) < tree.radius;
    });
  };

  useFrame(() => {
    if (!ref.current) return;
    const speed = 0.05;
    let newX = ref.current.position.x;
    let newZ = ref.current.position.z;
    let moving = false;
    let rotationY = ref.current.rotation.y; // Récupère la rotation actuelle

    if (keys["ArrowUp"]) {
      newZ -= speed;
      moving = true;
      rotationY = Math.PI; // Tourne le modèle vers l'arrière
    }
    if (keys["ArrowDown"]) {
      newZ += speed;
      moving = true;
      rotationY = 0; // Tourne le modèle vers l'avant
    }
    if (keys["ArrowLeft"]) {
      newX -= speed;
      moving = true;
      rotationY = -Math.PI / 2; // Tourne à gauche
    }
    if (keys["ArrowRight"]) {
      newX += speed;
      moving = true;
      rotationY = Math.PI / 2; // Tourne à droite
    }
    // Gestion des diagonales
    if (keys["ArrowUp"] && keys["ArrowLeft"]) {
      rotationY = -Math.PI * 0.75; // Diagonale haut-gauche
    }
    if (keys["ArrowUp"] && keys["ArrowRight"]) {
      rotationY = Math.PI * 0.75; // Diagonale haut-droite
    }
    if (keys["ArrowDown"] && keys["ArrowLeft"]) {
      rotationY = -Math.PI * 0.25; // Diagonale bas-gauche
    }
    if (keys["ArrowDown"] && keys["ArrowRight"]) {
      rotationY = Math.PI * 0.25; // Diagonale bas-droite
    }

    // Vérification si le joueur marche sur le Pad (position [1, 0, -2])
    if (Math.abs(newX - 1) < 0.5 && Math.abs(newZ + 2) < 0.5) {
      onPadEnter(); // Affiche le formulaire
    }

    // Empêcher de sortir du terrain
    if (newX < -4.5 || newX > 4.5 || newZ < -4.5 || newZ > 4.5) return;

    // Gestion du son de mouvement
    if (moving && !isMoving) {
      actions["Idle"]?.fadeOut(0.2); // Rend l'animation "Idle" fluide
      actions["Bully Walking"]?.reset().fadeIn(0.2).play(); // Active en douceur "Bully Walking"
      setIsMoving(true);
    } else if (!moving && isMoving) {
      actions["Bully Walking"]?.fadeOut(0.2); // Stoppe la marche en douceur
      actions["Idle"]?.reset().fadeIn(0.2).play(); // Revient doucement à "Idle"
      setIsMoving(false);
    }

    // Gestion des collisions
    if (!checkCollision(newX, newZ)) {
      ref.current.position.x = newX;
      ref.current.position.z = newZ;
      ref.current.rotation.y = rotationY; // Appliquer la rotation
    } else {
      if (!collisionPlaying) {
        collisionSound.play();
        setCollisionPlaying(true);
        collisionSound.onended = () => {
          setCollisionPlaying(false);
        };
      }
    }
  });

  return (
    <primitive
      ref={ref}
      object={scene}
      position={position}
      scale={[0.5, 0.5, 0.5]}
    />
  );
}
