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
        // Désabonner l'événement après que la touche ait été pressée
        document.removeEventListener("keydown", handleKeyDown);
      }
    };

    // Écoute de l'événement "keydown"
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      // Désabonne l'événement lors du démontage du composant
      document.removeEventListener("keydown", handleKeyDown);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return <audio ref={audioRef} src={path} />;
}
