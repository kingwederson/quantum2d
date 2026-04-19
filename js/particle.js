// ==================== GERENCIAMENTO DE PARTÍCULAS ====================
let bodies = [];

function createBodyObject(x, y, m0, vx, vy, charge, hue, symbol, flavor, isAnti, strongCharge, weakCharge, lightness) {
  let { vx: limitedVx, vy: limitedVy, speed } = limitSpeed(vx, vy);
  
  // Partículas sem massa (fótons, gluons, grávitons) sempre viajam à velocidade máxima
  if (m0 === 0) {
    const speed_max = C_LIGHT * 0.99;
    const currentSpeed = Math.hypot(limitedVx, limitedVy);
    if (currentSpeed > 0) {
      limitedVx = (limitedVx / currentSpeed) * speed_max;
      limitedVy = (limitedVy / currentSpeed) * speed_max;
    } else {
      // Se em repouso, coloca em direção aleatória a c
      const angle = Math.random() * 2 * Math.PI;
      limitedVx = Math.cos(angle) * speed_max;
      limitedVy = Math.sin(angle) * speed_max;
    }
  }
  
  const gamma = calculateGamma(speed, m0);
  const effectiveMass = m0 > 0 ? m0 * gamma : 0.05;
  const radius = RADIUS_BASE + Math.cbrt(Math.max(m0, 0.5)) * 1.2;
  
  return {
    x, y, 
    vx: limitedVx, vy: limitedVy, 
    m0: m0, 
    mass: effectiveMass, 
    charge, radius, hue, symbol, flavor, lightness,
    isAnti, strongCharge, weakCharge, 
    gamma: gamma,
    ax: 0, ay: 0
  };
}

function createBody(x, y, m0, vx, vy, charge, hue, symbol, flavor, isAnti, strongCharge, weakCharge, lightness) {
  bodies.push(createBodyObject(x, y, m0, vx, vy, charge, hue, symbol, flavor, isAnti, strongCharge, weakCharge, lightness));
}

function removeBody(index) {
  bodies.splice(index, 1);
}

function clearAllBodies() {
  bodies = [];
}

function getBodies() {
  return bodies;
}

function updateParticleMass(body) {
  const speed = Math.hypot(body.vx, body.vy);
  const gamma = calculateGamma(speed, body.m0);
  body.gamma = gamma;
  body.mass = body.m0 > 0 ? body.m0 * gamma : 0.05;
}