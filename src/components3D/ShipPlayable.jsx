// Ship.js
import React, { forwardRef } from "react";
import { Model } from "../components/Model";

const Ship = forwardRef(
  ({ position = [0, 0, 0], scale = [4, 4, 4], colors }, ref) => {
    return (
      <Model
        position={position}
        scale={scale}
        colorShip={colors.colorShip}
        colorLight={colors.colorLight}
        colorGlass={colors.colorGlass}
      />
    );
  }
);

Ship.displayName = "Ship";
export default Ship;
