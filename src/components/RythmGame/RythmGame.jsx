import React, { useState, useEffect, useRef } from "react";
import "./RythmGame.css";
import { div } from "framer-motion/client";

const RhythmGame = ({
  hasScored = false,
  setHasScored,
  music,
  hitSound,
  missSound,
  onComplete,
}) => {
  const [notes, setNotes] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [misses, setMisses] = useState(0);
  const [hits, setHits] = useState({ perfect: 0, good: 0, ok: 0 });
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [approachRate, setApproachRate] = useState(1.3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [lastHit, setLastHit] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60); // Jeu limité à 60 secondes
  const [gameTime, setGameTime] = useState(60); // Durée configurable
  const [feedBack, setFeedBack] = useState(-1);
  const gameRef = useRef(null);
  const frameRef = useRef(null);
  const noteIdRef = useRef(0);
  const lastNoteTimeRef = useRef(0);

  const containerRef = useRef(null);
  const [laneWidths, setLaneWidths] = useState([]);
  const [noteWidth, setNoteWidth] = useState(0);
  // Dimensions des lanes et zone de frappe
  const hitAreaHeight = 50;
  const hitAreaPosition = 250;
  const laneCount = 4;
  // Timing constants
  const PERFECT_TIMING = 0.2; // 50ms
  const GOOD_TIMING = 0.25; // 100ms
  const OK_TIMING = 0.5; // 150ms
  // Points par hit
  const PERFECT_POINTS = 300;
  const GOOD_POINTS = 100;
  const OK_POINTS = 50;

  useEffect(() => {
    if (containerRef.current) {
      const lanes = containerRef.current.querySelectorAll(".lane");
      const widths = Array.from(lanes).map(
        (lane) => lane.getBoundingClientRect().width
      );
      setLaneWidths(widths);
      setNoteWidth(widths[0] * 0.5);
    }
  }, [laneCount]); // Met à jour si laneCount ou laneWidth change
  // Mettre à jour le multiplicateur en fonction du combo
  useEffect(() => {
    if (combo >= 30) {
      setMultiplier(4);
    } else if (combo >= 20) {
      setMultiplier(3);
    } else if (combo >= 10) {
      setMultiplier(2);
    } else {
      setMultiplier(1);
    }
    // Mettre à jour le combo maximum
    if (combo > maxCombo) {
      setMaxCombo(combo);
    }
  }, [combo, maxCombo]);
  // Timer de jeu
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);
  // Boucle principale du jeu
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = 0;
    const gameLoop = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      // Générer de nouvelles notes
      if (timestamp - lastNoteTimeRef.current > 1000 / approachRate) {
        const lane = Math.floor(Math.random() * laneCount);
        const newNote = {
          id: noteIdRef.current++,
          lane,
          y: 0,
          hit: false,
          missed: false,
        };
        setNotes((prevNotes) => [...prevNotes, newNote]);
        lastNoteTimeRef.current = timestamp;
      }
      // Mettre à jour les positions des notes et vérifier les ratés
      setNotes((prevNotes) => {
        return prevNotes
          .map((note) => {
            const newY = note.y + scrollSpeed * deltaTime * 100;
            const isMissed =
              !note.hit && newY > hitAreaPosition + hitAreaHeight;
            if (isMissed && !note.missed) {
              missSound.currentTime = 0;
              missSound.play();
              setCombo(0);
              setMisses((prev) => prev + 1);
              return { ...note, y: newY, missed: true };
            }
            return { ...note, y: newY };
          })
          .filter((note) => note.y < 600 || (!note.hit && !note.missed));
      });
      frameRef.current = requestAnimationFrame(gameLoop);
    };
    frameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isPlaying, scrollSpeed, approachRate]);
  // Gérer les appuis sur les touches
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying) return;
      let lane = -1;
      if (e.key === "ArrowLeft") lane = 0;
      else if (e.key === "ArrowDown") lane = 1;
      else if (e.key === "ArrowUp") lane = 2;
      else if (e.key === "ArrowRight") lane = 3;
      if (lane !== -1) {
        setFeedBack(true);
        e.preventDefault();
        handleLaneHit(lane);
      }
      const feedBackTimeout = setTimeout(() => {
        setFeedBack(-1);
      }, 200);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, notes]);
  const handleLaneHit = (lane) => {
    // Trouver la note la plus proche dans le lane
    const laneSortedNotes = notes
      .filter((note) => note.lane === lane && !note.hit && !note.missed)
      .sort(
        (a, b) =>
          Math.abs(a.y - hitAreaPosition) - Math.abs(b.y - hitAreaPosition)
      );
    if (laneSortedNotes.length === 0) return;
    const closestNote = laneSortedNotes[0];
    const distance = Math.abs(closestNote.y - hitAreaPosition);
    // Vérifier si la note est dans la zone de frappe
    if (distance <= hitAreaHeight) {
      // Calculer la précision du hit
      const accuracyRatio = distance / hitAreaHeight;
      let pointsToAdd = 0;
      let hitType = "";
      hitSound.currentTime = 0;
      hitSound.play();
      if (accuracyRatio <= PERFECT_TIMING) {
        pointsToAdd = PERFECT_POINTS;
        hitType = "PERFECT";
        setHits((prev) => ({ ...prev, perfect: prev.perfect + 1 }));
      } else if (accuracyRatio <= GOOD_TIMING) {
        pointsToAdd = GOOD_POINTS;
        hitType = "GOOD";
        setHits((prev) => ({ ...prev, good: prev.good + 1 }));
      } else if (accuracyRatio <= OK_TIMING) {
        pointsToAdd = OK_POINTS;
        hitType = "OK";
        setHits((prev) => ({ ...prev, ok: prev.ok + 1 }));
      }
      if (pointsToAdd > 0) {
        setScore((prev) => prev + pointsToAdd * multiplier);
        setCombo((prev) => prev + 1);
        setLastHit({ type: hitType, points: pointsToAdd * multiplier });
        // Marquer la note comme frappée
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === closestNote.id ? { ...note, hit: true } : note
          )
        );
        // Effacer la notification de hit après un délai
        setTimeout(() => {
          setLastHit(null);
        }, 500);
      }
    }
  };
  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setMisses(0);
    setHits({ perfect: 0, good: 0, ok: 0 });
    setNotes([]);
    setTimeLeft(gameTime);
    lastNoteTimeRef.current = 0;
    noteIdRef.current = 0;
    music.currentTime = 3;
    music.play();
  };
  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  };
  // Calcul de la précision globale
  const calculateAccuracy = () => {
    const totalHits = hits.perfect + hits.good + hits.ok;
    const totalNotes = totalHits + misses;
    if (totalNotes === 0) return 0;
    // Système de pondération: perfect = 100%, good = 66%, ok = 33%
    const weightedSum = hits.perfect + hits.good * 0.66 + hits.ok * 0.33;
    return ((weightedSum / totalNotes) * 100).toFixed(2);
  };
  // Attribuer une lettre selon le score
  const calculateGrade = () => {
    const accuracy = parseFloat(calculateAccuracy());
    if (accuracy >= 95) return "S";
    if (accuracy >= 90) return "A";
    if (accuracy >= 80) return "B";
    if (accuracy >= 70) return "C";
    if (accuracy >= 60) return "D";
    return "F";
  };
  return (
    <div className="game-container">
      <div className="game-title">Danse pour le vaisseau</div>
      {!gameOver ? (
        <>
          {/* Game Controls */}
          <div className="game-controls">
            {!isPlaying ? (
              <div className="settings-container">
                <button onClick={startGame} className="start-button">
                  Commencer
                </button>
                {/* Paramètres de jeu */}
                {hasScored ? (
                  <div>
                    <div className="settings-row">
                      <div className="setting-group">
                        <label htmlFor="scrollSpeed" className="setting-label">
                          Vitesse: {scrollSpeed}
                        </label>
                        <input
                          id="scrollSpeed"
                          type="range"
                          min="1"
                          max="10"
                          step="0.5"
                          value={scrollSpeed}
                          onChange={(e) =>
                            setScrollSpeed(parseFloat(e.target.value))
                          }
                          className="setting-slider"
                        />
                      </div>
                      <div className="setting-group">
                        <label htmlFor="approachRate" className="setting-label">
                          Fréquence: {approachRate}
                        </label>
                        <input
                          id="approachRate"
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.1"
                          value={approachRate}
                          onChange={(e) =>
                            setApproachRate(parseFloat(e.target.value))
                          }
                          className="setting-slider"
                        />
                      </div>
                    </div>
                    <div className="setting-group">
                      <label htmlFor="gameTime" className="setting-label">
                        Durée (sec): {gameTime}
                      </label>
                      <input
                        id="gameTime"
                        type="range"
                        min="30"
                        max="180"
                        step="10"
                        value={gameTime}
                        onChange={(e) => setGameTime(parseInt(e.target.value))}
                        className="setting-slider"
                        style={{ width: "12rem" }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {isPlaying && hasScored ? (
              <button onClick={endGame} className="stop-button">
                Arrêter
              </button>
            ) : null}
          </div>
          {isPlaying && (
            <div className="timer-display">
              <div className="timer-text">
                Temps:{" "}
                <span className={timeLeft <= 10 ? "time-critical" : ""}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          )}
          {/* Score Display */}
          {isPlaying && (
            <div className="score-display">
              <div>Score: {score}</div>
              <div>Précision: {calculateAccuracy()}</div>
              <div>
                Combo: <span className="combo-count">{combo}</span>{" "}
                <span className="multiplier">x{multiplier}</span>
              </div>
              <div>
                Ratés: <span className="misses-count">{misses}</span>
              </div>
            </div>
          )}
          {/* Hit Indicator */}
          {lastHit && (
            <div
              className={`hit-indicator ${
                lastHit.type === "PERFECT"
                  ? "hit-perfect"
                  : lastHit.type === "GOOD"
                  ? "hit-good"
                  : "hit-ok"
              }`}
            >
              {lastHit.type} !
            </div>
          )}
          {/* Game Area */}
          <div ref={gameRef} className="game-area">
            {/* Lanes */}
            <div ref={containerRef} className="lanes-container">
              {Array(laneCount)
                .fill()
                .map((_, index) => (
                  <div
                    key={index}
                    className={`lane ${
                      index === 0
                        ? "lane-red"
                        : index === 1
                        ? "lane-blue"
                        : index === 2
                        ? "lane-green"
                        : "lane-yellow"
                    }`}
                  >
                    {/* Lane Label */}
                    <div className="lane-label">
                      {index === 0
                        ? "←"
                        : index === 1
                        ? "↓"
                        : index === 2
                        ? "↑"
                        : "→"}
                    </div>
                  </div>
                ))}
            </div>
            {/* Hit Area */}
            <div className="hit-area" style={{ top: `${hitAreaPosition}px` }} />
            {/* Notes - bien centrées */}
            {notes.map((note) => {
              // Centrer la note dans le couloir
              const laneCenter = note.lane * laneWidths[0] + laneWidths[0] / 2;
              const noteLeft = laneCenter - (laneWidths[0] - noteWidth) / 2;
              return (
                <div
                  key={note.id}
                  className={`note ${
                    note.hit
                      ? "note-hit"
                      : note.lane === 0
                      ? "note-red"
                      : note.lane === 1
                      ? "note-blue"
                      : note.lane === 2
                      ? "note-green"
                      : "note-yellow"
                  }`}
                  style={{
                    left: `${noteLeft}px`,
                    top: `${note.y}px`,
                    width: `${laneWidths[0] * 0.5}px`,
                  }}
                />
              );
            })}
          </div>
        </>
      ) : (
        /* Game Over Screen */
        <div className="results-screen">
          <h2 className="results-title">Résultats</h2>
          <div className="grade">{calculateGrade()}</div>
          <div className="results-grid">
            <div className="label">Score:</div>
            <div>{score}</div>
            <div className="label">Combo Max:</div>
            <div>{maxCombo}</div>
            <div className="label">Précision:</div>
            <div>{calculateAccuracy()}%</div>
          </div>
          <div className="details-container">
            <h3 className="details-title">Détails</h3>
            <div className="details-grid">
              <div className="detail-perfect">Perfect:</div>
              <div>{hits.perfect}</div>
              <div className="detail-good">Good:</div>
              <div>{hits.good}</div>
              <div className="detail-ok">Ok:</div>
              <div>{hits.ok}</div>
              <div className="detail-miss">Miss:</div>
              <div>{misses}</div>
            </div>
          </div>
          <button
            onClick={() => {
              if (calculateGrade() === "D" || calculateGrade() === "F") {
                onComplete(false);
                music.pause();
              } else {
                onComplete(true);
                music.pause();
              }
            }}
            className="continue-button"
          >
            Continuer
          </button>
          <button
            onClick={() => {
              setGameOver(false);
              setHasScored(true);
              music.pause();
            }}
            className="replay-button"
          >
            Rejouer
          </button>
        </div>
      )}
      {/* Instructions */}
      {!isPlaying && !gameOver && (
        <div className="instructions">
          <p>
            Utilisez les flèches directionnelles pour frapper les notes quand
            elles atteignent la barre blanche.
          </p>
          <p style={{ marginTop: "0.5rem" }}>
            <span className="key">←</span>
            <span className="key">↓</span>
            <span className="key">↑</span>
            <span className="key">→</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default RhythmGame;
