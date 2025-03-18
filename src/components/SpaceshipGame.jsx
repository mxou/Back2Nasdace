import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

const SpaceshipGame = () => {
  const mountRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    ship: null,
    asteroids: [],
    keys: {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    },
    speed: 0.15,
    frameId: null,
    lastAsteroidTime: 0,
    asteroidInterval: 750, // ms entre chaque astéroïde
    gameActive: true,
  });

  useEffect(() => {
    // Initialisation
    const game = gameRef.current;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Création de la scène
    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x000020);

    // Caméra et renderer
    game.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    game.camera.position.z = 15;

    game.renderer = new THREE.WebGLRenderer({ antialias: true });
    game.renderer.setSize(width, height);
    mountRef.current.appendChild(game.renderer.domElement);

    // Éclairage
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    game.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    game.scene.add(directionalLight);

    // Création du vaisseau spatial
    const shipGeometry = new THREE.ConeGeometry(0.5, 1.5, 16);
    const shipMaterial = new THREE.MeshPhongMaterial({ color: 0x3399ff });
    game.ship = new THREE.Mesh(shipGeometry, shipMaterial);
    game.ship.rotation.x = Math.PI / 2;
    game.ship.position.y = 0;
    game.scene.add(game.ship);

    // Gestionnaires d'événements pour le contrôle du clavier
    const handleKeyDown = (e) => {
      if (game.keys.hasOwnProperty(e.key)) {
        game.keys[e.key] = true;
      }
    };

    const handleKeyUp = (e) => {
      if (game.keys.hasOwnProperty(e.key)) {
        game.keys[e.key] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Fonction pour créer plusieurs astéroïdes à chaque vague
    const createMultipleAsteroids = () => {
      const asteroidCount = Math.min(5, Math.floor(score / 10) + 1); // Le nombre d'astéroïdes augmente avec le score
      for (let i = 0; i < asteroidCount; i++) {
        createAsteroid(); // Appel à la fonction de création d'un astéroïde existante
      }
    };

    // Fonction pour obtenir un multiplicateur de vitesse des astéroïdes en fonction du score
    const getAsteroidSpeedMultiplier = () => {
      return 1 + Math.floor(score / 10) * 0.1; // Augmente la vitesse de 10% toutes les 10 unités de score
    };

    // Fonction pour créer un astéroïde
    const createAsteroid = () => {
      const size = Math.random() * 0.8 + 0.6;
      const asteroidGeometry = new THREE.IcosahedronGeometry(size, 0);
      const asteroidMaterial = new THREE.MeshPhongMaterial({
        color: 0x888888,
        flatShading: true,
      });

      const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

      // Position aléatoire en haut de l'écran
      asteroid.position.x = (Math.random() - 0.5) * 12;
      asteroid.position.y = 10;
      asteroid.position.z = 0;

      // Vitesse et rotation des astéroïdes, avec la multiplication de la vitesse en fonction du score
      const speedMultiplier = getAsteroidSpeedMultiplier();
      asteroid.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05 * speedMultiplier,
          -(Math.random() * 0.15 + 0.05) * speedMultiplier,
          0
        ),
        rotationSpeed: {
          x: Math.random() * 0.05,
          y: Math.random() * 0.05,
          z: Math.random() * 0.05,
        },
      };

      game.scene.add(asteroid);
      game.asteroids.push(asteroid);
    };

    // Vérification des collisions
    const checkCollisions = () => {
      if (!game.ship || !game.gameActive) return false;

      const shipPosition = game.ship.position.clone();
      const shipSize = 0.6; // Rayon approximatif du vaisseau

      for (let asteroid of game.asteroids) {
        const asteroidPosition = asteroid.position.clone();
        const distance = shipPosition.distanceTo(asteroidPosition);
        const asteroidSize = asteroid.geometry.parameters.radius;

        if (distance < shipSize + asteroidSize) {
          return true; // Collision détectée
        }
      }

      return false; // Pas de collision
    };

    // Boucle d'animation principale
    const animate = () => {
      const game = gameRef.current;
      if (!game.gameActive) return;

      // Déplacement du vaisseau
      if (game.keys.ArrowUp && game.ship.position.y < 8) {
        game.ship.position.y += game.speed;
      }
      if (game.keys.ArrowDown && game.ship.position.y > -8) {
        game.ship.position.y -= game.speed;
      }
      if (game.keys.ArrowLeft && game.ship.position.x > -8) {
        game.ship.position.x -= game.speed;
      }
      if (game.keys.ArrowRight && game.ship.position.x < 8) {
        game.ship.position.x += game.speed;
      }

      // Génération d'astéroïdes (plus d'astéroïdes à chaque vague)
      const now = Date.now();
      if (now - game.lastAsteroidTime > game.asteroidInterval) {
        createMultipleAsteroids(); // Appelle la nouvelle fonction pour générer plus d'astéroïdes
        game.lastAsteroidTime = now;

        // Augmentation progressive de la difficulté en réduisant l'intervalle de génération des astéroïdes
        game.asteroidInterval = Math.max(500, game.asteroidInterval - 50);
      }

      // Mise à jour des astéroïdes
      for (let i = game.asteroids.length - 1; i >= 0; i--) {
        const asteroid = game.asteroids[i];

        // Mise à jour de la position
        asteroid.position.add(asteroid.userData.velocity);

        // Rotation
        asteroid.rotation.x += asteroid.userData.rotationSpeed.x;
        asteroid.rotation.y += asteroid.userData.rotationSpeed.y;
        asteroid.rotation.z += asteroid.userData.rotationSpeed.z;

        // Suppression des astéroïdes hors de l'écran
        if (asteroid.position.y < -10) {
          game.scene.remove(asteroid);
          game.asteroids.splice(i, 1);
          setScore((prevScore) => prevScore + 1); // Augmentation du score
        }
      }

      // Vérification des collisions
      if (checkCollisions()) {
        game.gameActive = false;
        setGameOver(true);
      }

      // Rendu
      game.renderer.render(game.scene, game.camera);
      game.frameId = requestAnimationFrame(animate);
    };

    // Démarrage de l'animation
    animate();

    // Nettoyage
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(game.frameId);
      if (mountRef.current && game.renderer?.domElement) {
        mountRef.current.removeChild(game.renderer.domElement);
      }
    };
  }, []);

  const restartGame = () => {
    const game = gameRef.current;

    // Réinitialisation des variables de jeu
    game.gameActive = true;
    setGameOver(false);
    setScore(0);

    // Réinitialisation de la position du vaisseau
    if (game.ship) {
      game.ship.position.set(0, 0, 0);
    }

    // Suppression de tous les astéroïdes
    for (let asteroid of game.asteroids) {
      game.scene.remove(asteroid);
    }
    game.asteroids = [];

    // Réinitialisation de l'intervalle des astéroïdes
    game.lastAsteroidTime = Date.now();
    game.asteroidInterval = 1500;

    // Redémarrage de l'animation
    if (!game.frameId) {
      const animate = () => {
        const game = gameRef.current;
        if (!game.gameActive) return;

        // Code d'animation similaire à celui ci-dessus
        // ...

        game.renderer.render(game.scene, game.camera);
        game.frameId = requestAnimationFrame(animate);
      };

      animate();
    }
  };

  return (
    <div>
      <style>
        {`
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #1d1d3d;
            color: white;
            font-family: 'Arial', sans-serif;
          }
          .game-container {
            position: relative;
            width: 100%;
            height: 600px;
            max-width: 900px;
            border: 2px solid #fff;
            border-radius: 10px;
            margin-top: 20px;
            background-color: #000;
          }
          .score {
            position: absolute;
            top: 10px;
            left: 10px;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 5px 10px;
            border-radius: 5px;
          }
          .gameOver-container {
            background-color: rgba(0, 0, 0, 0.7);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
          }
          .gameOver {
            font-size: 24px;
            font-weight: bold;
            color: #ff5733;
          }
          .finalScore {
            margin-top: 10px;
            font-size: 20px;
          }
          .restart {
            margin-top: 20px;
            background-color: #008cba;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
          }
          .restart:hover {
            background-color: #005f6b;
          }
          .instruction {
            position: absolute;
            bottom: 10px;
            left: 10px;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 14px;
          }
        `}
      </style>

      <div className="container">
        <div ref={mountRef} className="game-container" />

        <div className="score">Score: {score}</div>

        {gameOver && (
          <div className="gameOver-container">
            <h2 className="gameOver">Game Over</h2>
            <p className="finalScore">Score final: {score}</p>
            <button onClick={restartGame} className="restart">
              Rejouer
            </button>
          </div>
        )}

        <div className="instruction">
          Utilisez les flèches du clavier pour déplacer le vaisseau
        </div>
      </div>
    </div>
  );
};

export default SpaceshipGame;
