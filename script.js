const modalities = {
  caps1: { name: 'CAPS I', tag: 'ATENÇÃO PSICOSSOCIAL', description: 'Atende pessoas de todas as idades com intenso sofrimento psíquico.', hours: 'Funcionamento conforme a rede local', context: 'Referência para municípios acima de 15 mil habitantes' },
  caps2: { name: 'CAPS II', tag: 'ATENÇÃO PSICOSSOCIAL', description: 'Atende pessoas de todas as idades com sofrimento psíquico intenso, com acompanhamento multiprofissional no território.', hours: 'Funcionamento conforme a rede local', context: 'Referência para municípios acima de 70 mil habitantes' },
  caps3: { name: 'CAPS III', tag: 'ATENÇÃO 24 HORAS', description: 'Atende pessoas com sofrimento psíquico intenso e oferece acolhimento noturno, inclusive em fins de semana e feriados.', hours: 'Funcionamento 24 horas', context: 'Referência para municípios acima de 150 mil habitantes' },
  capsi: { name: 'CAPS i', tag: 'INFANTOJUVENIL', description: 'Voltado a crianças e adolescentes com sofrimento psíquico intenso, articulando o cuidado com família, escola e território.', hours: 'Funcionamento conforme a rede local', context: 'Referência para municípios acima de 70 mil habitantes' },
  capsad: { name: 'CAPS AD', tag: 'ÁLCOOL E OUTRAS DROGAS', description: 'Acolhe pessoas com necessidades relacionadas ao uso prejudicial de álcool e outras drogas e organiza cuidado singular e em rede.', hours: 'Funcionamento conforme a rede local', context: 'Referência para municípios acima de 70 mil habitantes' },
  capsad3: { name: 'CAPS AD III', tag: 'ÁLCOOL E OUTRAS DROGAS · 24 HORAS', description: 'Modalidade com funcionamento contínuo e acolhimento noturno para pessoas com necessidades relacionadas ao uso prejudicial de álcool e outras drogas.', hours: 'Funcionamento 24 horas', context: 'Referência para municípios acima de 150 mil habitantes' },
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const menuToggle = $('#menu-toggle');
const mainNav = $('#main-nav');
menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  mainNav.classList.toggle('open', open);
});
$$('a', mainNav).forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
}));

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    $('#scroll-progress').style.width = `${total > 0 ? (window.scrollY / total) * 100 : 0}%`;
    scrollTicking = false;
  });
}, { passive: true });

const tablist = $('#modality-tabs');
const tabs = $$('[role="tab"]', tablist);
const modalityPanel = $('#modality-panel');
function selectModality(tab, focus = false) {
  const data = modalities[tab.dataset.key];
  if (!data) return;
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  modalityPanel.setAttribute('aria-labelledby', tab.id);
  $('#modality-tag').textContent = data.tag;
  $('#modality-name').textContent = data.name;
  $('#modality-description').textContent = data.description;
  $('#modality-hours').textContent = data.hours;
  $('#modality-context').textContent = data.context;
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectModality(tab));
  tab.addEventListener('keydown', event => {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectModality(tabs[next], true);
  });
});

$$('.strategy-card details').forEach(detail => detail.addEventListener('toggle', () => {
  if (!detail.open) return;
  $$('.strategy-card details').forEach(other => { if (other !== detail) other.open = false; });
}));

const arrivals = $('#arrivals');
const capacity = $('#capacity');
function updatePlanner() {
  const demand = Number(arrivals.value);
  const available = Number(capacity.value);
  const gap = demand - available;
  $('#arrivals-value').textContent = String(demand);
  $('#capacity-value').textContent = String(available);
  $('#arrivals-bar').style.width = `${(demand / 80) * 100}%`;
  $('#capacity-bar').style.width = `${(available / 80) * 100}%`;
  const result = $('#planner-result');
  if (gap > 0) {
    $('#result-title').textContent = `${gap} chegada${gap === 1 ? '' : 's'} além da capacidade estimada`;
    $('#result-text').textContent = 'Reveja a cobertura do acolhimento, a observação da espera e o apoio possível no turno. A prioridade de cada pessoa depende de avaliação profissional.';
    result.style.background = '#fbede1';
  } else if (gap === 0) {
    $('#result-title').textContent = 'Capacidade estimada no limite';
    $('#result-text').textContent = 'Combine retaguarda e reavaliação da espera caso haja novas chegadas ou mudança nas necessidades do turno.';
    result.style.background = '#f5f0df';
  } else {
    $('#result-title').textContent = `${Math.abs(gap)} acolhimento${gap === -1 ? '' : 's'} de margem estimada`;
    $('#result-text').textContent = 'A margem pode apoiar imprevistos. Mantenha acolhimento aberto e reveja a situação ao longo do turno.';
    result.style.background = '#eaf1eb';
  }
}
arrivals?.addEventListener('input', updatePlanner);
capacity?.addEventListener('input', updatePlanner);
updatePlanner();

const quizForm = $('#quiz-form');
quizForm?.addEventListener('submit', event => {
  event.preventDefault();
  const answer = new FormData(quizForm).get('answer');
  const feedback = $('#quiz-feedback');
  feedback.classList.remove('correct', 'incorrect');
  if (!answer) {
    feedback.textContent = 'Escolha uma alternativa para ver a explicação.';
    return;
  }
  if (answer === 'b') {
    feedback.textContent = 'Isso. Funções claras, escuta inicial e avaliação de prioridades organizam a resposta sem fechar a porta de entrada.';
    feedback.classList.add('correct');
  } else {
    feedback.textContent = 'Vale rever: a ordem de chegada, o cancelamento e o encaminhamento automáticos não substituem acolhimento e avaliação singular.';
    feedback.classList.add('incorrect');
  }
});

const checklist = $$('#checklist-items input[type="checkbox"]');
const storageKey = 'angela-mara-caps-plano-v1';
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) checklist.forEach((item, index) => { item.checked = saved.includes(index); });
} catch (_) { /* O plano continua disponível sem armazenamento. */ }
function updateChecklist() {
  const checked = checklist.filter(item => item.checked).length;
  $('#checklist-count').textContent = `${checked} de ${checklist.length} concluídos`;
  $('#checklist-bar').style.width = `${(checked / checklist.length) * 100}%`;
  try { localStorage.setItem(storageKey, JSON.stringify(checklist.map((item, index) => item.checked ? index : null).filter(index => index !== null))); } catch (_) { /* Sem armazenamento local. */ }
}
checklist.forEach(item => item.addEventListener('change', updateChecklist));
updateChecklist();

let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}
$('#copy-plan')?.addEventListener('click', async () => {
  const lines = checklist.map(item => `${item.checked ? '✓' : '□'} ${$('span', item.parentElement).textContent.trim()}`);
  const text = `Plano de turno · CAPS\n${lines.join('\n')}\n\nMaterial educativo: Psicóloga Angela Mara`;
  try {
    await navigator.clipboard.writeText(text);
    toast('Plano copiado para a área de transferência.');
  } catch (_) {
    const temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    const copied = document.execCommand('copy');
    temp.remove();
    toast(copied ? 'Plano copiado para a área de transferência.' : 'Não foi possível copiar automaticamente.');
  }
});
$('#reset-plan')?.addEventListener('click', () => {
  checklist.forEach(item => { item.checked = false; });
  updateChecklist();
  toast('Plano reiniciado neste navegador.');
});

$$('.faq-list details').forEach(detail => detail.addEventListener('toggle', () => {
  if (!detail.open) return;
  $$('.faq-list details').forEach(other => { if (other !== detail) other.open = false; });
}));
