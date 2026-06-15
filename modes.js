// modes.js - Os 4 modos de jogo

// converte as gerações
function getGenNumber(species) {
  const roman = species.generation.name.split('-')[1].toUpperCase();
  const map = { I:1, II:2, III:3, IV:4, V:5, VI:6, VII:7, VIII:8, IX:9 };
  return map[roman];
}

// Evoluções
function flattenChain(node, result = []) {
  result.push(node.species.name);
  for (const next of node.evolves_to){
flattenChain(next, result);
 }
 return result;
}

//Obtém a imagem do pokémon
function getSprite(pokemon) {
  return pokemon.sprites.other['official-artwork'].front_default
      || pokemon.sprites.front_default;
}

// MODO 1: SILHUETA
//iamgem do pokemon a preto
function setupSilhouette(pokemon) {
  document.getElementById('game-content').innerHTML = `
    <div style="text-align:center">
      <img id="poke-img" src="${getSprite(pokemon)}" style="width:180px; filter:brightness(0)">
    </div>
  `;
}

//remove o filtro
function revealPokemon() {
  const img = document.getElementById('poke-img');
  if (img) img.style.filter = 'brightness(1)';
}

//devolve uma pista 
function getHintSilhouette(pokemon, species, hintsUsed) {
  const hints = [
    `Primeira letra: <b>${pokemon.name[0].toUpperCase()}</b>`,
    `Número de letras: <b>${pokemon.name.length}</b>`,
    `Geração: <b>${getGenNumber(species)}</b>`,
  ];
  return hints[hintsUsed] || null;
}

// MODO 2: ESTATÍSTICAS
//mostra as stats sem revelar o nome
function setupStats(pokemon) {
  const nomes = { 
    hp:'HP', 
    attack:'Ataque', 
    defense:'Defesa',
    'special-attack':'Atq. Esp.',
    'special-defense':'Def. Esp.',
     speed:'Velocidade' 
    };

//cria uma linha por stat
  const rows = pokemon.stats.map(s =>
    `<p>${nomes[s.stat.name]}: <b>${s.base_stat}</b></p>`
  ).join('');

  document.getElementById('game-content').innerHTML = rows;
}

// uma pista por tipo de pokemon
function getHintStats(pokemon, hintsUsed) {
  if (hintsUsed === 0) {
    return `Tipo(s): <b>${pokemon.types.map(t => t.type.name).join(', ')}</b>`;
  }
  return null;
}

// MODO 3: TIPO + GERAÇÃO
//mostra tipo e geração + 4 opções de resposta
function setupTypeGen(pokemon, species, pool) {
  document.getElementById('answer-zone').style.display = 'none';

  //escolhe 3 pokemon errados random 
  const wrong = pool.filter(n => n !== pokemon.name)
    .sort(() => Math.random() - 0.5).slice(0, 3);

  //junta o correto com errados  e mistura
  const options = [pokemon.name, ...wrong].sort(() => Math.random() - 0.5);

  //cria um botão por opção
  const buttons = options.map(name =>
    `<button onclick="handleChoice('${name}')" style="margin:0.3rem;padding:0.6rem 1rem;
     border-radius:8px;background:#1a1a2e;color:#f0f0f0;border:2px solid #2e2e50;cursor:pointer">
      ${name}
    </button>`
  ).join('');

  document.getElementById('game-content').innerHTML = `
    <div style="text-align:center">
      <p>Tipo: <b>${pokemon.types.map(t => t.type.name).join(', ')}</b> | Geração: <b>${getGenNumber(species)}</b></p>
      <div style="margin-top:1rem">${buttons}</div>
    </div>
  `;
}

//chama qd o U clica numa opção
function handleChoice(name) {
  document.querySelectorAll('button').forEach(b => b.disabled = true);
  submitChoice(name === getRound().pokemon.name);
}

// MODO 4: CADEIA EVOLUTIVA
//mostra um pokemon e qual é a evolução(antetior ou seguinte)
async function setupEvolution(pokemon, species) {
  // cadeia evolutiva completa
  const chainData = await getEvolutionChain(species.evolution_chain.url);
  const chain = flattenChain(chainData.chain);

  //encontra a posição do pokemon atual na cadeia
  const idx = chain.findIndex(n => n === pokemon.name);

  if (idx === 0 && chain.length === 1) return { valid: false };

  const hasPrev = idx > 0;
  const hasNext = idx < chain.length - 1;
  //se nao tem evo, é invalido - jogo sorteia outro
  if (!hasPrev && !hasNext) return { valid: false };

  const direction = (hasPrev && hasNext) ? (Math.random() < 0.5 ? 'prev' : 'next')
                  : hasPrev ? 'prev' : 'next';
  const answer = direction === 'prev' ? chain[idx - 1] : chain[idx + 1];

  document.getElementById('game-content').innerHTML = `
    <div style="text-align:center">
      <img src="${getSprite(pokemon)}" style="width:150px">
      <p style="margin-top:1rem">Forma <b>${direction === 'prev' ? 'anterior' : 'seguinte'}</b> de <b>${pokemon.name}</b>?</p>
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