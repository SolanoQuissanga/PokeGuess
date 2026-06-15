// api.js - Comunicação com a PokéAPI

const BASE = 'https://pokeapi.co/api/v2';
const cache = new Map();

async function fetchJSON(url) {
  if (cache.has(url)) return cache.get(url);

  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro: ' + res.status);
  const data = await res.json();
  cache.set(url, data);
  return data;
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