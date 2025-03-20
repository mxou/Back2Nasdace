import React from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import NasdaceCityModel from "/src/assets/modeles/Snickers.glb";

const NasdaceCity = React.forwardRef((props, ref) => {
  const { scene } = useGLTF(NasdaceCityModel);

  return (
    <RigidBody ref={ref} colliders="hull" type="static" gravityScale={0}>
      <primitive object={scene} {...props} />
    </RigidBody>
  );
});

NasdaceCity.displayName = "NasdaceCity";

export default NasdaceCity;
