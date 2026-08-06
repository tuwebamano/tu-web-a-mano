(() => {
  'use strict';

  /* ---------------- Formspree: crea un formulario gratis en formspree.io -----------
     y pega aquí su endpoint (Settings > la URL que empieza por https://formspree.io/f/...).
     Es una URL pública pensada para vivir en el código del navegador (no es un secreto). */
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xykrqnak';

  /* Google Analytics 4: sustituye por tu Measurement ID real (analytics.google.com
     > Admin > Flujos de datos > tu flujo web). Solo se carga si el visitante acepta
     cookies en el banner, nunca antes. */
  const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const hasGSAP = typeof gsap !== 'undefined';
  const hasScrollTrigger = hasGSAP && typeof ScrollTrigger !== 'undefined';
  if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  let lenisInstance = null;

  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initReveal();
    initScrollHint();
    initTiltCards();
    initProcessLine();
    initPortfolioCoverflow();
    initContactForm();
    initBackToTop();
    initCookieConsent();
    lenisInstance = initSmoothScroll();
    initSectionScene('servicesCanvas', document.querySelector('.services'), 'icosahedron', 0xf2a93b);
    initStarScene('processCanvas', document.querySelector('.process'));
    initCustomCursor();
    initManifestoParallax();
  });

  /* ---------------- Custom cursor ---------------- */
  function initCustomCursor() {
    if (isTouch || reduceMotion) return;
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    document.documentElement.classList.add('custom-cursor-active');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    function loop() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    document.querySelectorAll('[data-cursor-magnetic]').forEach((el) => {
      el.addEventListener('pointerenter', () => ring.classList.add('is-magnetic'));
      el.addEventListener('pointerleave', () => ring.classList.remove('is-magnetic'));
    });
  }

  /* ---------------- Smooth scroll (Lenis + GSAP ticker) ---------------- */
  function initSmoothScroll() {
    if (reduceMotion || typeof Lenis === 'undefined') return null;
    try {
      const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      if (hasGSAP) {
        gsap.ticker.add((time) => { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
        if (hasScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
      } else {
        const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      }
      return lenis;
    } catch (err) {
      return null;
    }
  }

  /* ---------------- Navbar ---------------- */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------- Mobile menu ---------------- */
  function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    const closeMenu = () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    links.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------------- Scroll reveal ---------------- */
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    items.forEach((el) => observer.observe(el));
  }

  /* ---------------- Scroll hint ---------------- */
  function initScrollHint() {
    const btn = document.getElementById('scrollHint');
    const next = document.querySelector('.services');
    if (!btn || !next) return;
    btn.addEventListener('click', () => {
      next.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------- Tilt cards ---------------- */
  function initTiltCards() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateY(${(px * 8).toFixed(2)}deg) rotateX(${(-py * 8).toFixed(2)}deg)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = 'rotateY(0deg) rotateX(0deg)';
      });
    });
  }

  /* ---------------- Process connecting line ---------------- */
  function initProcessLine() {
    const wrap = document.getElementById('processLine');
    const fill = document.getElementById('processLineFill');
    if (!wrap || !fill) return;

    const isStacked = () => window.matchMedia('(max-width: 720px)').matches;

    const update = () => {
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const total = rect.height + vh * 0.5;
      let progress = (start - rect.top) / total;
      progress = Math.min(1, Math.max(0, progress));

      if (isStacked()) {
        fill.style.height = `${(progress * 100).toFixed(1)}%`;
        fill.style.width = '';
      } else {
        fill.style.width = `${(progress * 100).toFixed(1)}%`;
        fill.style.height = '';
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------- Portfolio coverflow (drag + momentum + snap) ---------------- */
  function initPortfolioCoverflow() {
    const stage = document.getElementById('portfolioStage');
    const track = document.getElementById('portfolioTrack');
    const prevBtn = document.getElementById('portfolioPrev');
    const nextBtn = document.getElementById('portfolioNext');
    if (!stage || !track) return;

    const cards = Array.from(track.children);
    const count = cards.length;
    if (!count) return;

    let offset = 0;
    // dragUnit: cuántos px de arrastre/scroll equivalen a "una tarjeta" (sensibilidad).
    // radius: distancia a la que la técnica de cilindro 3D (rotateY + translateZ)
    // aleja cada tarjeta del eje central; se recalcula a partir del ancho real de
    // la tarjeta para que las tarjetas vecinas queden separadas sin solaparse.
    let dragUnit = 260;
    let radius = 600;
    const angleStep = 34;

    const computeGeometry = () => {
      // offsetWidth (no getBoundingClientRect): el ancho de layout no cambia con
      // el transform 3D de la propia tarjeta, evitando que un radio ya aplicado
      // se retroalimente a sí mismo en cada resize/load.
      const w = cards[0].offsetWidth;
      if (w > 0) {
        dragUnit = w * 0.62;
        const angleRad = (angleStep * Math.PI) / 180;
        radius = (w / 2) / Math.tan(angleRad / 2);
        // Retrasamos el eje del cilindro entero -radius: sin esto, la tarjeta
        // frontal (ángulo 0) queda a translateZ(+radius), es decir empujada hacia
        // la cámara, y la perspectiva la amplía muy por encima de su tamaño real
        // (se ve pixelada). Con este contrapeso, la tarjeta frontal vuelve a
        // quedar a su profundidad natural y las demás se meten hacia atrás.
        track.style.transform = `translateZ(${(-radius).toFixed(1)}px)`;
      }
    };
    computeGeometry();
    window.addEventListener('resize', computeGeometry);
    // Un enlace directo a #portfolio puede saltar el hash antes de que el
    // layout final esté listo; recalculamos cuando la página termina de cargar.
    window.addEventListener('load', () => { computeGeometry(); render(); });
    if (location.hash === '#portfolio') {
      requestAnimationFrame(() => { computeGeometry(); render(); });
    }

    // Distancia mínima circular entre la tarjeta i y el offset actual: en vez de
    // corregir una sola vuelta (que se rompía tras varias vueltas seguidas de scroll),
    // esto envuelve la posición sin importar cuánto haya crecido el offset acumulado.
    function wrappedDelta(raw) {
      return raw - count * Math.round(raw / count);
    }

    // Carrusel cilíndrico real: cada tarjeta vive en el mismo punto central y solo
    // gira sobre el eje Y y se aleja con translateZ. Al girar el cilindro, las
    // tarjetas vecinas se meten hacia atrás y aparecen a los lados por la propia
    // rotación + perspectiva del contenedor — no se desplazan con translateX.
    function render() {
      cards.forEach((card, i) => {
        const p = wrappedDelta(i - offset);
        const abs = Math.abs(p);
        const angle = -p * angleStep;
        const scale = Math.max(0.62, 1 - abs * 0.18);
        const opacity = Math.max(0.22, 1 - abs * 0.35);
        card.style.transform = `rotateY(${angle.toFixed(1)}deg) translateZ(${radius.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        card.style.opacity = opacity.toFixed(2);
        card.style.zIndex = String(Math.round(100 - abs * 10));
        card.style.filter = abs < 0.5 ? 'brightness(1)' : 'brightness(0.65)';
      });
    }

    // Una vez asentado el giro, reducimos el offset a su equivalente dentro de una
    // vuelta (no cambia nada visualmente, wrappedDelta ya es periódico) para que no
    // crezca sin límite durante sesiones largas de scroll en la misma dirección.
    const wrapOffset = (v) => ((v % count) + count) % count;

    function snap(targetOverride) {
      const target = targetOverride !== undefined ? targetOverride : Math.round(offset);
      if (reduceMotion) { offset = wrapOffset(target); render(); return; }
      const start = offset;
      const diff = target - start;
      if (Math.abs(diff) < 0.001) { offset = wrapOffset(target); render(); return; }
      let t = 0;
      const step = () => {
        t += 0.08;
        if (t >= 1) { offset = wrapOffset(target); render(); return; }
        offset = start + diff * (1 - Math.pow(1 - t, 3));
        render();
        requestAnimationFrame(step);
      };
      step();
    }

    function goTo(delta) {
      snap(Math.round(offset) + delta);
    }

    stage.addEventListener('mouseenter', () => { if (lenisInstance) lenisInstance.stop(); });
    stage.addEventListener('mouseleave', () => { if (lenisInstance) lenisInstance.start(); });

    let snapTimeout = null;
    stage.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopPropagation();
      offset += (e.deltaY + e.deltaX) * 0.0025;
      render();
      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(() => snap(), 140);
    }, { passive: false });

    // Teclado: flechas izquierda/derecha giran el carrusel una tarjeta.
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(-1); }
    });

    // Botones: cubren táctil, teclado (son <button> nativos) y ratón sin arrastre.
    if (prevBtn) prevBtn.addEventListener('click', () => goTo(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(1));

    // Deslizar con el dedo en pantallas táctiles (el evento 'wheel' no existe ahí).
    let touchStartX = null;
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    stage.addEventListener('touchmove', (e) => {
      if (touchStartX === null) return;
      const dx = e.touches[0].clientX - touchStartX;
      offset -= dx / dragUnit;
      touchStartX = e.touches[0].clientX;
      render();
    }, { passive: true });
    stage.addEventListener('touchend', () => {
      touchStartX = null;
      snap();
    });

    render();
  }

  /* ---------------- Contact form ---------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusEl = document.getElementById('formStatus');
    if (!form || !submitBtn || !statusEl) return;

    const validators = {
      name: (v) => (v.trim().length >= 2 ? '' : 'Indica tu nombre.'),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Introduce un email válido.'),
      phone: (v) => (v.trim() === '' || /^[+\d][\d\s]{7,14}$/.test(v.trim()) ? '' : 'Introduce un teléfono válido.'),
      project: (v) => (v ? '' : 'Selecciona un tipo de proyecto.'),
      message: (v) => (v.trim().length >= 5 ? '' : 'Cuéntanos un poco más de tu idea.'),
    };

    function setFieldError(name, message) {
      const field = form.querySelector(`[name="${name}"]`);
      const errorEl = form.querySelector(`[data-error-for="${name}"]`);
      if (!field || !errorEl) return;
      const wrapper = field.closest('.form-field');
      errorEl.textContent = message;
      wrapper.classList.toggle('has-error', Boolean(message));
      field.setAttribute('aria-describedby', errorEl.id || (errorEl.id = `error-${name}`));
      field.setAttribute('aria-invalid', String(Boolean(message)));
    }

    function validateForm(data) {
      let firstInvalid = null;
      let valid = true;
      Object.keys(validators).forEach((name) => {
        const message = validators[name](data.get(name) || '');
        setFieldError(name, message);
        if (message && !firstInvalid) firstInvalid = name;
        if (message) valid = false;
      });
      return { valid, firstInvalid };
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const { valid, firstInvalid } = validateForm(data);

      statusEl.textContent = '';
      statusEl.className = 'form-status';

      if (!valid) {
        statusEl.textContent = 'Revisa los campos marcados antes de continuar.';
        statusEl.classList.add('error');
        const field = form.querySelector(`[name="${firstInvalid}"]`);
        if (field) field.focus();
        return;
      }

      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      statusEl.textContent = 'Enviando tu mensaje…';
      statusEl.className = 'form-status';

      if (FORMSPREE_ENDPOINT.endsWith('/TU_ID')) {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        statusEl.textContent = 'El formulario aún no está conectado. Escríbenos a tuwebamano@gmail.com mientras tanto.';
        statusEl.classList.add('error');
        return;
      }

      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
        .then((response) => {
          if (!response.ok) throw new Error('request-failed');
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
          statusEl.textContent = 'Mensaje enviado. Te respondemos por email lo antes posible.';
          statusEl.classList.add('success');
          form.reset();
          Object.keys(validators).forEach((name) => setFieldError(name, ''));
        })
        .catch(() => {
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
          statusEl.textContent = 'No se pudo enviar. Escríbenos directamente a tuwebamano@gmail.com.';
          statusEl.classList.add('error');
        });
    });
  }

  /* ---------------- Back to top ---------------- */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------- Cookies: banner de consentimiento + GA condicionado ---------------- */
  function loadGoogleAnalytics() {
    if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX' || window.__gaLoaded) return;
    window.__gaLoaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
    window.gtag = gtag;
  }

  function initCookieConsent() {
    const banner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookieAccept');
    const rejectBtn = document.getElementById('cookieReject');
    if (!banner || !acceptBtn || !rejectBtn) return;

    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'accepted') { loadGoogleAnalytics(); return; }
    if (consent === 'rejected') return;

    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add('is-visible'));

    const hideBanner = () => {
      banner.classList.remove('is-visible');
      setTimeout(() => { banner.hidden = true; }, 500);
    };

    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookie-consent', 'accepted');
      loadGoogleAnalytics();
      hideBanner();
    });

    rejectBtn.addEventListener('click', () => {
      localStorage.setItem('cookie-consent', 'rejected');
      hideBanner();
    });
  }

  /* ---------------- Cielo estrellado WebGL (Three.js, guarded) ---------------- */
  function initStarScene(canvasId, sectionEl) {
    if (reduceMotion || typeof THREE === 'undefined') return;
    const canvas = document.getElementById(canvasId);
    if (!canvas || !sectionEl) return;

    try {
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(sectionEl.clientWidth, sectionEl.clientHeight);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, sectionEl.clientWidth / sectionEl.clientHeight, 0.1, 100);
      camera.position.z = 8;

      const buildPoints = (count, spread, color, size, opacity) => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          positions[i * 3] = (Math.random() - 0.5) * spread.x;
          positions[i * 3 + 1] = (Math.random() - 0.5) * spread.y;
          positions[i * 3 + 2] = (Math.random() - 0.5) * spread.z;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ color, size, transparent: true, opacity });
        return new THREE.Points(geometry, material);
      };

      const points = buildPoints(800, { x: 16, y: 10, z: 10 }, 0xede6d9, 0.045, 0.6);
      const amberPoints = buildPoints(40, { x: 14, y: 8, z: 8 }, 0xf2a93b, 0.07, 0.85);
      const rustPoints = buildPoints(40, { x: 14, y: 8, z: 8 }, 0xc1502e, 0.07, 0.75);
      scene.add(points);
      scene.add(amberPoints);
      scene.add(rustPoints);

      let mouseX = 0;
      let mouseY = 0;
      window.addEventListener('pointermove', (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
      });

      const resize = () => {
        const w = sectionEl.clientWidth;
        const h = sectionEl.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', resize);

      let scrollProgress = 0;
      if (hasScrollTrigger) {
        ScrollTrigger.create({
          trigger: sectionEl,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => { scrollProgress = self.progress; },
        });
      }

      let visible = false;
      let running = false;

      const animate = () => {
        points.rotation.y += 0.0006;
        amberPoints.rotation.y -= 0.0004;
        rustPoints.rotation.y += 0.0003;
        points.rotation.x = mouseY * 0.2 + scrollProgress * 0.6;
        amberPoints.rotation.x = mouseY * 0.15 + scrollProgress * 0.4;
        rustPoints.rotation.x = mouseY * 0.12 + scrollProgress * 0.35;
        camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.04;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        if (visible) {
          requestAnimationFrame(animate);
        } else {
          running = false;
        }
      };

      const startLoop = () => {
        if (running) return;
        running = true;
        animate();
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          if (visible) startLoop();
        });
      }, { threshold: 0.05 });
      observer.observe(sectionEl);
    } catch (err) {
      // Si WebGL falla, la sección sigue funcionando sin el fondo decorativo.
    }
  }

  /* ---------------- Escenas 3D secundarias (Servicios, Proceso) ---------------- */
  function initSectionScene(canvasId, sectionEl, geometryType, color) {
    if (reduceMotion || typeof THREE === 'undefined') return;
    const canvas = document.getElementById(canvasId);
    if (!canvas || !sectionEl) return;

    try {
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(sectionEl.clientWidth, sectionEl.clientHeight);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, sectionEl.clientWidth / sectionEl.clientHeight, 0.1, 100);
      camera.position.z = 6;

      const geometry = geometryType === 'icosahedron'
        ? new THREE.IcosahedronGeometry(1.8, 0)
        : new THREE.TorusKnotGeometry(1.2, 0.35, 120, 16);

      const wireframe = new THREE.WireframeGeometry(geometry);
      const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 });
      const mesh = new THREE.LineSegments(wireframe, material);
      mesh.position.x = sectionEl.clientWidth > 900 ? 2.6 : 0;
      scene.add(mesh);

      const resize = () => {
        const w = sectionEl.clientWidth;
        const h = sectionEl.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        mesh.position.x = w > 900 ? 2.6 : 0;
      };
      window.addEventListener('resize', resize);

      let visible = false;
      let running = false;

      const animate = () => {
        mesh.rotation.x += 0.0025;
        mesh.rotation.y += 0.0035;
        renderer.render(scene, camera);
        if (visible) {
          requestAnimationFrame(animate);
        } else {
          running = false;
        }
      };

      const startLoop = () => {
        if (running) return;
        running = true;
        animate();
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          if (visible) startLoop();
        });
      }, { threshold: 0.05 });
      observer.observe(sectionEl);
    } catch (err) {
      // Si WebGL falla, la sección sigue funcionando sin el fondo decorativo.
    }
  }

  /* ---------------- Parallax del manifiesto (glow + blobs) ---------------- */
  function initManifestoParallax() {
    const section = document.querySelector('.manifesto');
    const glow = document.getElementById('manifestoGlow');
    const blobLeft = document.getElementById('manifestoBlobLeft');
    const blobRight = document.getElementById('manifestoBlobRight');
    if (!section || !glow || !blobLeft || !blobRight) return;

    const state = { glowY: 120, leftX: -200, rightX: 200, blobY: 0 };

    const tick = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = (vh - rect.top) / (vh + rect.height);
      const progress = Math.min(1, Math.max(0, raw));

      const glowTargetY = 120 + progress * (-160 - 120);
      const inView = progress >= 0.12 && progress <= 0.92;
      const leftTargetX = inView ? 0 : -200;
      const rightTargetX = inView ? 0 : 200;
      const blobTargetY = progress * -50;

      if (reduceMotion) {
        state.glowY = glowTargetY;
        state.leftX = leftTargetX;
        state.rightX = rightTargetX;
        state.blobY = blobTargetY;
      } else {
        state.glowY += (glowTargetY - state.glowY) * 0.06;
        state.leftX += (leftTargetX - state.leftX) * 0.04;
        state.rightX += (rightTargetX - state.rightX) * 0.04;
        state.blobY += (blobTargetY - state.blobY) * 0.04;
      }

      glow.style.transform = `translate3d(-50%, ${state.glowY.toFixed(2)}px, 0)`;

      const leftOpacity = Math.min(1, Math.max(0, 1 - Math.abs(state.leftX) / 200));
      blobLeft.style.transform = `translate3d(${state.leftX.toFixed(2)}px, ${state.blobY.toFixed(2)}px, 0)`;
      blobLeft.style.opacity = leftOpacity.toFixed(2);

      const rightOpacity = Math.min(1, Math.max(0, 1 - Math.abs(state.rightX) / 200));
      blobRight.style.transform = `translate3d(${state.rightX.toFixed(2)}px, ${state.blobY.toFixed(2)}px, 0)`;
      blobRight.style.opacity = rightOpacity.toFixed(2);

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }
})();
