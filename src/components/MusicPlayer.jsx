import React, { useEffect, useRef } from "react";

export default function MusicPlayer({ path }) {
  const audioRef = useRef(null);

  useEffect(() => {
    // Fonction pour démarrer la musique lorsque l'utilisateur appuie sur la touche "Z"
    const handleKeyDown = (event) => {
      if (event.key === "z" || event.key === "Z") {
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.log("Erreur de lecture automatique :", err);
          });
          audioRef.current.loop = true; // Pour que la musique joue en boucle
          audioRef.current.volume = 0.03;
        }
      }
    };

    // Fonction pour démarrer la musique lors d'un clic
    const handleClick = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.log("Erreur de lecture du son au clic :", err);
        });
        audioRef.current.loop = true;
        audioRef.current.volume = 0.03;
      }
    };

    // Écoute des événements "keydown" et "click"
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClick);

    // Clean-up lorsque le composant est démonté
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClick);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return <audio ref={audioRef} src={path} />;
}
