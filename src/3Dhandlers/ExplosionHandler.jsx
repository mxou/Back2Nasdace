import React, { useState, useEffect } from "react";
import Explosion from "../components3D/Explosion";

const ExplosionHandler = ({
  shipRef,
  cityRef,
  duration = 2,
  position = [0, 0, 0],
  scale = [4, 4, 4],
  explosionTriggered,
  setExplosionTriggered,
}) => {
  // Attendre que l'explosion soit terminée avant de cacher le vaisseau et la ville
  useEffect(() => {
    if (explosionTriggered) {
      setTimeout(() => {
        // setExplosionTriggered(false);
      }, duration * 1000); // Durée de l'explosion
    }
  }, [explosionTriggered, duration]);

  return (
    <>
      {/* Si l'explosion est déclenchée, afficher l'explosion */}
      {explosionTriggered && (
        <Explosion
          scale={scale}
          position={shipRef.current?.translation() || position}
          duration={duration}
          onEnd={() => {
            // Ce qui se passe après l'explosion (par exemple, cacher les objets)
          }}
        />
      )}
    </>
  );
};

export default ExplosionHandler;
