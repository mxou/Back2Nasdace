import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import "./GameOver.css";

export default function GameOver({ reason, onRestart, onMainMenu }) {
  const [showControls, setShowControls] = useState(false);

  // Variants pour les animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 5,
        staggerChildren: 2,
      },
    },
  };

  const titleVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 9,
      },
    },
  };

  const reasonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.2,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.5,
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 0px 15px rgba(255, 0, 0, 0.7)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10,
      },
    },
    tap: {
      scale: 0.95,
      boxShadow: "0px 0px 5px rgba(255, 0, 0, 0.7)",
    },
  };

  const glitchVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 1,
        duration: 0.01,
        yoyo: Infinity,
        repeatDelay: Math.random() * 3 + 1,
      },
    },
  };

  // Affiche les contrôles après un délai
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="game-over-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="game-over-overlay"></div>

      <motion.div className="game-over-content">
        <motion.h1 className="game-over-title" variants={titleVariants}>
          GAME OVER
        </motion.h1>

        <motion.div
          className="glitch-effect"
          variants={glitchVariants}
        ></motion.div>

        <motion.div className="game-over-reason" variants={reasonVariants}>
          <p>{reason}</p>
        </motion.div>

        {showControls && (
          <motion.div
            className="game-over-controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {onRestart && (
              <motion.button
                className="retry-button"
                onClick={onRestart}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                RETRY
              </motion.button>
            )}

            <motion.button
              className="menu-button"
              onClick={onMainMenu}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              MAIN MENU
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
