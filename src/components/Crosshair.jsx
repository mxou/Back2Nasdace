import React from "react";

export default function Crosshair() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "20px",
        height: "20px",
        pointerEvents: "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "4px",
          height: "4px",
          backgroundColor: "red",
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
