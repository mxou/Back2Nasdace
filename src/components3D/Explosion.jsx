import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import DistortedSphere from "./DistortedSphere";

export default function Explosion({
  position = [0, 0, 0],
  duration = 2,
  scale,
  onEnd,
}) {
  const particlesRef = useRef();
  const velocities = useRef([]);

  useEffect(() => {
    if (!particlesRef.current) return;

    const numParticles = 150;
    const positions = new Float32Array(numParticles * 3);
    const velocityArray = [];

    for (let i = 0; i < numParticles; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = Math.random() * 2 + scale[0] * 2;

      velocityArray.push([
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.cos(phi) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
      ]);

      positions[i * 3] = position[0];
      positions[i * 3 + 1] = position[1];
      positions[i * 3 + 2] = position[2];
    }

    if (particlesRef.current) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );

      particlesRef.current.geometry = geometry;
    }

    velocities.current = velocityArray;
  }, []);

  useFrame((_, delta) => {
    if (!particlesRef.current || !particlesRef.current.geometry) return;

    const positions = particlesRef.current.geometry.attributes.position?.array;
    if (!positions) return;

    for (let i = 0; i < velocities.current.length; i++) {
      positions[i * 3] += velocities.current[i][0] * delta * 3;
      positions[i * 3 + 1] += velocities.current[i][1] * delta * 3;
      positions[i * 3 + 2] += velocities.current[i][2] * delta * 3;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onEnd) onEnd();
    }, duration * 1000);

    return () => clearTimeout(timeout);
  }, [duration, onEnd]);

  return (
    <>
      <DistortedSphere position={position} duration={duration} scale={scale} />
      <points ref={particlesRef}>
        <bufferGeometry />
        <pointsMaterial size={0.2} color="orange" />
      </points>
    </>
  );
}
