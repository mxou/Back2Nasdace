import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./Dialogues.css";
import dialogueSkip from "/src/assets/audio/skip.mp3";

export default function Dialogues({
  dialogFile,
  onComplete,
  autoSkip = false,
  userName,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [visible, setVisible] = useState(true); // Ajout d'un état interne

  const currentDialogue = dialogFile[currentIndex];
  const typingIntervalRef = useRef(null);
  const autoNextTimeoutRef = useRef(null);

  useEffect(() => {
    let i = -1;

    currentDialogue.text = currentDialogue.text.replace("{name}", userName);
    setDisplayText("");
    setIsTyping(true);

    typingIntervalRef.current = setInterval(() => {
      if (i < currentDialogue.text.length - 1) {
        setDisplayText((prev) => prev + currentDialogue.text[i]);
        i++;
      } else {
        clearInterval(typingIntervalRef.current);
        setIsTyping(false);
      }
    }, 20);

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    };
  }, [currentIndex]);

  useEffect(() => {
    if (!isTyping && autoSkip) {
      autoNextTimeoutRef.current = setTimeout(() => {
        handleNext();
      }, 2000);
    }

    return () => {
      if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    };
  }, [isTyping, autoSkip]);

  const handleNext = () => {
    const clickSound = new Audio(dialogueSkip); // Remplace par ton fichier
    clickSound.volume = 0.3; // Ajuste le volume si nécessaire

    if (isTyping) {
      setDisplayText(currentDialogue.text);
      clearInterval(typingIntervalRef.current);
      setIsTyping(false);
    } else {
      if (currentIndex < dialogFile.length - 1) {
        setCurrentIndex(currentIndex + 1);
        clickSound.play();
      } else {
        clickSound.play();
        setVisible(false); // Masque le dialogue
        setTimeout(() => {
          if (onComplete) onComplete(); // Exécute la suite du jeu
        }, 500);
      }
    }
  };

  if (!visible) return null; // Cache le composant après la fin

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="dialogue-container"
      onClick={handleNext}
      style={{ x: "-50%" }}
    >
      <motion.img
        key={currentDialogue.name}
        src={`/images/${currentDialogue.name.toLowerCase()}.jpg`}
        alt={currentDialogue.name}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="dialogue-avatar"
      />
      <div className="dialogue-text">
        <h2>
          {currentDialogue.name == "{name}" ? userName : currentDialogue.name}
        </h2>
        <p>{displayText}</p>
        {!isTyping && (
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
            className="dialogue-arrow"
          />
        )}
      </div>
    </motion.div>
  );
}
