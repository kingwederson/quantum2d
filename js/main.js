// ==================== LOOP PRINCIPAL ====================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function draw() {
  ctx.fillStyle = '#03060c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.scale(zoomLevel, zoomLevel);
  ctx.translate(-cameraX, -cameraY);
  
  // Desenha grid
  drawGrid();
  
  // Desenha partículas
  for(let b of bodies) {
    drawParticle(b);
  }
  
  ctx.restore();
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(80,150,220,0.2)';
  ctx.lineWidth = 1.2/zoomLevel;
  const step = 100;
  const left = cameraX - (canvas.width/2)/zoomLevel;
  const right = cameraX + (canvas.width/2)/zoomLevel;
  const top = cameraY - (canvas.height/2)/zoomLevel;
  const bottom = cameraY + (canvas.height/2)/zoomLevel;
  
  for(let x = Math.floor(left/step)*step; x <= right; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
  }
  for(let y = Math.floor(top/step)*step; y <= bottom; y += step) {
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }
}

function drawParticle(p) {
  ctx.shadowBlur = 50;
  ctx.shadowColor = `hsl(${(p.hue+10)%360}, 80%, 100%)`;
  ctx.fillStyle = `hsl(${(p.hue+10)%360}, 100%, ${50+10*p.materia}%)`;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 10;
  ctx.fillStyle = `hsl(${(p.hue+190)%360}, 100%, 0%)`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.symbol, p.x, p.y);
}

function updatePhysics() {
  computeAllForces(bodies);
  
  for (let body of bodies) {
    body.vx += body.ax * DT;
    body.vy += body.ay * DT;
    
    // Forçar velocidade máxima para glúon, fóton e graviton
    if (body.flavor === "photon" || body.flavor === "gluon" || body.flavor === "graviton") {
      const speed = Math.hypot(body.vx, body.vy);
      if (speed > 0) {
        body.vx = (body.vx / speed) * C_LIGHT * 0.99;
        body.vy = (body.vy / speed) * C_LIGHT * 0.99;
      }
    } else {
      const { vx, vy } = limitSpeed(body.vx, body.vy);
      body.vx = vx;
      body.vy = vy;
    }
    
    updateParticleMass(body);
    body.x += body.vx * DT;
    body.y += body.vy * DT;
  }
}

function animate() {
  if(isRunning) {
    updatePhysics();
    handleCollisions();
  }
  draw();
  updateUI();
  requestAnimationFrame(animate);
}

// Inicialização
window.addEventListener('resize', resize);
resize();

setupUIEvents();
setupCameraEvents(canvas, (x, y) => addSelectedParticle(x, y));

animate();
