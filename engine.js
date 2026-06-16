// engine.js - Motor do jogo

const DIFFICULTY = {
  easy:   { gens: [1],    time: 60 },
  medium: { gens: [1,2],  time: 40 },
  hard:   { gens: null,   time: 20 },
};

let state = {
  mode: '',
  difficulty: '',
  lives: 3,
  score: 0,
  streak: 0,
  maxStreak: 0,
  hits: 0,
  pool: [],
  used: [],
};

let round = {
  pokemon: null,
  species: null,
  hintsUsed: 0,
  timeTotal: 0,
  startTime: 0,
  answered: false,
};

let timerInterval = null;
let onRoundEnd = null;
let onTick = null;
let onGameOver = null;

async function initGame(mode, difficulty) {
  state.mode = mode;
  state.difficulty = difficulty;
  state.lives = 3;
  state.score = 0;
  state.streak = 0;
  state.maxStreak = 0;
  state.hits = 0;
  state.used = [];

  const cfg = DIFFICULTY[difficulty];
  if (cfg.gens === null) {
    // Difícil: carrega nomes de todas as gerações
    state.pool = [];
    for (let g = 1; g <= 9; g++) {
      try {
        const names = await getPokemonByGeneration(g);
        state.pool = state.pool.concat(names);
      } catch {
        break;
      }
    }
  } else {
    state.pool = [];
    for (const g of cfg.gens) {
      const names = await getPokemonByGeneration(g);
      state.pool = state.pool.concat(names);
    }
  }
}

async function pickPokemon() {
  let name;
  do {
    const idx = Math.floor(Math.random() * state.pool.length);
    name = state.pool[idx];
  } while (state.used.includes(name));

  state.used.push(name);

  try {
    const pokemon = await getPokemon(name);
    const species = await getSpecies(pokemon.name);
    return { pokemon, species };
  } catch {
    return pickPokemon();
  }
}

function startRound(pokemon, species) {
  round.pokemon = pokemon;
  round.species = species;
  round.hintsUsed = 0;
  round.answered = false;
  round.timeTotal = DIFFICULTY[state.difficulty].time;
  round.startTime = Date.now();

  saveSession({ state, round: { pokemonName: pokemon.name } });
  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  let seconds = round.timeTotal;

  if (onTick) onTick(seconds, round.timeTotal);

  timerInterval = setInterval(() => {
    seconds--;
    if (onTick) onTick(seconds, round.timeTotal);
    if (seconds <= 0) {
      clearInterval(timerInterval);
      endRound(false);
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function getSecondsLeft() {
  const elapsed = Math.floor((Date.now() - round.startTime) / 1000);
  return Math.max(0, round.timeTotal - elapsed);
}

function calcPoints() {
  const streak = Math.min(2.0, 1 + state.streak * 0.1);
  const raw = (100 - 15 * round.hintsUsed) * (getSecondsLeft() / round.timeTotal) * streak;
  return Math.max(10, Math.round(raw));
}

function submitAnswer(answer) {
  if (round.answered) return;
  round.answered = true;
  stopTimer();
  const correct = answer.trim().toLowerCase() === round.pokemon.name.toLowerCase();
  endRound(correct);
}

function submitChoice(isCorrect) {
  if (round.answered) return;
  round.answered = true;
  stopTimer();
  endRound(isCorrect);
}

function endRound(isCorrect) {
  const points = isCorrect ? calcPoints() : 0;

  if (isCorrect) {
    state.streak++;
    state.hits++;
    state.score += points;
    if (state.streak > state.maxStreak) state.maxStreak = state.streak;
  } else {
    state.streak = 0;
    state.lives--;
  }

  if (onRoundEnd) onRoundEnd(isCorrect, points);

  if (state.lives <= 0) {
    endGame();
  }
}

function useHint() {
  round.hintsUsed++;
}

function endGame() {
  clearSession();
  saveGame({
    date: new Date().toISOString().slice(0, 10),
    mode: state.mode,
    difficulty: state.difficulty,
    score: state.score,
    hits: state.hits,
    maxStreak: state.maxStreak,
  });
  if (onGameOver) onGameOver();
}

function on(event, cb) {
  if (event === 'roundEnd') onRoundEnd = cb;
  if (event === 'tick')     onTick = cb;
  if (event === 'gameOver') onGameOver = cb;
}

function getState() { return state; }
function getRound()  { return round; }