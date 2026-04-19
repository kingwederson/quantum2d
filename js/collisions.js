// ==================== COLISÕES E CRIAÇÃO DE PARES ====================
function getPossiblePairs(availableEnergyCM) {
  const pairs = [];
  const allTypes = Object.entries(PARTICLE_DEFS);
  
  for (let i = 0; i < allTypes.length; i++) {
    const [key1, def1] = allTypes[i];
    for (let j = 0; j < allTypes.length; j++) {
      const [key2, def2] = allTypes[j];
      if (def1.flavor === def2.flavor && 
          def1.isAnti !== def2.isAnti && 
          def1.charge + def2.charge === 0) {
        const totalMass = (def1.m0 + def2.m0);
        if (totalMass <= availableEnergyCM + 0.5 && totalMass > 0) {
          pairs.push({ particle1: def1, particle2: def2, totalMass });
        }
        break;
      }
    }
  }
  
  // Ordenar por massa decrescente para criar partículas mais massivas possível
  pairs.sort((a, b) => b.totalMass - a.totalMass);
  
  return pairs;
}

function tryCreatePair(a, b, collisionX, collisionY, totalPx, totalPy, totalEnergy) {
  const pTotMag = Math.hypot(totalPx, totalPy);
  const massInvariant = Math.sqrt(Math.max(0, totalEnergy * totalEnergy - pTotMag * pTotMag));
  const availableEnergyCM = massInvariant;
  
  const possiblePairs = getPossiblePairs(availableEnergyCM);
  if (possiblePairs.length === 0) return null;
  
  const selected = possiblePairs[Math.floor(Math.random() * possiblePairs.length)];
  const { particle1: def1, particle2: def2, totalMass: requiredMass } = selected;
  
  const kineticRemaining = Math.max(0, availableEnergyCM - requiredMass);
  const pCM_mag = Math.sqrt(Math.max(0, kineticRemaining * (kineticRemaining + 2 * requiredMass))) / 2;
  
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);
  const px_cm1 = pCM_mag * Math.sin(phi) * Math.cos(theta);
  const py_cm1 = pCM_mag * Math.sin(phi) * Math.sin(theta);
  const px_cm2 = -px_cm1;
  const py_cm2 = -py_cm1;
  
  const totalMassInv = massInvariant;
  const vCMx = totalPx / totalEnergy;
  const vCMy = totalPy / totalEnergy;
  const gammaCM = totalEnergy / totalMassInv;
  
  function labVelocity(px_cm, py_cm, m) {
    const E_cm = Math.hypot(px_cm, py_cm, m);
    const denominator = gammaCM * (E_cm + vCMx * px_cm + vCMy * py_cm);
    if (denominator === 0) return { vx: 0, vy: 0 };
    const ux = (px_cm + gammaCM * vCMx * E_cm) / denominator;
    const uy = (py_cm + gammaCM * vCMy * E_cm) / denominator;
    return { vx: ux, vy: uy };
  }
  
  const v1 = labVelocity(px_cm1, py_cm1, def1.m0);
  const v2 = labVelocity(px_cm2, py_cm2, def2.m0);
  
  return [
    { def: def1, vx: v1.vx, vy: v1.vy },
    { def: def2, vx: v2.vx, vy: v2.vy }
  ];
}

function handleElasticCollision(a, b, dx, dy, r) {
  const nx = dx / r, ny = dy / r;
  const rvx = a.vx - b.vx, rvy = a.vy - b.vy;
  const velAlong = rvx * nx + rvy * ny;
  
  if (velAlong < 0) {
    const e = 0.82;
    let imp = -(1 + e) * velAlong;
    const invSum = (1 / Math.max(a.mass, 0.01)) + (1 / Math.max(b.mass, 0.01));
    imp /= invSum;
    const ix = imp * nx, iy = imp * ny;
    a.vx += ix / Math.max(a.mass, 0.01);
    a.vy += iy / Math.max(a.mass, 0.01);
    b.vx -= ix / Math.max(b.mass, 0.01);
    b.vy -= iy / Math.max(b.mass, 0.01);
  }
  
  const sumR = a.radius + b.radius;
  const overlap = (sumR - r) * 0.5;
  a.x -= overlap * nx;
  a.y -= overlap * ny;
  b.x += overlap * nx;
  b.y += overlap * ny;
}

