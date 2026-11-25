// =====================================
// MÚSICA AMBIENTAL (generada con Web Audio, no necesita archivo)
// Para usar tu propia canción: guardala en /audio y escribí "./audio/musica.mp3"
// =====================================
const MUSIC_FILE = "";

function createMusic() {
  let ctx, master, bus, timer, audio, step = 0, next = 0, playing = false;
  const hz = m => 440 * 2 ** ((m - 69) / 12);
  const chords = [[45, 52, 59, 60, 64], [41, 48, 57, 60, 64], [48, 55, 59, 64, 67], [43, 50, 59, 62, 66]];
  const bells = [69, 72, 74, 76, 79, 81];

  function setup() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    bus = ctx.createGain();
    const dry = ctx.createGain(); dry.gain.value = .65;
    const wet = ctx.createGain(); wet.gain.value = .6;
    const rev = ctx.createConvolver();
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    }
    rev.buffer = buf;
    bus.connect(dry); dry.connect(master);
    bus.connect(rev); rev.connect(wet); wet.connect(master);
  }

  function tone(freq, t, dur, vol, type, attack) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq; o.detune.value = (Math.random() - .5) * 12;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + .1);
  }

  function schedule() {
    while (next < ctx.currentTime + 6) {
      chords[step++ % chords.length].forEach(n => tone(hz(n), next, 11, .035, "triangle", 3.5));
      for (let i = 0; i < 5; i++) tone(hz(bells[Math.random() * bells.length | 0]), next + 1 + Math.random() * 7, 4, .05, "sine", .02);
      next += 8;
    }
  }

  return {
    get playing() { return playing; },
    play() {
      playing = true;
      if (MUSIC_FILE) {
        audio = audio || Object.assign(new Audio(MUSIC_FILE), { loop: true, volume: .4 });
        audio.play().catch(() => {});
        return;
      }
      if (!ctx) setup();
      ctx.resume();
      next = Math.max(next, ctx.currentTime + .1);
      schedule(); clearInterval(timer); timer = setInterval(schedule, 2000);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(.9, ctx.currentTime, 1.5);
    },
    pause() {
      playing = false;
      if (audio) { audio.pause(); return; }
      if (!ctx) return;
      master.gain.setTargetAtTime(0, ctx.currentTime, .3);
      clearInterval(timer);
      setTimeout(() => { if (!playing) ctx.suspend(); }, 1200);
    }
  };
}

