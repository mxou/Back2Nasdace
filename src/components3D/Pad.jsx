import "./../App.css";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Pad({ position, scale = [5, 5, 5] }) {
  const { scene } = useGLTF("./../src/assets/pad/scene.gltf");
  return <primitive object={scene} position={position} scale={scale} />;
}
