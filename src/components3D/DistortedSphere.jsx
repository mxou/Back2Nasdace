import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function DistortedSphere({
  position,
  scale = [1, 1, 1],
  duration,
  onEnd,
}) {
  const sphereRef = useRef();
  const startTime = useRef(Date.now());

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onEnd) onEnd();
    }, duration * 1000);

    return () => clearTimeout(timeout);
  }, [duration, onEnd]);

  useFrame(() => {
    if (!sphereRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const growthFactor = 1 + elapsed * 2; // La sphère grossit avec le temps
    const opacity = Math.max(1 - elapsed / duration, 0); // Disparition progressive

    sphereRef.current.scale.set(
      scale[0] * growthFactor,
      scale[1] * growthFactor,
      scale[2] * growthFactor
    );
    sphereRef.current.material.opacity = opacity;

    // Ajout d'une distorsion sur la géométrie
    const geometry = sphereRef.current.geometry;
    const positionAttr = geometry.attributes.position;

    for (let i = 0; i < positionAttr.count; i++) {
      const index = i * 3;
      positionAttr.array[index] += (Math.random() - 0.5) * 0.05;
      positionAttr.array[index + 1] += (Math.random() - 0.5) * 0.05;
      positionAttr.array[index + 2] += (Math.random() - 0.5) * 0.05;
    }

    positionAttr.needsUpdate = true;
  });

  return (
    <mesh ref={sphereRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color="orange"
        emissive="red"
        emissiveIntensity={1}
        transparent
        opacity={1}
      />
    </mesh>
  );
}
