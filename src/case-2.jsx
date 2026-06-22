import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

/*
  Car Memory Match — SEG3125 Assignment 3 (Case 2)
  --------------------------------------------------
  A simple React memory card game. The player picks a difficulty and a
  car category, then flips cards two at a time to find matching pairs.
  The whole app is one file with small, focused components so it is easy
  to follow:
    App           -> holds the screen + game settings, decides what to show
    SetupScreen   -> choose difficulty + category, then start
    GameScreen    -> the board: stats bar + grid of cards
    Card          -> a single flip card (a <button> for accessibility)
    ResultsScreen -> shows time, moves, accuracy and the best record
*/

// ---------------------------------------------------------------------------
// 1. DATA
// ---------------------------------------------------------------------------

// Difficulty levels. `pairs` is how many matching pairs the board has.
const DIFFICULTIES = {
  easy: { label: "Easy", pairs: 4 },
  medium: { label: "Medium", pairs: 8 },
  hard: { label: "Hard", pairs: 12 },
};

// Each category has 12 cars (enough for the hardest level). Every car has an
// emoji (purely decorative) and a name (used as the accessible label and as
// the unique value we match on).
const CATEGORIES = {
  jdm: {
    label: "JDM Cars",
    blurb: "Japanese legends",
    // `brand` is the logo slug (see logoUrl); `emoji` is the fallback if the
    // logo image fails to load.
    cars: [
      { emoji: "🏎️", name: "Supra", brand: "toyota" },
      { emoji: "🚗", name: "Skyline GT-R", brand: "nissan" },
      { emoji: "🏁", name: "RX-7", brand: "mazda" },
      { emoji: "⚡", name: "NSX", brand: "acura" },
      { emoji: "🔴", name: "Civic Type R", brand: "honda" },
      { emoji: "🌀", name: "Lancer Evo", brand: "mitsubishi" },
      { emoji: "💨", name: "WRX STI", brand: "subaru" },
      { emoji: "🛞", name: "Silvia", brand: "nissan" },
      { emoji: "🎌", name: "Integra", brand: "acura" },
      { emoji: "🐉", name: "Miata", brand: "mazda" },
      { emoji: "🌸", name: "AE86", brand: "toyota" },
      { emoji: "⭐", name: "350Z", brand: "nissan" },
    ],
  },
  supercars: {
    label: "Supercars",
    blurb: "Exotic hypercars",
    cars: [
      { emoji: "🐎", name: "Ferrari", brand: "ferrari" },
      { emoji: "🐂", name: "Lamborghini", brand: "lamborghini" },
      { emoji: "🧡", name: "McLaren", brand: "mclaren" },
      { emoji: "💎", name: "Bugatti", brand: "bugatti" },
      { emoji: "🦅", name: "Pagani", brand: "pagani" },
      { emoji: "👑", name: "Koenigsegg", brand: "koenigsegg" },
      { emoji: "🛡️", name: "Porsche", brand: "porsche" },
      { emoji: "🪽", name: "Aston Martin", brand: "aston-martin" },
      { emoji: "🇺🇸", name: "Ford GT", brand: "ford" },
      { emoji: "🏆", name: "Corvette", brand: "chevrolet" },
      { emoji: "🔵", name: "Audi R8", brand: "audi" },
      { emoji: "🌿", name: "Lotus", brand: "lotus" },
    ],
  },
  muscle: {
    label: "Muscle Cars",
    blurb: "American V8 power",
    cars: [
      { emoji: "🐴", name: "Mustang", brand: "ford" },
      { emoji: "🔶", name: "Camaro", brand: "chevrolet" },
      { emoji: "😈", name: "Challenger", brand: "dodge" },
      { emoji: "⚔️", name: "Charger", brand: "dodge" },
      { emoji: "🔥", name: "Firebird", brand: "pontiac" },
      { emoji: "🦾", name: "GTO", brand: "pontiac" },
      { emoji: "💥", name: "Chevelle", brand: "chevrolet" },
      { emoji: "🏃", name: "Road Runner", brand: "plymouth" },
      { emoji: "🐟", name: "Barracuda", brand: "plymouth" },
      { emoji: "✨", name: "Nova", brand: "chevrolet" },
      { emoji: "🦅", name: "Trans Am", brand: "pontiac" },
      { emoji: "🟠", name: "Dart", brand: "dodge" },
    ],
  },
};

