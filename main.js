// main.js 

// Função para mostrar um ecrã e esconder os outros
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Variável para guardar o estado do modo atual
let modeState = {};

// Botão iniciar jogo
document.getElementById('btn-start').addEventListener('click', async () => {
  const mode       = document.querySelector('input[name="mode"]:checked').value;
  const difficulty = document.querySelector('input[name="difficulty"]:checked').value;

  showScreen('screen-game');

  await initGame(mode, difficulty);
  await nextRound();
});

// Botão histórico
document.getElementById('btn-history').addEventListener('click', () => {
  showHistory();
  showScreen('screen-history');
});

// Botão voltar do histórico
document.getElementById('btn-back-history').addEventListener('click', () => {
  showScreen('screen-start');
});

// Botão abandonar
document.getElementById('btn-quit').addEventListener('click', () => {
  stopTimer();
  showScreen('screen-start');
});

// Botões de fim de jogo
document.getElementById('btn-play-again').addEventListener('click', () => showScreen('screen-start'));
document.getElementById('btn-menu').addEventListener('click', () => showScreen('screen-start'));





// Atualiza as vidas, pontos e streak
function updateHUD() {
  const s = getState();
  document.getElementById('lives').textContent  = s.lives + ' vidas';
  document.getElementById('score').textContent  = s.score;
  document.getElementById('streak').textContent = s.streak;
}

// Atualiza a barra de tempo a cada segundo
on('tick', (segundosLeft, total) => {
  const pct = (segundosLeft / total) * 100;
  document.getElementById('timer-bar').style.width = pct + '%';
  document.getElementById('timer-text').textContent = segundosLeft + 's';

  // Muda a cor conforme o tempo restante
  const bar = document.getElementById('timer-bar');
  if (pct <= 25) bar.style.background = '#e74c3c';       // vermelho
  else if (pct <= 50) bar.style.background = 'orange';   // laranja
  else bar.style.background = '#2ecc71';                  // verde
});




// Inicia uma nova ronda
async function nextRound() {
  modeState = {};
  const mode = getState().mode;

  // Mostra o input de texto (pode ter sido escondido no modo typegen)
  document.getElementById('answer-zone').style.display = 'flex';
  document.getElementById('answer-input').value = '';
  document.getElementById('feedback').className = 'hidden';
  document.getElementById('feedback').textContent = '';

  let pokemonData;

  // Modo evolução pode precisar de tentar vários Pokémon
  if (mode === 'evolution') {
    let valid = false;
    while (!valid) {
      pokemonData = await pickPokemon();
      modeState = await setupEvolution(pokemonData.pokemon, pokemonData.species);
      valid = modeState.valid;
    }
  } else {
    pokemonData = await pickPokemon();

    if (mode === 'silhouette') {
      setupSilhouette(pokemonData.pokemon);
    } else if (mode === 'stats') {
      setupStats(pokemonData.pokemon);
    } else if (mode === 'typegen') {
      setupTypeGen(pokemonData.pokemon, pokemonData.species, getState().pool);
    }
  }

  startRound(pokemonData.pokemon, pokemonData.species);
  updateHUD();
  document.getElementById('answer-input').focus();
}




// Submeter resposta com o botão ou Enter
document.getElementById('btn-submit').addEventListener('click', submeterResposta);
document.getElementById('answer-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') submeterResposta();
});

function submeterResposta() {
  const input = document.getElementById('answer-input').value.trim();
  if (!input) return;

  const mode = getState().mode;

  if (mode === 'evolution') {
    // Compara com a resposta guardada no modeState
    submitChoice(input.toLowerCase() === modeState.answer.toLowerCase());
  } else {
    submitAnswer(input);
  }
}

// Pista com botão ou tecla H
document.getElementById('btn-hint').addEventListener('click', pedirPista);
document.addEventListener('keydown', e => {
  if (e.key === 'h' || e.key === 'H') {
    if (document.activeElement !== document.getElementById('answer-input')) {
      pedirPista();
    }
  }
});

function pedirPista() {
  const mode  = getState().mode;
  const round = getRound();
  if (!round.pokemon || round.answered) return;

  useHint();
  const hintsUsed = getRound().hintsUsed - 1;

  let hint = null;
  if (mode === 'silhouette') hint = getHintSilhouette(round.pokemon, round.species, hintsUsed);
  else if (mode === 'stats') hint = getHintStats(round.pokemon, hintsUsed);
  else if (mode === 'evolution') hint = getHintEvolution(modeState.answer, hintsUsed);

  if (!hint) {
    alert('Sem mais pistas!');
    return;
  }

  const hintsDiv = document.getElementById('hints');
  if (hintsDiv) {
    const chip = document.createElement('p');
    chip.innerHTML = hint;
    hintsDiv.appendChild(chip);
  }
}





// Chamado pelo motor quando a ronda termina
on('roundEnd', async (isCorrect, points) => {
  const round = getRound();
  const feedback = document.getElementById('feedback');

  if (isCorrect) {
    feedback.className = 'feedback-correct';
    feedback.textContent = `Correto! +${points} pontos`;
    revealPokemon();
  } else {
    feedback.className = 'feedback-wrong';
    feedback.textContent = `Errado! Era ${round.pokemon.name}!`;
    revealPokemon();
  }

  updateHUD();

  // Espera 2 segundos e passa para a próxima ronda
  await new Promise(r => setTimeout(r, 2000));

  if (getState().lives > 0) {
    await nextRound();
  }
});

// Chamado pelo motor quando o jogo termina
on('gameOver', () => {
  const s = getState();
  document.getElementById('gameover-title').textContent = 'Fim de Jogo!';
  document.getElementById('gameover-score').textContent = `Pontuação: ${s.score} pontos`;
  document.getElementById('gameover-stats').textContent = `Acertos: ${s.hits} | Melhor streak: ${s.maxStreak}`;
  showScreen('screen-gameover');
});

// Histórico
function showHistory() {
  const history = getHistory();
  const list = document.getElementById('history-list');
  list.innerHTML = '';

  if (history.length === 0) {
    list.innerHTML = '<p>Sem partidas registadas.</p>';
    return;
  }

  history.forEach(g => {
    const div = document.createElement('div');
    div.style = 'padding:0.5rem; border-bottom:1px solid #2e2e50';
    div.innerHTML = `<b>${g.date}</b> — ${g.mode} / ${g.difficulty} — <b>${g.score} pts</b>`;
    list.appendChild(div);
  });
}

document.getElementById('btn-export-csv').addEventListener('click', exportCSV);