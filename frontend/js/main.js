/* ========================================================
   LuxeSpa Saloon — main.js
   Global interactions: 3D scene, parallax, scroll reveal,
   cursor glow, splash screen, toast, nav scroll effect
   ======================================================== */

// ===== SPLASH SCREEN =====
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.classList.add('hide');
  }, 1600);
});

// ===== CURSOR GLOW =====
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow) {
  document.addEventListener('mousemove', e => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });
}

// ===== NAV SCROLL EFFECT =====
const mainNav = document.getElementById('mainNav');
if (mainNav) {
  window.addEventListener('scroll', () => {
    mainNav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ===== MOBILE MENU =====
function toggleMobile() {
  const links = document.getElementById('navLinks');
  if (!links) return;
  links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
  links.style.position = 'fixed';
  links.style.flexDirection = 'column';
  links.style.top = 'var(--nav-height)';
  links.style.left = '0';
  links.style.right = '0';
  links.style.background = 'rgba(10,10,15,0.98)';
  links.style.padding = '32px 5%';
  links.style.backdropFilter = 'blur(20px)';
  links.style.gap = '24px';
  links.style.zIndex = '999';
}

// ===== PARTICLES =====
function initParticles() {
  const container = document.getElementById('particlesContainer');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.width = (Math.random() * 3 + 1) + 'px';
    p.style.height = p.style.width;
    p.style.animationDuration = (Math.random() * 10 + 8) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.opacity = Math.random() * 0.6;
    container.appendChild(p);
  }
}
initParticles();

// ===== SCROLL REVEAL =====
function observeReveal() {
  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}
window.observeReveal = observeReveal;
observeReveal();

// ===== ANIMATED COUNTERS =====
function animateCounters() {
  const counters = document.querySelectorAll('[data-target]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      let start = 0;
      const duration = 1800;
      const step = timestamp => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString() + (el.dataset.suffix || '');
      };
      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}
animateCounters();

// ===== TOAST NOTIFICATION (global) =====
function showToast(icon, title, msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div>
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg}</div>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
window.showToast = showToast;

// ===== PARALLAX HERO BG =====
const heroBg = document.getElementById('heroBg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    heroBg.style.transform = `scale(1.05) translateY(${scroll * 0.25}px)`;
  });
}

// ===== PARALLAX SECTIONS =====
const parallaxBgs = document.querySelectorAll('.parallax-bg');
window.addEventListener('scroll', () => {
  parallaxBgs.forEach(bg => {
    const section = bg.parentElement;
    const rect = section.getBoundingClientRect();
    const offset = rect.top * 0.2;
    bg.style.transform = `translateY(${offset}px)`;
  });
});

