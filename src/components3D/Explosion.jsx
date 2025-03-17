import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

export default function Explosion({
  position = [0, 0, 0],
  duration = 2,
  onEnd,
}) {
  const particlesRef = useRef();
  const velocities = useRef([]);

  useEffect(() => {
    const numParticles = 100;
    const positions = new Float32Array(numParticles * 3);
    const velocityArray = [];

    for (let i = 0; i < numParticles; i++) {
      const theta = Math.random() * Math.PI * 2; // Angle horizontal
      const phi = Math.random() * Math.PI; // Angle vertical
      const speed = Math.random() * 2 + 1; // Vitesse aléatoire

      velocityArray.push([
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.cos(phi) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
      ]);

      positions[i * 3] = position[0];
      positions[i * 3 + 1] = position[1];
      positions[i * 3 + 2] = position[2];
    }

    particlesRef.current.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    velocities.current = velocityArray;
  }, []);

  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    console.log(particlesRef.current.geometry);
    const positions = particlesRef.current.geometry.attributes.position.array;

    for (let i = 0; i < velocities.current.length; i++) {
      positions[i * 3] += velocities.current[i][0] * delta * 3;
      positions[i * 3 + 1] += velocities.current[i][1] * delta * 3;
      positions[i * 3 + 2] += velocities.current[i][2] * delta * 3;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  useEffect(() => {
    setTimeout(() => {
      if (onEnd) onEnd();
    }, duration * 1000);
  }, [duration, onEnd]);

  return (
    <Points ref={particlesRef}>
      <bufferGeometry />
      <PointMaterial size={0.2} color="orange" />
    </Points>
  );
}
