import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Dialogues({ dialogFile, onEnd }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const currentDialogue = dialogFile[currentIndex];

  const typingIntervalRef = useRef(null);

  useEffect(() => {
    let i = -1;
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
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [currentIndex]);

  const handleNext = () => {
    if (isTyping) {
      setDisplayText(currentDialogue.text);
      clearInterval(typingIntervalRef.current);
      setIsTyping(false);
    } else {
      if (currentIndex < dialogFile.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        if (onEnd) onEnd();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        x: "-50%",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "20px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        zIndex: 1000,
        pointerEvents: "auto",
        width: "500px",
        height: "100px",
      }}
      onClick={handleNext}
    >
      <motion.img
        key={currentDialogue.name}
        src={`/src/assets/images/${currentDialogue.name.toLowerCase()}.jpg`}
        alt={currentDialogue.name}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "80px", borderRadius: "50%", marginRight: "10px" }}
      />
      <div style={{ textAlign: "left", height: "100%" }}>
        <h2>{currentDialogue.name}</h2>
        <p>{displayText}</p>
      </div>
    </motion.div>
  );
}
