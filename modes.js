function getGenNumber(species) {
  const roman = species.generation.name.split('-')[1].toUpperCase();
  const map = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9 };
  return map[roman];
}

function getSprite(pokemon) {
  return pokemon.sprites.other['official-artwork'].front_default
      || pokemon.sprites.front_default;
}

function flattenChain(node, result = []) {
  result.push(node.species.name);
  for (const next of node.evolves_to) flattenChain(next, result);
  return result;
}

// MODO 1: SILHUETA
function setupSilhouette(pokemon) {
  const img = getSprite(pokemon);
  document.getElementById('game-content').innerHTML = `
    <div style="text-align:center">
      <img id="poke-img" src="${img}" style="filter:brightness(0)">
      <div id="hints"></div>
    </div>
  `;
}

function revealPokemon() {
  const img = document.getElementById('poke-img');
  if (img) img.style.filter = 'brightness(1)';
}

function getHintSilhouette(pokemon, species, hintsUsed) {
  const hints = [
    `Primeira letra: <b>${pokemon.name[0].toUpperCase()}</b>`,
    `Número de letras: <b>${pokemon.name.length}</b>`,
    `Geração: <b>${getGenNumber(species)}</b>`,
  ];
  return hints[hintsUsed] || null;
}

// MODO 2: ESTATÍSTICAS
function setupStats(pokemon) {
  const nomes = {
    hp: 'HP', attack: 'Ataque', defense: 'Defesa',
    'special-attack': 'Atq. Especial',
    'special-defense': 'Def. Especial',
    speed: 'Velocidade'
  };

  const rows = pokemon.stats.map(s =>
    `<p style="display:flex; justify-content:space-between; padding:0.3rem 0; border-bottom:1px solid #2e2e50">
      <span>${nomes[s.stat.name]}</span>
      <b>${s.base_stat}</b>
    </p>`
  ).join('');

  document.getElementById('game-content').innerHTML = `
    <div style="width:100%">
      ${rows}
      <div id="hints" style="margin-top:1rem"></div>
    </div>
  `;
}

function getHintStats(pokemon, hintsUsed) {
  if (hintsUsed === 0) {
    const tipos = pokemon.types.map(t => t.type.name).join(', ');
    return `Tipo(s): <b>${tipos}</b>`;
  }
  return null;
}

// MODO 3: TIPO + GERAÇÃO
function setupTypeGen(pokemon, species, pool) {
  document.getElementById('answer-zone').style.display = 'none';

  const gen  = getGenNumber(species);
  const tipo = pokemon.types.map(t => t.type.name).join(', ');

  // Filtra apenas nomes (remove IDs numéricos)
  const poolNomes = pool.filter(n => isNaN(n));

  const errados = poolNomes
    .filter(n => n !== pokemon.name)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const opcoes = [pokemon.name, ...errados].sort(() => Math.random() - 0.5);

  const buttons = opcoes.map(nome =>
    `<button 
      onclick="handleChoice('${nome}')"
      style="padding:0.6rem 1rem; margin:0.3rem; border-radius:8px;
             background:#1a1a2e; color:#f0f0f0; border:2px solid #2e2e50; cursor:pointer">
      ${nome}
    </button>`
  ).join('');

  document.getElementById('game-content').innerHTML = `
    <div style="text-align:center">
      <p>Tipo: <b>${tipo}</b> | Geração: <b>${gen}</b></p>
      <div style="margin-top:1rem">${buttons}</div>
    </div>
  `;
}

function handleChoice(nome) {
  document.querySelectorAll('#game-content button').forEach(b => b.disabled = true);
  const isCorrect = nome === getRound().pokemon.name;
  submitChoice(isCorrect);
}

// MODO 4: CADEIA EVOLUTIVA
async function setupEvolution(pokemon, species) {
  const chainData = await getEvolutionChain(species.evolution_chain.url);
  const chain = flattenChain(chainData.chain);
  const idx = chain.findIndex(n => n === pokemon.name);

  const hasPrev = idx > 0;
  const hasNext = idx < chain.length - 1;

  if (!hasPrev && !hasNext) return { valid: false };

  let direction;
  if (hasPrev && hasNext) {
    direction = Math.random() < 0.5 ? 'prev' : 'next';
  } else {
    direction = hasPrev ? 'prev' : 'next';
  }

  const answer = direction === 'prev' ? chain[idx - 1] : chain[idx + 1];
  const dirLabel = direction === 'prev' ? 'anterior' : 'seguinte';

  document.getElementById('game-content').innerHTML = `
    <div style="text-align:center">
      <img src="${getSprite(pokemon)}" style="width:150px">
      <p style="margin-top:1rem">
        Qual é a forma <b>${dirLabel}</b> de <b>${pokemon.name}</b>?
      </p>
      <div id="hints" style="margin-top:1rem"></div>
    </div>
  `;

  return { valid: true, answer };
}

function getHintEvolution(answer, hintsUsed) {
  const hints = [
    `Primeira letra: <b>${answer[0].toUpperCase()}</b>`,
    `Número de letras: <b>${answer.length}</b>`,
  ];
  return hints[hintsUsed] || null;
}