// ---------------------------------------------------------------------------
// 2. HELPERS
// ---------------------------------------------------------------------------

// Build the URL for a brand logo. Logos come from the public car-logos-dataset
// served over the jsDelivr CDN (same CDN family as Bootstrap in this project).
function logoUrl(brand) {
  return `https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb/${brand}.png`;
}

// Fisher-Yates shuffle: returns a new shuffled copy of the array.
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Build the deck for a game: pick `pairs` cars from the category, duplicate
// each one (so every card has a partner), then shuffle the whole thing.
function buildDeck(categoryKey, pairs) {
  const cars = CATEGORIES[categoryKey].cars.slice(0, pairs);
  const deck = [];
  cars.forEach((car) => {
    // Two cards per car. `value` is what we compare to detect a match.
    const face = { value: car.name, name: car.name, emoji: car.emoji, brand: car.brand };
    deck.push({ ...face });
    deck.push({ ...face });
  });
  // Give every card a stable id and its starting flags, then shuffle.
  return shuffle(deck).map((card, index) => ({
    ...card,
    id: index,
    flipped: false,
    matched: false,
  }));
}

// Turn a number of seconds into "M:SS" for display.
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// --- localStorage: best record (time + moves) per difficulty ---------------
const bestKey = (difficulty) => `carMemoryBest_${difficulty}`;

function getBest(difficulty) {
  try {
    const raw = localStorage.getItem(bestKey(difficulty));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // localStorage may be unavailable (private mode, etc.)
  }
}