function handleCollisions() {
  const toRemove = new Set();
  let newParticles = [];
  
  for (let i = 0; i < bodies.length; i++) {
    if (toRemove.has(i)) continue;
    for (let j = i+1; j < bodies.length; j++) {
      if (toRemove.has(j)) continue;
      const a = bodies[i];
      const b = bodies[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const r = Math.hypot(dx, dy);
      const sumR = a.radius + b.radius;
      if (r < sumR && r > 0.01) {
        
        // Aniquilação elétron-pósitron com fótons
        const isElectronPositron = (a.flavor === "e" && b.flavor === "e" && a.isAnti !== b.isAnti);
        
        if (isElectronPositron) {
          const midX = (a.x + b.x)/2, midY = (a.y + b.y)/2;
          const totalPx = a.mass * a.vx + b.mass * b.vx;
          const totalPy = a.mass * a.vy + b.mass * b.vy;
          const norm = Math.hypot(totalPx, totalPy);
          
          const photonSpeed = C_LIGHT * 0.98;
          
          let dirX, dirY;
          if (norm > 0.01) {
            dirX = totalPx / norm;
            dirY = totalPy / norm;
          } else {
            const angle = Math.random() * 2 * Math.PI;
            dirX = Math.cos(angle);
            dirY = Math.sin(angle);
          }
          
          const v1x = dirX * photonSpeed;
          const v1y = dirY * photonSpeed;
          const v2x = -dirX * photonSpeed;
          const v2y = -dirY * photonSpeed;
          
          const photonDef = PARTICLE_DEFS.photon;
          newParticles.push(createBodyObject(midX, midY, 0, v1x, v1y, 0, photonDef.hue, "γ", "photon", false, 0, 0, photonDef.lightness));
          newParticles.push(createBodyObject(midX, midY, 0, v2x, v2y, 0, photonDef.hue, "γ", "photon", false, 0, 0, photonDef.lightness));
          toRemove.add(i); toRemove.add(j);
          continue;
        }
        
        // Aniquilação genérica partícula-antipartícula
        const isAnnihilation = (a.flavor === b.flavor && a.isAnti !== b.isAnti && a.m0 > 0 && b.m0 > 0);
        if (isAnnihilation && (a.flavor !== "photon" && a.flavor !== "gluon")) {
          const midX = (a.x + b.x)/2, midY = (a.y + b.y)/2;
          const totalPx = a.mass * a.vx + b.mass * b.vx;
          const totalPy = a.mass * a.vy + b.mass * b.vy;
          const norm = Math.hypot(totalPx, totalPy);
          
          const photonSpeed = C_LIGHT * 0.98;
          
          let dirX, dirY;
          if (norm > 0.01) {
            dirX = totalPx / norm;
            dirY = totalPy / norm;
          } else {
            const angle = Math.random() * 2 * Math.PI;
            dirX = Math.cos(angle);
            dirY = Math.sin(angle);
          }
          
          const v1x = dirX * photonSpeed;
          const v1y = dirY * photonSpeed;
          const v2x = -dirX * photonSpeed;
          const v2y = -dirY * photonSpeed;
          
          const photonDef = PARTICLE_DEFS.photon;
          newParticles.push(createBodyObject(midX, midY, 0, v1x, v1y, 0, photonDef.hue, "γ", "photon", false, 0, 0, photonDef.lightness));
          newParticles.push(createBodyObject(midX, midY, 0, v2x, v2y, 0, photonDef.hue, "γ", "photon", false, 0, 0, photonDef.lightness));
          toRemove.add(i); toRemove.add(j);
          continue;
        }
        
        // Criação de par inelástica - REDUZIDA probabilidade para 10%
        const gammaA = a.gamma || 1;
        const gammaB = b.gamma || 1;
        const E_total = (a.m0 * gammaA + b.m0 * gammaB) * (C_LIGHT * C_LIGHT);
        const px_total = a.mass * a.vx + b.mass * b.vx;
        const py_total = a.mass * a.vy + b.mass * b.vy;
        const E_cm = Math.sqrt(Math.max(0, E_total * E_total - (px_total*px_total + py_total*py_total) * (C_LIGHT*C_LIGHT)));
        const minPairMass = 2 * 2.5;
        
        // Verificar se são quarks
        const isQuarkA = a.strongCharge !== 0 && a.strongCharge !== undefined;
        const isQuarkB = b.strongCharge !== 0 && b.strongCharge !== undefined;
        const isQuarkCollision = isQuarkA && isQuarkB;
        
        if (E_cm >= minPairMass && Math.random() < 0.1) {  // Reduzido de 0.35 para 0.1
          const collisionX = (a.x + b.x)/2, collisionY = (a.y + b.y)/2;
          const products = tryCreatePair(a, b, collisionX, collisionY, px_total, py_total, E_total);
          if (products && products.length === 2) {
            for (let prod of products) {
              newParticles.push(createBodyObject(collisionX, collisionY, prod.def.m0, prod.vx, prod.vy, prod.def.charge, prod.def.hue, prod.def.symbol, prod.def.flavor, prod.def.isAnti, prod.def.strongCharge, prod.def.weakCharge, prod.def.lightness));
            }
            toRemove.add(i); toRemove.add(j);
            continue;
          }
        } else if (isQuarkCollision && E_cm < minPairMass * 2) {  // Energia baixa: quarks formam hadron
          // Calcular momento e energia combinados
          const totalMass = a.mass + b.mass;
          const totalPx = a.mass * a.vx + b.mass * b.vx;
          const totalPy = a.mass * a.vy + b.mass * b.vy;
          const totalE = a.mass * (C_LIGHT*C_LIGHT) + b.mass * (C_LIGHT*C_LIGHT) + 0.5 * a.mass * (a.vx*a.vx + a.vy*a.vy) + 0.5 * b.mass * (b.vx*b.vx + b.vy*b.vy);
          
          // Velocidade do centro de massa
          const vx_cm = totalPx / totalMass;
          const vy_cm = totalPy / totalMass;
          
          toRemove.add(i); toRemove.add(j);
          continue;
        }
        
        // Colisões inelásticas gerais: produção de partículas se energia suficiente
        if (!isAnnihilation && !isQuarkCollision && E_cm >= minPairMass && Math.random() < 0.01) {  // 5% chance para colisões gerais
          const collisionX = (a.x + b.x)/2, collisionY = (a.y + b.y)/2;
          const products = tryCreatePair(a, b, collisionX, collisionY, px_total, py_total, E_total);
          if (products && products.length === 2) {
            for (let prod of products) {
              newParticles.push(createBodyObject(collisionX, collisionY, prod.def.m0, prod.vx, prod.vy, prod.def.charge, prod.def.hue, prod.def.symbol, prod.def.flavor, prod.def.isAnti, prod.def.strongCharge, prod.def.weakCharge, prod.def.lightness));
            }
            toRemove.add(i); toRemove.add(j);
            continue;
          }
        }
        
        // Colisão elástica
        handleElasticCollision(a, b, dx, dy, r);
      }
    }
  }
  
  if (toRemove.size) {
    bodies = bodies.filter((_, idx) => !toRemove.has(idx));
  }
  for (let p of newParticles) bodies.push(p);
}