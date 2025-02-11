import "./../App.css";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Tree({ position }) {
  return (
    <group position={position}>
      {/* Tronc */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 2, 10]} /> {/*[haut, bas, hauteur, segments]*/}
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Feuillage */}
      <mesh position={[0, 2.5, 0]}>
        <dodecahedronGeometry args={[1.2, 1]} /> {/*[rayon, détails]*/}
        <meshStandardMaterial color="#228b22" />
      </mesh>
    </group>
  );
}
