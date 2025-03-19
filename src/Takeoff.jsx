import React from "react";
import NewScene from "./components3D/NewScene";

const Takeoff = ({ playerData, takeoff }) => {
  return <NewScene playerData={playerData} takeoff={takeoff} />;
};

export default Takeoff;
