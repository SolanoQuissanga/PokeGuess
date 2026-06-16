// main.js 

// SONS - gerados com Web Audio API (sem ficheiros externos)
function playSound(type) {
  const settings = JSON.parse(localStorage.getItem('pokeguess_settings')) || {};
  if (settings.sound === false) return;

  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'correct') {
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } else if (type === 'wrong') {
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } else if (type === 'gameover') {
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.setValueAtTime(300, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(200, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }
}

// Função para mostrar um ecrã e esconder os outros
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
  });
  const target = document.getElementById(id);
  target.classList.add('active');
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
document.getElementById('btn-play-again').addEventListener('click', async () => {
  const mode = getState().mode;
  const difficulty = getState().difficulty;
  clearSession();
  showScreen('screen-game');
  await initGame(mode, difficulty);
  await nextRound();
});

document.getElementById('btn-menu').addEventListener('click', () => {
  clearSession();
  showScreen('screen-start');
});

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

  const bar = document.getElementById('timer-bar');
  if (pct <= 25) bar.style.background = '#e74c3c';
  else if (pct <= 50) bar.style.background = 'orange';
  else bar.style.background = '#2ecc71';
});

// Inicia uma nova ronda
async function nextRound() {
  modeState = {};
  const mode = getState().mode;

  document.getElementById('answer-zone').style.display = 'flex';
  document.getElementById('answer-input').value = '';
  document.getElementById('feedback').className = 'hidden';
  document.getElementById('feedback').textContent = '';

  let pokemonData;

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
  const mode = getState().mode;

  if (isCorrect) {
    feedback.className = 'feedback-correct';
    feedback.innerHTML = `Correto! +${points} pontos`;
    revealPokemon();
    playSound('correct');
  } else {
    const nomeCorreto = mode === 'evolution' ? modeState.answer : round.pokemon.name;

    // Vai buscar o sprite da resposta correta via API (já está em cache)
    let spriteCorreto = '';
    try {
      const pokemonCorreto = await getPokemon(nomeCorreto);
      spriteCorreto = getSprite(pokemonCorreto);
    } catch {
      spriteCorreto = '';
    }

    feedback.className = 'feedback-wrong';
    feedback.innerHTML = `
      Errado! A resposta era <b>${nomeCorreto}</b>!
      ${spriteCorreto ? `<br><img src="${spriteCorreto}" style="width:100px; margin-top:0.5rem">` : ''}
    `;
    playSound('wrong');
  }

  updateHUD();

  await new Promise(r => setTimeout(r, 2000));

  if (getState().lives <= 0) {
    playSound('gameover');
    const s = getState();
    document.getElementById('gameover-title').textContent = 'Fim de Jogo!';
    document.getElementById('gameover-score').textContent = `Pontuação: ${s.score} pontos`;
    document.getElementById('gameover-stats').textContent = `Acertos: ${s.hits} | Melhor streak: ${s.maxStreak}`;
    showScreen('screen-gameover');
  } else {
    await nextRound();
  }
});

// Chamado pelo motor quando o jogo termina
on('gameOver', () => {
  // tratado no roundEnd para mostrar feedback antes
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

  const ordenado = [...history].sort((a, b) => b.score - a.score);

  ordenado.forEach((g, i) => {
    const div = document.createElement('div');
    div.style = 'padding:0.5rem; border-bottom:1px solid #2e2e50; display:flex; justify-content:space-between';
    div.innerHTML = `
      <span>#${i + 1} — ${g.date} — ${g.mode} / ${g.difficulty}</span>
      <b style="color:var(--primary)">${g.score} pts</b>
    `;
    list.appendChild(div);
  });
}

document.getElementById('btn-export-csv').addEventListener('click', exportCSV);

// Mostra o ecrã inicial ao carregar a página
showScreen('screen-start');

// Botão definições
document.getElementById('btn-settings').addEventListener('click', () => {
  const settings = JSON.parse(localStorage.getItem('pokeguess_settings')) || {};
  if (settings.name) document.getElementById('input-name').value = settings.name;
  if (settings.difficulty) document.getElementById('input-difficulty').value = settings.difficulty;
  if (settings.time) document.getElementById('input-time').value = settings.time;
  document.getElementById('input-sound').checked = settings.sound !== false;
  showScreen('screen-settings');
});

// Botão voltar das definições
document.getElementById('btn-back-settings').addEventListener('click', () => {
  showScreen('screen-start');
});

// Guardar definições
document.getElementById('form-settings').addEventListener('submit', (e) => {
  e.preventDefault();

  const settings = {
    name:       document.getElementById('input-name').value,
    difficulty: document.getElementById('input-difficulty').value,
    time:       document.getElementById('input-time').value,
    sound:      document.getElementById('input-sound').checked,
  };

  localStorage.setItem('pokeguess_settings', JSON.stringify(settings));
  alert('Definições guardadas!');
  showScreen('screen-start');
});