// Save the record only if it beats the stored time. Returns true if it is a
// new best so the results screen can celebrate it.
function saveBest(difficulty, result) {
  const previous = getBest(difficulty);
  if (!previous || result.time < previous.time) {
    try {
      localStorage.setItem(bestKey(difficulty), JSON.stringify(result));
    } catch {
      /* ignore write errors */
    }
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// 3. SETUP SCREEN
// ---------------------------------------------------------------------------

function SetupScreen({ difficulty, setDifficulty, category, setCategory, onStart }) {
  return (
    <div className="cm-panel mx-auto">
      <div className="text-center mb-4">
        <span className="cm-eyebrow">Memory Game</span>
        <h1 className="cm-title">Car Memory Match</h1>
        <p className="text-white-50 mb-0">
          Flip the cards and match every pair of cars. Fewer moves and a faster
          time means a better score.
        </p>
      </div>

      {/* Difficulty group (proximity: related controls sit together) */}
      <fieldset className="cm-group">
        <legend className="cm-group-label">1 · Choose difficulty</legend>
        <div className="cm-options" role="radiogroup" aria-label="Difficulty">
          {Object.entries(DIFFICULTIES).map(([key, info]) => {
            const best = getBest(key);
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={difficulty === key}
                className={
                  "cm-option" + (difficulty === key ? " cm-option--active" : "")
                }
                onClick={() => setDifficulty(key)}
              >
                <span className="cm-option-title">{info.label}</span>
                <span className="cm-option-sub">{info.pairs} pairs</span>
                {best && (
                  <span className="cm-option-best">Best {formatTime(best.time)}</span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Category group */}
      <fieldset className="cm-group">
        <legend className="cm-group-label">2 · Choose a category</legend>
        <div className="cm-options" role="radiogroup" aria-label="Category">
          {Object.entries(CATEGORIES).map(([key, info]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={category === key}
              className={
                "cm-option" + (category === key ? " cm-option--active" : "")
              }
              onClick={() => setCategory(key)}
            >
              <span className="cm-option-emoji" aria-hidden="true">
                {info.cars[0].emoji}
              </span>
              <span className="cm-option-title">{info.label}</span>
              <span className="cm-option-sub">{info.blurb}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="text-center mt-4">
        <button type="button" className="btn btn-danger btn-lg px-5" onClick={onStart}>
          Start game
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. CARD
// ---------------------------------------------------------------------------

function Card({ card, onClick, disabled }) {
  // A card is "open" when it is flipped face-up or already matched.
  const isOpen = card.flipped || card.matched;
  const label = isOpen ? card.name : "Hidden card";

  // If the brand logo image fails to load (offline / 404), fall back to the
  // emoji so the card is never blank and the game stays playable.
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <button
      type="button"
      className={
        "cm-card" +
        (isOpen ? " cm-card--open" : "") +
        (card.matched ? " cm-card--matched" : "")
      }
      onClick={() => onClick(card)}
      // Disable while the board is locked, or when this card is already shown.
      disabled={disabled || isOpen}
      aria-label={label}
      aria-pressed={isOpen}
    >
      <span className="cm-card-inner">
        {/* Back of the card (what you see when face-down) */}
        <span className="cm-card-face cm-card-back" aria-hidden="true">
          🚘
        </span>
        {/* Front of the card (the car): brand logo on a light badge + name */}
        <span className="cm-card-face cm-card-front">
          <span className="cm-logo-badge" aria-hidden="true">
            {logoFailed ? (
              <span className="cm-card-emoji">{card.emoji}</span>
            ) : (
              <img
                className="cm-card-logo"
                src={logoUrl(card.brand)}
                alt=""
                loading="lazy"
                onError={() => setLogoFailed(true)}
              />
            )}
          </span>
          <span className="cm-card-name">{card.name}</span>
        </span>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// 5. GAME SCREEN
// ---------------------------------------------------------------------------

function GameScreen({ difficulty, category, onWin, onRestart, onExit }) {
  const totalPairs = DIFFICULTIES[difficulty].pairs;

  const [cards, setCards] = useState(() => buildDeck(category, totalPairs));
  const [flipped, setFlipped] = useState([]); // ids of the face-up unmatched cards
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [locked, setLocked] = useState(false); // true while two cards are compared
  const [running, setRunning] = useState(false); // timer starts on first flip

  const timerRef = useRef(null);

  // Timer: tick every second while the game is running.
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  // Win check: when every pair is matched, stop the timer and report up.
  useEffect(() => {
    if (matches > 0 && matches === totalPairs) {
      setRunning(false);
      clearInterval(timerRef.current);
      const accuracy = Math.round((totalPairs / moves) * 100);
      onWin({ time: seconds, moves, accuracy });
    }
  }, [matches, totalPairs]);

  function handleCardClick(card) {
    if (locked || card.flipped || card.matched) return;
    if (!running) setRunning(true); // start the clock on the first flip

    // Flip this card face-up.
    const newFlipped = [...flipped, card.id];
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, flipped: true } : c))
    );
    setFlipped(newFlipped);

    // When two cards are up, count a move and check for a match.
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [firstId, secondId] = newFlipped;
      const first = cards.find((c) => c.id === firstId);
      const second = card;

      if (first.value === second.value) {
        // Match! Mark both as matched and unlock right away.
        setCards((prev) =>
          prev.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, matched: true }
              : c
          )
        );
        setMatches((n) => n + 1);
        setFlipped([]);
        setLocked(false);
      } else {
        // No match: flip both back after a short pause so the player can see.
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, flipped: false }
                : c
            )
          );
          setFlipped([]);
          setLocked(false);
        }, 800);
      }
    }
  }

  // Restart: rebuild a fresh shuffled deck and reset every counter.
  function restart() {
    clearInterval(timerRef.current);
    setCards(buildDeck(category, totalPairs));
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setSeconds(0);
    setLocked(false);
    setRunning(false);
    onRestart();
  }

  const progress = Math.round((matches / totalPairs) * 100);

  return (
    <div className="cm-game">
      {/* Stats bar (proximity: all live game info grouped in one strip) */}
      <div className="cm-statsbar">
        <div className="cm-stats">
          <div className="cm-stat">
            <span className="cm-stat-label">Time</span>
            <span className="cm-stat-value">{formatTime(seconds)}</span>
          </div>
          <div className="cm-stat">
            <span className="cm-stat-label">Moves</span>
            <span className="cm-stat-value">{moves}</span>
          </div>
          <div className="cm-stat">
            <span className="cm-stat-label">Pairs</span>
            <span className="cm-stat-value">
              {matches} / {totalPairs}
            </span>
          </div>
        </div>
        <div className="cm-actions">
          <button type="button" className="btn btn-outline-light btn-sm" onClick={restart}>
            Restart
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onExit}>
            Quit
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      <div
        className="progress cm-progress"
        role="progressbar"
        aria-label="Matched pairs progress"
        aria-valuenow={matches}
        aria-valuemin={0}
        aria-valuemax={totalPairs}
      >
        <div className="progress-bar bg-danger" style={{ width: `${progress}%` }} />
      </div>

      {/* Card grid — a data attribute lets CSS pick the column count */}
      <div className="cm-grid" data-difficulty={difficulty}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onClick={handleCardClick}
            disabled={locked}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. RESULTS SCREEN
// ---------------------------------------------------------------------------

function ResultsScreen({ result, difficulty, category, isNewBest, onPlayAgain, onChangeSetup }) {
  const best = getBest(difficulty);

  return (
    <div className="cm-panel cm-results mx-auto text-center">
      <span className="cm-eyebrow">{isNewBest ? "New best time!" : "Well done"}</span>
      <h1 className="cm-title">You matched them all!</h1>
      <p className="text-white-50">
        {CATEGORIES[category].label} · {DIFFICULTIES[difficulty].label}
      </p>

      <div className="cm-result-grid">
        <div className="cm-result-card">
          <span className="cm-result-value">{formatTime(result.time)}</span>
          <span className="cm-result-label">Time</span>
        </div>
        <div className="cm-result-card">
          <span className="cm-result-value">{result.moves}</span>
          <span className="cm-result-label">Moves</span>
        </div>
        <div className="cm-result-card">
          <span className="cm-result-value">{result.accuracy}%</span>
          <span className="cm-result-label">Accuracy</span>
        </div>
      </div>

      {best && (
        <p className="cm-best-line">
          Best for {DIFFICULTIES[difficulty].label}:{" "}
          <strong>{formatTime(best.time)}</strong> in {best.moves} moves
        </p>
      )}

      <div className="cm-result-actions">
        <button type="button" className="btn btn-danger btn-lg px-4" onClick={onPlayAgain}>
          Play again
        </button>
        <button
          type="button"
          className="btn btn-outline-light btn-lg px-4"
          onClick={onChangeSetup}
        >
          Change setup
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. APP (top-level state machine)
// ---------------------------------------------------------------------------

function App() {
  const [screen, setScreen] = useState("setup"); // "setup" | "playing" | "results"
  const [difficulty, setDifficulty] = useState("easy");
  const [category, setCategory] = useState("jdm");
  const [result, setResult] = useState(null);
  const [isNewBest, setIsNewBest] = useState(false);
  // Changing this key remounts GameScreen, which gives us a fresh board.
  const [gameKey, setGameKey] = useState(0);

  function handleStart() {
    setGameKey((k) => k + 1);
    setScreen("playing");
  }

  function handleWin(finalResult) {
    setResult(finalResult);
    setIsNewBest(saveBest(difficulty, finalResult));
    setScreen("results");
  }

  function playAgain() {
    setGameKey((k) => k + 1);
    setScreen("playing");
  }

  return (
    <div className="cm-app">
      {/* Small top bar to get back to the portfolio */}
      <header className="cm-topbar">
        <span className="cm-brand">
          Car<span className="text-danger">Memory</span>
        </span>
        <a className="cm-home" href="index.html">
          ← Portfolio
        </a>
      </header>

      <main className="cm-main">
        {screen === "setup" && (
          <SetupScreen
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            category={category}
            setCategory={setCategory}
            onStart={handleStart}
          />
        )}

        {screen === "playing" && (
          <GameScreen
            key={gameKey}
            difficulty={difficulty}
            category={category}
            onWin={handleWin}
            onRestart={() => {}}
            onExit={() => setScreen("setup")}
          />
        )}

        {screen === "results" && (
          <ResultsScreen
            result={result}
            difficulty={difficulty}
            category={category}
            isNewBest={isNewBest}
            onPlayAgain={playAgain}
            onChangeSetup={() => setScreen("setup")}
          />
        )}
      </main>

      <footer className="cm-footer">
        <p className="mb-0 small">Car Memory Match · Designed by Yusuf Khan</p>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
