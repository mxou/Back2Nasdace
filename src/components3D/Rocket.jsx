import React, { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Rocket({ position, isFlying, cameraRef }) {
  const { scene } = useGLTF("./../src/assets/low_poly_rocket/scene.gltf");
  const ref = useRef();
  const { camera } = useThree();
  const [yPos, setYPos] = useState(position[1]);
  const [xRotation, setXRotation] = useState(0);

  const spiderman = useRef(new Audio("./../src/assets/audio/spiderman.mp3")).current;

  useEffect(() => {
    spiderman.load();
  }, []);

  useFrame(({ camera }) => {
    if (isFlying && ref.current) {
      if (yPos < 20) {
        if (spiderman.paused) {
          spiderman.play();
        }
        // Fait monter le ship jusqu'à une certaine hauteur
        setXRotation(xRotation + 10);
        ref.current.rotation.y = xRotation;
        setYPos(yPos + 0.05);
        ref.current.position.y = yPos;

        // Vérifie que cameraRef est défini, sinon utilise `camera` de useThree
        const activeCamera = cameraRef?.current || camera;
        if (activeCamera) {
          activeCamera.position.lerp(new THREE.Vector3(ref.current.position.x + 2, ref.current.position.y + 3, ref.current.position.z + 5), 0.02);
          activeCamera.lookAt(ref.current.position);
        }
      }
    }
  });

  return <primitive ref={ref} object={scene} position={[position[0], yPos, position[2]]} />;
}
