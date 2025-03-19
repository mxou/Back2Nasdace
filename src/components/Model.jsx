import React from "react";
import { useGLTF } from "@react-three/drei";
import shipModel from "/src/assets/modeles/ship.glb";

export function Model({
  colorShip = "#ff0000",
  colorLight = "#00ff00",
  colorGlass = "#0000ff",
  colorBoost = "#ffff00",
  ...props
}) {
  const { nodes, materials } = useGLTF(shipModel);

  // Appliquer les couleurs dynamiquement
  materials.shipmetal.color.set(colorShip);
  materials.light.color.set(colorLight);
  materials.glasse.color.set(colorGlass);
  materials["Material.002"].color.set(colorBoost);

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.ship.geometry}
        material={materials.shipmetal}
        scale={[0.857, 0.091, 0.857]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.sidelight.geometry}
        material={materials.light}
        scale={[0.842, 0.0897, 0.842]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sphere.geometry}
        material={materials.light}
        position={[0.711, 0.1, 0]}
        scale={0.0254}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Sphere001.geometry}
        material={materials.glasse}
        position={[0, 0.1, 0]}
        scale={[0.455, 0.271, 0.455]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.boost.geometry}
        material={materials["Material.002"]}
        scale={[0.857, 0.091, 0.857]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.foot.geometry}
        material={nodes.foot.material}
        position={[-0.556, -0.06, -0.069]}
        scale={[0.0129, 0.0477, 0.0129]}
      />
    </group>
  );
}

useGLTF.preload("/ship.glb");
