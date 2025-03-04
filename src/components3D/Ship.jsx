import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import * as THREE from "three";

export default function Ship({ position, scale = [5, 5, 5] }) {
  const { scene } = useGLTF("./src/assets/modeles/ship.glb");
  return (
    <RigidBody colliders="hull" gravityScale={1} restitution={0.5}>
      <primitive object={scene} position={position} scale={scale} />;
    </RigidBody>
  );
}
