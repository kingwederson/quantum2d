// ==================== INTERFACE DO USUÁRIO ====================
let isRunning = true;

function updateUI() {
  document.getElementById('count').textContent = bodies.length;
  document.getElementById('state').textContent = isRunning ? "Rodando" : "Pausado";
  document.getElementById('btnPause').textContent = isRunning ? "⏸️ Pausar" : "▶️ Retomar";
  
  // Atualiza barra de energia
  if (bodies.length > 0) {
    let avgGamma = 0;
    for (let b of bodies) {
      const vmag = Math.hypot(b.vx, b.vy);
      const beta = Math.min(0.999, vmag / C_LIGHT);
      const gamma = 1 / Math.sqrt(1 - beta*beta);
      avgGamma += gamma;
    }
    avgGamma /= bodies.length;
    const fillPercent = Math.min(100, (avgGamma - 1) / 5 * 100);
    const energyFill = document.getElementById('energyFill');
    if (energyFill) energyFill.style.width = Math.max(2, fillPercent) + '%';
  }
}

function setupUIEvents() {
  document.getElementById('btnAdd').addEventListener('click', () => {
    addSelectedParticle(cameraX, cameraY);
  });
  
  document.getElementById('btnRandom').addEventListener('click', addRandomParticle);
  document.getElementById('btnPause').addEventListener('click', () => {
    isRunning = !isRunning;
    updateUI();
  });
  document.getElementById('btnRestart').addEventListener('click', () => {
    if (confirm('Reiniciar todas as partículas?')) {
      clearAllBodies();
      updateUI();
    }
  });
  document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
  document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
  document.getElementById('resetViewBtn').addEventListener('click', resetView);
  
  document.addEventListener('keydown', (e) => {
    if(e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      isRunning = !isRunning;
      updateUI();
    }
  });
}

function addSelectedParticle(worldX, worldY) {
  const key = document.getElementById('typeSelect').value;
  const def = PARTICLE_DEFS[key];
  if (!def) return;
  let speed = parseFloat(document.getElementById('speedInput').value) || 0;
  speed = Math.min(speed, C_LIGHT * 0.99);
  const angleRad = (parseFloat(document.getElementById('angleInput').value) || 0) * Math.PI / 180;
  const vx = Math.cos(angleRad) * speed;
  const vy = Math.sin(angleRad) * speed;
  createBody(worldX, worldY, def.m0, vx, vy, def.charge, def.hue, def.symbol, def.flavor, def.isAnti, def.strongCharge, def.weakCharge, def.lightness);
  updateUI();
}

function addRandomParticle() {
  const keys = Object.keys(PARTICLE_DEFS);
  const key = keys[Math.floor(Math.random() * keys.length)];
  const def = PARTICLE_DEFS[key];
  const speed = Math.min(parseFloat(document.getElementById('speedInput').value) || 10, C_LIGHT * 0.99);
  const angleRad = Math.random() * Math.PI * 2;
  const x = cameraX + (Math.random() * 1000 - 500);
  const y = cameraY + (Math.random() * 1000 - 500);
  const vx = Math.cos(angleRad) * speed;
  const vy = Math.sin(angleRad) * speed;
  createBody(x, y, def.m0, vx, vy, def.charge, def.hue, def.symbol, def.flavor, def.isAnti, def.strongCharge, def.weakCharge, def.lightness);
  updateUI();
}