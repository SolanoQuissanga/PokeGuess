// storage.js - Guardar dados no localStorage

function getHistory() {
  return JSON.parse(localStorage.getItem('pokeguess_history')) || [];
}

function saveGame(record) {
  const history = getHistory();
  history.unshift(record); // adiciona no início
  localStorage.setItem('pokeguess_history', JSON.stringify(history));
}

function saveSession(data) {
  localStorage.setItem('pokeguess_session', JSON.stringify(data));
}

function loadSession() {
  return JSON.parse(localStorage.getItem('pokeguess_session'));
}

function clearSession() {
  localStorage.removeItem('pokeguess_session');
}

function exportCSV() {
  const history = getHistory();
  if (history.length === 0) {
    alert('Sem histórico para exportar.');
    return;
  }

  const header = 'data,modo,dificuldade,pontuacao,acertos,maiorStreak';
  const rows = history.map(g =>
    `${g.date},${g.mode},${g.difficulty},${g.score},${g.hits},${g.maxStreak}`
  );

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'historico.csv';
  a.click();
  URL.revokeObjectURL(url);
}