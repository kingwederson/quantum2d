// ==================== CÂMERA E ZOOM ====================
let zoomLevel = DEFAULT_ZOOM;
let cameraX = 0, cameraY = 0;
let isDragging = false;
let prevMouseX = 0, prevMouseY = 0;
let clickStartX = 0, clickStartY = 0;
let isPotentialClick = false;

function zoomIn() {
  zoomLevel = Math.min(zoomLevel * ZOOM_STEP, MAX_ZOOM);
}

function zoomOut() {
  zoomLevel = Math.max(zoomLevel / ZOOM_STEP, MIN_ZOOM);
}

function resetView() {
  zoomLevel = DEFAULT_ZOOM;
  cameraX = 0;
  cameraY = 0;
}

function worldToScreen(worldX, worldY, canvasWidth, canvasHeight) {
  const screenX = (worldX - cameraX) * zoomLevel + canvasWidth / 2;
  const screenY = (worldY - cameraY) * zoomLevel + canvasHeight / 2;
  return { x: screenX, y: screenY };
}

function screenToWorld(screenX, screenY, canvasWidth, canvasHeight) {
  const worldX = cameraX + (screenX - canvasWidth / 2) / zoomLevel;
  const worldY = cameraY + (screenY - canvasHeight / 2) / zoomLevel;
  return { x: worldX, y: worldY };
}

function setupCameraEvents(canvas, addParticleCallback) {
  canvas.addEventListener('mousedown', (e) => { 
    if(e.button !== 0) return;
    isPotentialClick = true;
    isDragging = false;
    clickStartX = e.clientX;
    clickStartY = e.clientY;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if(!isPotentialClick) return;
    if(Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY) > 5) {
      isDragging = true;
      isPotentialClick = false;
    }
    if(isDragging) {
      const dx = (e.clientX - prevMouseX) / zoomLevel;
      const dy = (e.clientY - prevMouseY) / zoomLevel;
      cameraX -= dx;
      cameraY -= dy;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }
  });
  
  canvas.addEventListener('mouseup', (e) => {
    if(!isPotentialClick) {
      isDragging = false;
      isPotentialClick = false;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const worldPos = screenToWorld(e.clientX - rect.left, e.clientY - rect.top, canvas.width, canvas.height);
    addParticleCallback(worldPos.x, worldPos.y);
    isPotentialClick = false;
    isDragging = false;
  });
  
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldBefore = screenToWorld(mouseX, mouseY, canvas.width, canvas.height);
    
    zoomLevel *= (e.deltaY < 0) ? ZOOM_STEP : 1 / ZOOM_STEP;
    zoomLevel = clamp(zoomLevel, MIN_ZOOM, MAX_ZOOM);
    
    const worldAfter = screenToWorld(mouseX, mouseY, canvas.width, canvas.height);
    cameraX += worldBefore.x - worldAfter.x;
    cameraY += worldBefore.y - worldAfter.y;
  });
}