document.addEventListener("DOMContentLoaded", () => {

  // =====================================
  // ANIMACIONES DE APARICIÓN
  // =====================================

  const revealElements = document.querySelectorAll(
    ".section-heading, .panel, .stat-card, .project-card, .skill-item, .contact-panel"
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

  revealElements.forEach(element => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });


  // =====================================
  // BARRA DE PROGRESO
  // =====================================

  const progressBar = document.querySelector(".scroll-progress-fill");

  function updateProgress() {
    const scrollTop = window.scrollY;
    const documentHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const percentage = documentHeight > 0
      ? (scrollTop / documentHeight) * 100
      : 0;

    progressBar.style.width = `${percentage}%`;
  }

  window.addEventListener("scroll", updateProgress);
  updateProgress();


  // =====================================
  // NAVEGACIÓN ACTIVA
  // =====================================

  const navLinks = document.querySelectorAll(".nav-links a");

  const observedSections = document.querySelectorAll(
    "#inicio, #presentacion, #sobre-mi, #publico, #habilidades, #proyectos, #contacto"
  );

  const sectionObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        navLinks.forEach(link => {
          link.classList.remove("active");

          if (link.getAttribute("href") === `#${entry.target.id}`) {
            link.classList.add("active");
          }
        });

      }

    });

  }, {
    rootMargin: "-25% 0px -60% 0px"
  });

  observedSections.forEach(section => {
    sectionObserver.observe(section);
  });


  // =====================================
  // DESPLAZAMIENTO SUAVE
  // =====================================

  navLinks.forEach(link => {

    link.addEventListener("click", event => {

      const targetId = link.getAttribute("href");

      if (!targetId || !targetId.startsWith("#")) return;

      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

    });

  });


  // =====================================
  // EFECTO EN TARJETAS DE PROYECTOS
  // =====================================

  const projectCards = document.querySelectorAll(".project-card");

  // Si una miniatura todavía no fue cargada, muestra el nombre del proyecto.
  document.querySelectorAll(".project-image img").forEach(image => {
    if (image.complete && image.naturalWidth === 0) {
      image.style.display = "none";
      image.parentElement.classList.add("no-image");
    }

    image.addEventListener("error", () => {
      image.style.display = "none";
      image.parentElement.classList.add("no-image");
    });
  });

  projectCards.forEach(card => {

    card.addEventListener("mouseenter", () => {
      card.style.setProperty("--card-active", "1");
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--card-active", "0");
    });

  });


  // =====================================
  // ANIMACIÓN DE HABILIDADES
  // =====================================

  const skillBars = document.querySelectorAll(".skill-bar span");

  const skillObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {
        entry.target.style.width =
          getComputedStyle(entry.target).getPropertyValue("--level");

        skillObserver.unobserve(entry.target);
      }

    });

  }, {
    threshold: 0.4
  });

  skillBars.forEach(bar => {
    bar.style.width = "0";
    skillObserver.observe(bar);
  });


  // =====================================
  // AÑO AUTOMÁTICO EN FOOTER
  // =====================================

  const footerText = document.querySelector(".footer p");

  if (footerText) {
    footerText.textContent =
      `© ${new Date().getFullYear()} Morena Santillan · Todos los derechos reservados.`;
  }


  // =====================================
  // BIENVENIDA Y MÚSICA
  // =====================================

  const music = createMusic();
  const intro = document.getElementById("intro");
  const toggle = document.getElementById("musicToggle");

  const syncToggle = () => {
    toggle.classList.toggle("playing", music.playing);
    toggle.setAttribute("aria-pressed", music.playing);
    toggle.querySelector(".mt-label").textContent = music.playing ? "Música activada" : "Música apagada";
  };

  function enter(withMusic) {
    document.body.classList.add("ready");
    if (intro) { intro.classList.add("hide"); setTimeout(() => intro.remove(), 1000); }
    if (withMusic) music.play();
    syncToggle();
  }

  toggle.addEventListener("click", () => {
    music.playing ? music.pause() : music.play();
    syncToggle();
  });
  document.querySelectorAll("[data-music]").forEach(btn =>
    btn.addEventListener("click", () => enter(btn.dataset.music === "on"))
  );
  if (!intro) enter(false);


  // =====================================
  // VIDEO DE PRESENTACIÓN
  // =====================================

  const videoFrame = document.getElementById("videoFrame");
  const video = document.getElementById("presentationVideo");
  const videoPlay = document.getElementById("videoPlay");

  if (video && videoFrame) {
    let musicWasPlaying = false;

    // Si el archivo todavía no está en /img, muestra un aviso en lugar del reproductor.
    video.querySelector("source").addEventListener("error", () => {
      videoFrame.classList.add("no-video");
    });

    videoPlay.addEventListener("click", () => {
      video.controls = true;
      video.play().catch(() => {});
    });

    video.addEventListener("play", () => {
      videoFrame.classList.add("playing");
      video.controls = true;
      // Pausa la música de fondo mientras suena el video
      if (music.playing) { musicWasPlaying = true; music.pause(); syncToggle(); }
    });

    const resumeMusic = () => {
      if (musicWasPlaying) { musicWasPlaying = false; music.play(); syncToggle(); }
    };
    video.addEventListener("pause", resumeMusic);
    video.addEventListener("ended", () => {
      videoFrame.classList.remove("playing");
      video.controls = false;
      resumeMusic();
    });
  }


  // =====================================
  // INICIO: TEXTO ANIMADO, LUZ Y PROFUNDIDAD
  // =====================================

  const typed = document.getElementById("typed");

  if (typed && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const roles = ["Técnica en Programación", "Desarrollo web", "Diseño UI/UX"];
    let r = 0, c = roles[0].length, deleting = true;

    const tick = () => {
      const word = roles[r];
      c += deleting ? -1 : 1;
      typed.textContent = word.slice(0, c);
      let wait = deleting ? 35 : 70;

      if (!deleting && c === word.length) { deleting = true; wait = 2000; }
      else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; wait = 300; }

      setTimeout(tick, wait);
    };
    setTimeout(tick, 2500);
  }

  const hero = document.querySelector(".hero");
  const photo = document.querySelector(".photo-placeholder");

  hero.addEventListener("pointermove", e => {
    const b = hero.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width;
    const y = (e.clientY - b.top) / b.height;
    hero.style.setProperty("--mx", `${x * 100}%`);
    hero.style.setProperty("--my", `${y * 100}%`);
    photo.style.setProperty("--ry", `${(x - .5) * 10}deg`);
    photo.style.setProperty("--rx", `${(.5 - y) * 8}deg`);
  });

  hero.addEventListener("pointerleave", () => {
    photo.style.setProperty("--rx", "0deg");
    photo.style.setProperty("--ry", "0deg");
  });

  projectCards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const b = card.getBoundingClientRect();
      card.style.setProperty("--px", `${e.clientX - b.left}px`);
      card.style.setProperty("--py", `${e.clientY - b.top}px`);
    });
  });


  // =====================================
  // CONTADORES ANIMADOS
  // =====================================

  document.querySelectorAll(".stat-card strong").forEach(el => {
    const m = el.textContent.match(/^(\d+)(.*)$/);
    if (!m) return;
    const end = +m[1], pad = m[1].length;

    new IntersectionObserver(([entry], obs) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const t0 = performance.now();
      const frame = t => {
        const p = Math.min((t - t0) / 1400, 1);
        el.textContent = String(Math.round(end * (1 - (1 - p) ** 3))).padStart(pad, "0") + m[2];
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }, { threshold: .6 }).observe(el);
  });

});
