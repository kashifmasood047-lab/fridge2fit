let selectedGoal = 'bulk';
let history = [];

document.querySelectorAll('.pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedGoal = btn.dataset.goal;
  });
});

document.querySelectorAll('.navbtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.navbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('resultSection').classList.toggle('hidden', tab !== 'home' || !document.getElementById('resultContent').innerHTML);
    document.querySelector('.card').classList.toggle('hidden', tab !== 'home');
    document.getElementById('historySection').classList.toggle('hidden', tab !== 'history');
    if (tab === 'history') renderHistory();
  });
});

document.getElementById('generateBtn').addEventListener('click', async () => {
  const ingredients = document.getElementById('ingredients').value.trim();
  const notes = document.getElementById('notes').value.trim();

  if (!ingredients) {
    alert('Add at least a few ingredients first.');
    return;
  }

  const resultSection = document.getElementById('resultSection');
  const loading = document.getElementById('loading');
  const resultContent = document.getElementById('resultContent');
  const btn = document.getElementById('generateBtn');

  resultSection.classList.remove('hidden');
  loading.classList.remove('hidden');
  resultContent.innerHTML = '';
  btn.disabled = true;

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients, goal: selectedGoal, notes })
    });

    if (!res.ok) throw new Error('Server error');
    const data = await res.json();

    renderResult(data);
    history.unshift({ ...data, ingredients, goal: selectedGoal, time: new Date().toLocaleString() });
    if (history.length > 10) history.pop();
  } catch (err) {
    resultContent.innerHTML = `<div class="error-box">Something went wrong generating your meal. Please try again.</div>`;
  } finally {
    loading.classList.add('hidden');
    btn.disabled = false;
  }
});

function renderResult(data) {
  const resultContent = document.getElementById('resultContent');
  resultContent.innerHTML = `
    <h2>${escapeHtml(data.mealName || 'Your Meal')}</h2>
    <div class="macros">
      <span class="macro-chip">${data.calories || '?'} kcal</span>
      <span class="macro-chip">${data.protein || '?'}g protein</span>
      <span class="macro-chip">${data.carbs || '?'}g carbs</span>
      <span class="macro-chip">${data.fat || '?'}g fat</span>
    </div>
    <div class="section-title">Ingredients to use</div>
    <ul>${(data.ingredientsUsed || []).map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
    <div class="section-title">How to make it</div>
    <p>${escapeHtml(data.instructions || '')}</p>
    <div class="section-title">Why it fits your goal</div>
    <p>${escapeHtml(data.goalNote || '')}</p>
  `;
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (history.length === 0) {
    list.innerHTML = `<div class="history-item">No meals generated yet this session.</div>`;
    return;
  }
  list.innerHTML = history.map(h => `
    <div class="history-item">
      <div class="h-title">${escapeHtml(h.mealName || 'Meal')}</div>
      <div class="h-meta">${h.goal} • ${h.time}</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
