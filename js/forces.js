// ==================== FORÇAS FUNDAMENTAIS ====================
function computeStrongForce(bi, bj, dx, dy, r) {
  if (r > STRONG_RANGE_MAX) return { fx: 0, fy: 0 };
  if (!bi.strongCharge || !bj.strongCharge || bi.strongCharge === 0 || bj.strongCharge === 0) return { fx: 0, fy: 0 };
  
  const product = bi.strongCharge * bj.strongCharge;
  if (product === 0) return { fx: 0, fy: 0 };
  
  const r_eff = Math.max(r, STRONG_CORE_RADIUS);
  const lambda = 18.0;
  const yukawa = Math.exp(-r_eff / lambda) / r_eff;
  const linearTerm = Math.min(0.025 * r_eff, 1.0);
  let magnitude = K_STRONG * Math.abs(product) * (yukawa + linearTerm * 0.7);
  let sign = (product < 0) ? -1 : 1;
  let forceMag = sign * magnitude;
  
  if (r > STRONG_RANGE_MAX * 0.65) {
    const fade = 1.0 - Math.pow((r - STRONG_RANGE_MAX*0.65) / (STRONG_RANGE_MAX*0.35), 2);
    forceMag *= Math.max(0, fade);
  }
  
  return { fx: forceMag * (dx / r), fy: forceMag * (dy / r) };
}

function computeEMForce(bi, bj, dx, dy, r) {
  const r_eff = Math.max(r, 3.0);
  const coulomb = K_EM * bi.charge * bj.charge / (r_eff * r_eff);
  return { fx: -coulomb * (dx / r), fy: -coulomb * (dy / r) };
}

function computeWeakForce(bi, bj, dx, dy, r) {
  if (r > 100.0) return { fx: 0, fy: 0 };
  if (bi.weakCharge === 0 || bj.weakCharge === 0) return { fx: 0, fy: 0 };
  
  const r_eff = Math.max(r, 2.5);
  const lambda_weak = 26.0;
  const yukawaWeak = Math.exp(-r_eff / lambda_weak) / (r_eff + 6.0);
  const magnitude = K_WEAK * Math.abs(bi.weakCharge * bj.weakCharge) * yukawaWeak;
  return { fx: magnitude * (dx / r_eff), fy: magnitude * (dy / r_eff) };
}

function computeAllForces(bodies) {
  // Reset acelerações
  for (let body of bodies) { 
    body.ax = 0; 
    body.ay = 0; 
  }
  
  for (let i = 0; i < bodies.length; i++) {
    const bi = bodies[i];
    for (let j = i+1; j < bodies.length; j++) {
      const bj = bodies[j];
      let dx = bj.x - bi.x, dy = bj.y - bi.y;
      let r = Math.hypot(dx, dy);
      if (r < 1.8) continue;
      
      let totalFx = 0, totalFy = 0;
      const em = computeEMForce(bi, bj, dx, dy, r);
      totalFx += em.fx; totalFy += em.fy;
      
      const strong = computeStrongForce(bi, bj, dx, dy, r);
      totalFx += strong.fx; totalFy += strong.fy;
      
      const weak = computeWeakForce(bi, bj, dx, dy, r);
      totalFx += weak.fx; totalFy += weak.fy;
      
      const invMass_i = 1.0 / Math.max(bi.mass, 0.01);
      const invMass_j = 1.0 / Math.max(bj.mass, 0.01);
      
      bi.ax += totalFx * invMass_i;
      bi.ay += totalFy * invMass_i;
      bj.ax -= totalFx * invMass_j;
      bj.ay -= totalFy * invMass_j;
    }
  }
}