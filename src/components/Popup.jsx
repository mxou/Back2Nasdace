import React, { useState, useEffect } from "react";
import "./styles/Popup.css";

export default function Popup({ message }) {
  const [isVisible, setIsVisible] = useState(true);
  const [animationState, setAnimationState] = useState("appear");

  useEffect(() => {
    // Début de l'animation de disparition après 4 secondes
    const timer1 = setTimeout(() => setAnimationState("disappear"), 4000);
    // Cache complètement la popup après 5 secondes
    const timer2 = setTimeout(() => setIsVisible(false), 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`space-popup ${animationState}`}>
      <div className="space-popup-content">
        <div className="space-popup-stars"></div>
        <p className="space-popup-text">{message}</p>
      </div>
    </div>
  );
}
