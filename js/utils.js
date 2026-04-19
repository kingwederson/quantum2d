// ==================== FUNÇÕES UTILITÁRIAS ====================
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function formatNumber(num, decimals = 0) {
  return num.toFixed(decimals);
}

// Cálculo de gamma relativístico
function calculateGamma(speed, restMass) {
  if (restMass === 0) return 1.0;
  const beta = Math.min(0.999, speed / C_LIGHT);
  return 1 / Math.sqrt(1 - beta * beta);
}

// Limita velocidade à velocidade da luz
function limitSpeed(vx, vy, maxSpeed = C_LIGHT) {
  let speed = Math.hypot(vx, vy);
  if (speed > maxSpeed) {
    vx = vx / speed * maxSpeed * 0.999;
    vy = vy / speed * maxSpeed * 0.999;
  }
  return { vx, vy, speed: Math.min(speed, maxSpeed) };
}