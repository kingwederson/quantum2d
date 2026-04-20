// ==================== INTERFACE DO USUÁRIO ====================
let isRunning = true;
let selectedParticleKey = 'electron';

function updateUI() {
  document.getElementById('count').textContent = bodies.length;
  document.getElementById('state').textContent = isRunning ? "Rodando" : "Pausado";
  document.getElementById('btnPause').textContent = isRunning ? "⏸️ Pausar" : "▶️ Retomar";

  if (bodies.length > 0) {
    let avgGamma = 0;
    for (let b of bodies) {
      const vmag = Math.hypot(b.vx, b.vy);
      const beta = Math.min(0.999, vmag / C_LIGHT);
      avgGamma += 1 / Math.sqrt(1 - beta * beta);
    }
    avgGamma /= bodies.length;
    const fillPercent = Math.min(100, (avgGamma - 1) / 5 * 100);
    document.getElementById('energyFill').style.width = Math.max(2, fillPercent) + '%';
  }
}

function createParticleSection(gridId, keys) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = '';

  keys.forEach(key => {
    const def = PARTICLE_DEFS[key];
    if (!def) return;

    const btn = document.createElement('button');
    btn.textContent = def.symbol;
    btn.title = def.name;
    btn.dataset.key = key;

    const hue = def.hue || 200;
    btn.style.background = `hsl(${hue}, 75%, 48%)`;
    btn.style.borderColor = `hsl(${hue}, 85%, 70%)`;

    btn.addEventListener('click', () => {
      document.querySelectorAll('#ui button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedParticleKey = key;
    });

    grid.appendChild(btn);
  });
}

function setupUIEvents() {
  // Cria as seções como no Modelo Padrão
  createParticleSection('leptonsGrid', ['electron','muon','tau','nu_e','nu_mu','nu_tau']);
  createParticleSection('antileptonsGrid', ['positron','antimuon','antitau','anti_nu_e','anti_nu_mu','anti_nu_tau']);
  createParticleSection('quarksGrid', ['up','down','charm','strange','top','bottom']);
  createParticleSection('antiquarksGrid', ['antiup','antidown','anticharm','antistrange','antitop','antibottom']);
  createParticleSection('bosonsGrid', ['photon','gluon','graviton','wplus','wminus','z','higgs']);

  // Seleciona elétron por padrão
  const firstBtn = document.querySelector('#leptonsGrid button');
  if (firstBtn) firstBtn.classList.add('active');

  // Eventos dos botões
  document.getElementById('btnAdd').addEventListener('click', () => addSelectedParticle(cameraX, cameraY));
  document.getElementById('btnRandom').addEventListener('click', addRandomParticle);
  document.getElementById('btnPause').addEventListener('click', () => { isRunning = !isRunning; updateUI(); });
  document.getElementById('btnRestart').addEventListener('click', () => {
    if (confirm('Limpar todas as partículas?')) { clearAllBodies(); updateUI(); }
  });

  document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
  document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
  document.getElementById('resetViewBtn').addEventListener('click', resetView);

  // Sliders em tempo real
  const speedSlider = document.getElementById('speedInput');
  const angleSlider = document.getElementById('angleInput');
  speedSlider.addEventListener('input', () => document.getElementById('speedValue').textContent = speedSlider.value);
  angleSlider.addEventListener('input', () => document.getElementById('angleValue').textContent = angleSlider.value + '°');

  document.addEventListener('keydown', e => {
    if (e.key === " ") { e.preventDefault(); isRunning = !isRunning; updateUI(); }
  });
}

function addSelectedParticle(worldX, worldY) {
  const def = PARTICLE_DEFS[selectedParticleKey];
  if (!def) return;

  let speed = parseFloat(document.getElementById('speedInput').value) || 0;
  speed = Math.min(speed, C_LIGHT * 0.99);
  const angleRad = (parseFloat(document.getElementById('angleInput').value) || 0) * Math.PI / 180;

  const vx = Math.cos(angleRad) * speed;
  const vy = Math.sin(angleRad) * speed;

  createBody(worldX, worldY, def.m0, vx, vy, def.charge, def.hue, def.symbol,
             def.flavor, def.isAnti, def.strongCharge, def.weakCharge, def.materia);

  updateUI();
}

function addRandomParticle() {
  const keys = Object.keys(PARTICLE_DEFS);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const def = PARTICLE_DEFS[key];

  const speed = Math.min(parseFloat(document.getElementById('speedInput').value) || 10, C_LIGHT * 0.99);
  const angleRad = Math.random() * Math.PI * 2;
  const x = cameraX + (Math.random() * 800 - 400);
  const y = cameraY + (Math.random() * 800 - 400);

  const vx = Math.cos(angleRad) * speed;
  const vy = Math.sin(angleRad) * speed;

  createBody(x, y, def.m0, vx, vy, def.charge, def.hue, def.symbol,
             def.flavor, def.isAnti, def.strongCharge, def.weakCharge, def.materia);

  updateUI();
}