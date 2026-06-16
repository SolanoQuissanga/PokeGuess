// api.js - Comunicação com a PokéAPI

const BASE = 'https://pokeapi.co/api/v2';
const cache = new Map();

async function fetchJSON(url) {
  // Se já está em cache, devolve sem fazer pedido à API
  if (cache.has(url)) return cache.get(url);

  try {
    const res = await fetch(url);

    // Tratamento de erros HTTP
    if (res.status === 404) throw new Error('Recurso não encontrado: ' + url);
    if (res.status === 429) throw new Error('Demasiados pedidos à API. Tenta mais tarde.');
    if (!res.ok) throw new Error('Erro HTTP ' + res.status + ': ' + url);

    const data = await res.json();

    // Guarda em cache para não repetir o pedido
    cache.set(url, data);
    return data;

  } catch (err) {
    // Se for erro de rede (sem ligação)
    if (err.name === 'TypeError') {
      throw new Error('Sem ligação à Internet. Verifica a tua conexão.');
    }
    throw err;
  }
}

async function getTotalCount() {
  const data = await fetchJSON(`${BASE}/pokemon-species?limit=1`);
  return data.count;
}

async function getPokemonByGeneration(genId) {
  const data = await fetchJSON(`${BASE}/generation/${genId}`);
  return data.pokemon_species.map(s => s.name);
}

async function getPokemon(nameOrId) {
  return await fetchJSON(`${BASE}/pokemon/${nameOrId}`);
}

async function getSpecies(name) {
  return await fetchJSON(`${BASE}/pokemon-species/${name}`);
}

async function getEvolutionChain(url) {
  return await fetchJSON(url);
}