// ========================================================
// THREE.JS 3D SALON SCENE
// Interactive floating 3D objects representing salon items
// ========================================================
function initThreeScene() {
  const canvas = document.getElementById('salonCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.parentElement.clientWidth / canvas.parentElement.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xfff5e0, 0.6);
  scene.add(ambientLight);

  const goldLight = new THREE.PointLight(0xc9a96e, 2, 20);
  goldLight.position.set(3, 3, 5);
  scene.add(goldLight);

  const pinkLight = new THREE.PointLight(0xd4687a, 1, 15);
  pinkLight.position.set(-3, -2, 4);
  scene.add(pinkLight);

  const tealLight = new THREE.PointLight(0x4ecdc4, 0.8, 12);
  tealLight.position.set(0, 4, 3);
  scene.add(tealLight);

  // ===== MATERIALS =====
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a96e, metalness: 0.9, roughness: 0.1 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, metalness: 0.5, roughness: 0.4 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 1.0, roughness: 0.05 });
  const mirrorMat = new THREE.MeshStandardMaterial({ color: 0x8ecae6, metalness: 0.8, roughness: 0.1 });
  const roseMat = new THREE.MeshStandardMaterial({ color: 0xd4687a, metalness: 0.4, roughness: 0.5 });

  const objects = [];

  // === SALON CHAIR (central) ===
  const chairGroup = new THREE.Group();

  // Chair seat
  const seatGeo = new THREE.CylinderGeometry(0.7, 0.6, 0.15, 16);
  const seat = new THREE.Mesh(seatGeo, darkMat);
  seat.position.y = 0;
  chairGroup.add(seat);

  // seat cushion  
  const cushionGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.12, 16);
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0x2c1810, roughness: 0.8 });
  const cushion = new THREE.Mesh(cushionGeo, cushionMat);
  cushion.position.y = 0.14;
  chairGroup.add(cushion);

  // Chair back
  const backGeo = new THREE.BoxGeometry(1.2, 1.0, 0.1);
  const back = new THREE.Mesh(backGeo, darkMat);
  back.position.set(0, 0.7, -0.55);
  back.rotation.x = -0.15;
  chairGroup.add(back);

  // Back cushion
  const backCushGeo = new THREE.BoxGeometry(1.1, 0.9, 0.08);
  const backCush = new THREE.Mesh(backCushGeo, cushionMat);
  backCush.position.set(0, 0.7, -0.5);
  backCush.rotation.x = -0.15;
  chairGroup.add(backCush);

  // Chair pillar
  const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
  const pillar = new THREE.Mesh(pillarGeo, chromeMat);
  pillar.position.y = -0.7;
  chairGroup.add(pillar);

  // Chair base (star shape approximation using cylinders)
  for (let i = 0; i < 5; i++) {
    const armGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.9, 8);
    const arm = new THREE.Mesh(armGeo, chromeMat);
    arm.rotation.z = Math.PI / 2;
    arm.rotation.y = (i / 5) * Math.PI * 2;
    arm.position.set(Math.cos((i/5)*Math.PI*2)*0.4, -1.28, Math.sin((i/5)*Math.PI*2)*0.4);
    arm.rotation.z = Math.atan2(arm.position.z, arm.position.x);
    const wheelGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.06, 8);
    const wheel = new THREE.Mesh(wheelGeo, new THREE.MeshStandardMaterial({ color: 0x111, metalness:0.3, roughness:0.9 }));
    wheel.position.set(Math.cos((i/5)*Math.PI*2)*0.8, -1.3, Math.sin((i/5)*Math.PI*2)*0.8);
    wheel.rotation.x = Math.PI/2;
    chairGroup.add(wheel);
  }

  chairGroup.position.set(0, 0, 0);
  scene.add(chairGroup);
  objects.push({ mesh: chairGroup, speed: 0.003, amplitude: 0.15, offset: 0 });

  // === SCISSORS (left, floating) ===
  const scissorsGroup = new THREE.Group();
  const bladeGeo = new THREE.BoxGeometry(0.06, 1.0, 0.04);
  const handle1Geo = new THREE.TorusGeometry(0.18, 0.05, 8, 16, Math.PI);
  const handle2Geo = new THREE.TorusGeometry(0.14, 0.05, 8, 16, Math.PI);

  const blade1 = new THREE.Mesh(bladeGeo, chromeMat);
  blade1.position.set(-0.12, 0, 0);
  blade1.rotation.z = 0.25;
  scissorsGroup.add(blade1);

  const blade2 = new THREE.Mesh(bladeGeo, chromeMat);
  blade2.position.set(0.12, 0, 0);
  blade2.rotation.z = -0.25;
  scissorsGroup.add(blade2);

  const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), goldMat);
  scissorsGroup.add(pivot);

  const h1 = new THREE.Mesh(handle1Geo, goldMat);
  h1.position.set(-0.22, -0.7, 0);
  scissorsGroup.add(h1);

  const h2 = new THREE.Mesh(handle2Geo, goldMat);
  h2.position.set(0.22, -0.7, 0);
  h2.rotation.y = Math.PI;
  scissorsGroup.add(h2);

  scissorsGroup.position.set(-3, 0.6, 1.5);
  scissorsGroup.rotation.z = 0.4;
  scene.add(scissorsGroup);
  objects.push({ mesh: scissorsGroup, speed: 0.004, amplitude: 0.2, offset: 1.2, rotSpeed: 0.008 });

  // === HAIR DRYER (right, floating) ===
  const dryerGroup = new THREE.Group();
  const bodyGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.9, 12);
  const body = new THREE.Mesh(bodyGeo, roseMat);
  body.rotation.z = Math.PI / 2;
  dryerGroup.add(body);

  const nozzleGeo = new THREE.CylinderGeometry(0.08, 0.22, 0.35, 12);
  const nozzle = new THREE.Mesh(nozzleGeo, roseMat);
  nozzle.rotation.z = Math.PI / 2;
  nozzle.position.set(0.55, 0, 0);
  dryerGroup.add(nozzle);

  const handleGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.55, 12);
  const handle = new THREE.Mesh(handleGeo, darkMat);
  handle.position.set(0.1, -0.5, 0);
  handle.rotation.z = -0.4;
  dryerGroup.add(handle);

  // Air flow dots
  for (let i = 0; i < 6; i++) {
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.03, 6), new THREE.MeshStandardMaterial({ color: 0x4ecdc4, emissive: 0x4ecdc4, emissiveIntensity: 0.5 }));
    dot.position.set(0.88 + Math.random()*0.2, (Math.random()-0.5)*0.3, 0);
    dryerGroup.add(dot);
  }

  dryerGroup.position.set(3.2, 0.3, 1.5);
  scene.add(dryerGroup);
  objects.push({ mesh: dryerGroup, speed: 0.003, amplitude: 0.18, offset: 2.1, rotSpeed: -0.005 });

  // === MIRROR (back center) ===
  const mirrorGroup = new THREE.Group();
  const frameGeo = new THREE.TorusGeometry(0.9, 0.12, 12, 32);
  const frame = new THREE.Mesh(frameGeo, goldMat);
  mirrorGroup.add(frame);
  
  const mirrorGeo = new THREE.CircleGeometry(0.88, 32);
  const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
  mirror.position.z = -0.06;
  mirrorGroup.add(mirror);

  mirrorGroup.position.set(0, 0.8, -2.5);
  scene.add(mirrorGroup);
  objects.push({ mesh: mirrorGroup, speed: 0.002, amplitude: 0.08, offset: 0.5, rotSpeed: 0.002 });

  // === FLOWERS / SPARKLES ===
  const sparkleGeo = new THREE.IcosahedronGeometry(0.12, 0);
  const sparkleMat = new THREE.MeshStandardMaterial({ color: 0xc9a96e, metalness: 0.9, roughness: 0.1, emissive: 0xc9a96e, emissiveIntensity: 0.3 });
  
  const sparklePositions = [[-2.5, 1.8, 0.5], [2.8, 1.5, 0.5], [-1.5, -1.5, 1], [2, -1.2, 0.5], [0, 2, 0]];
  sparklePositions.forEach((pos, i) => {
    const sparkle = new THREE.Mesh(sparkleGeo, sparkleMat);
    sparkle.position.set(...pos);
    sparkle.scale.setScalar(0.6 + Math.random() * 0.8);
    scene.add(sparkle);
    objects.push({ mesh: sparkle, speed: 0.005 + i*0.001, amplitude: 0.25, offset: i * 1.3, rotSpeed: 0.02 });
  });

  // ===== MOUSE INTERACTION =====
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  const wrapper = document.getElementById('threeSceneWrapper') || canvas.parentElement;
  
  wrapper.addEventListener('mousemove', e => {
    const rect = wrapper.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  // ===== ANIMATION LOOP =====
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Smooth camera follow mouse
    targetX += (mouseX * 0.8 - targetX) * 0.06;
    targetY += (mouseY * 0.5 - targetY) * 0.06;
    camera.position.x = targetX;
    camera.position.y = targetY;
    camera.lookAt(0, 0, 0);

    // Animate each object
    objects.forEach(obj => {
      // Float up and down
      obj.mesh.position.y += Math.sin(elapsed * obj.speed * 100 + obj.offset) * 0.0008 * obj.amplitude;
      // Rotate gently
      if (obj.rotSpeed) obj.mesh.rotation.y += obj.rotSpeed;
    });

    // Scissors open/close animation
    scissorsGroup.children[0].rotation.z = 0.25 + Math.sin(elapsed * 1.5) * 0.15;
    scissorsGroup.children[1].rotation.z = -(0.25 + Math.sin(elapsed * 1.5) * 0.15);

    // Pulsing gold light
    goldLight.intensity = 2 + Math.sin(elapsed * 1.2) * 0.5;
    pinkLight.intensity = 1 + Math.sin(elapsed * 0.8 + 1) * 0.3;

    renderer.render(scene, camera);
  }
  animate();

  // Resize handler
  window.addEventListener('resize', () => {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

// Initialize 3D scene when THREE is loaded
if (typeof THREE !== 'undefined') {
  initThreeScene();
} else {
  window.addEventListener('load', initThreeScene);
}

// ========================================================
// SMALL FLOATING 3D FOR RECOMMENDATION PAGE
// ========================================================
function initRecCanvas() {
  const canvas = document.getElementById('recCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight;
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);

  const light = new THREE.PointLight(0xc9a96e, 3, 20);
  light.position.set(2, 2, 4);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  const goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a96e, metalness: 0.9, roughness: 0.15 });
  const shapes = [];
  const geos = [
    new THREE.IcosahedronGeometry(0.3, 0),
    new THREE.OctahedronGeometry(0.35, 0),
    new THREE.TetrahedronGeometry(0.28, 0),
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.SphereGeometry(0.28, 8, 8),
  ];

  const positions = [[-4,0,0],[-2,0.5,1],[0,0,0],[2,0.5,1],[4,0,0]];
  positions.forEach((pos, i) => {
    const mesh = new THREE.Mesh(geos[i], goldMat.clone());
    mesh.position.set(...pos);
    scene.add(mesh);
    shapes.push({ mesh, offset: i * 1.2 });
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    shapes.forEach(s => {
      s.mesh.rotation.x += 0.008;
      s.mesh.rotation.y += 0.012;
      s.mesh.position.y = Math.sin(t * 0.8 + s.offset) * 0.3;
    });
    renderer.render(scene, camera);
  }
  animate();
}
initRecCanvas();

// ========================================================
// DYNAMIC SERVICES LOAD (for index.html)
// ========================================================
function loadServicesFromAPI() {
  fetch('http://localhost:8080/api/services')
    .then(r => r.json())
    .then(data => {
      console.log('Services loaded from API:', data.length);
    })
    .catch(() => {
      // Backend not running – static HTML already displays data
    });
}
loadServicesFromAPI();

// ========================================================
// ACTIVE NAV LINK (mark current page)
// ========================================================
(function highlightNav() {
  const path = window.location.pathname.split('/').pop();
  const map = {
    'index.html': 'nav-home',
    '': 'nav-home',
    'recommendation.html': 'nav-rec',
    'booking.html': 'nav-book',
    'login.html': 'nav-login',
  };
  const id = map[path];
  if (id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }
})();

// ========================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ========================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ========================================================
// CARD 3D TILT EFFECT ON HOVER
// ========================================================
document.addEventListener('mousemove', e => {
  document.querySelectorAll('.card, .offer-card, .testimonial-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = -(y - cy) / cy * 6;
      const rotY = (x - cx) / cx * 6;
      card.style.transform = `translateY(-8px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    } else {
      card.style.transform = '';
    }
  });
});

console.log('%c✂️ LuxeSpa Saloon – Launched', 'color:#c9a96e;font-size:1.1rem;font-weight:bold;');
console.log('%cFrontend running. Backend expected at http://localhost:8080', 'color:#8a8090;font-size:0.875rem;');
