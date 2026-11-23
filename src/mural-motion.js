import { gsap } from "gsap";

export function animateMuralIllustrations() {
  const mural = document.querySelector(".mural");
  const toggle = mural.querySelector(".mural-motion-toggle");
  const scenes = new Map();
  let pausedByVisitor = false;

  function syncScene(scene) {
    const active = scene.visible && !pausedByVisitor && !document.hidden;
    for (const loop of scene.loops) loop.paused(!active);
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const scene = scenes.get(entry.target);
      scene.visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
      syncScene(scene);
    }
  }, { threshold: 0.15 });

  function watchScene(element, loops) {
    scenes.set(element, { loops, visible: false });
    observer.observe(element);
  }

  const sky = mural.querySelector(".mural-kicker");
  const drift = gsap.to(sky.querySelector(".mural-cloud"), {
    x: 7, y: -2, duration: 4.8, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true
  });
  const clockHand = sky.querySelector(".mural-clock-hand");
  const clock = gsap.timeline({ repeat: -1, paused: true });
  for (let tick = 1; tick <= 12; tick++) {
    clock.to(clockHand, { rotation: tick * 30, svgOrigin: "37 25", duration: 0.4, ease: "sine.inOut" }, 3.8 + (tick - 1) * 6);
  }
  watchScene(sky, [drift, clock]);

  const characters = mural.querySelector(".mural-characters");
  const cup = characters.querySelector(".mural-eyed-cup");
  const cupEyes = cup.querySelectorAll(".mural-cup-eye");
  const face = characters.querySelector(".mural-happy-cloud");
  const smileEyes = face.querySelector(".mural-smile-eyes");
  const float = gsap.to(cup, { y: -3, duration: 3.8, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true });
  const reaction = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: "sine.inOut" } });
  reaction
    .to(cupEyes, { scaleY: 0.1, transformOrigin: "center", duration: 0.1, stagger: 0.105 }, 5.2)
    .to(cupEyes, { scaleY: 1, duration: 0.13, stagger: 0.105 }, 5.32)
    .to(smileEyes, { scaleY: 0.36, transformOrigin: "center bottom", duration: 0.16 }, 5.78)
    .to(face, { y: -2.5, duration: 0.145, yoyo: true, repeat: 3 }, 5.78)
    .to(smileEyes, { scaleY: 1, duration: 0.2 }, 6.16);
  watchScene(characters, [float, reaction]);

  const music = mural.querySelector(".mural-rock-lockup");
  const ribbon = music.querySelector(".mural-rock-ribbon");
  const outline = ribbon.querySelector(".mural-rock-outline");
  const lettering = ribbon.querySelector("#mural-rock-lettering");
  const originalOutline = outline.getAttribute("d");
  const originalLettering = lettering.getAttribute("d");
  const guitar = music.querySelector(".mural-guitar");
  const strings = guitar.querySelector(".mural-guitar-strings");
  const sway = gsap.fromTo(guitar, { rotation: -3 }, {
    rotation: 4, transformOrigin: "50% 38%", duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true, immediateRender: false
  });
  const rhythm = gsap.timeline({ repeat: -1, paused: true });
  rhythm
    .to(outline, {
      attr: { d: "M11 42C64 15 122 10 173 23 219 32 257 35 288 16l-8 45c-28 13-64 21-112 12-53-12-99-7-145 11Z" },
      duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: 1
    }, 7.4)
    .to(lettering, {
      attr: { d: "M29 63C75 43 121 36 173 48 213 56 248 58 271 45" },
      duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: 1
    }, 7.4)
    .to(strings, { x: 1.1, y: 0.7, duration: 0.05, ease: "sine.inOut", yoyo: true, repeat: 7 }, 7.7);
  watchScene(music, [sway, rhythm]);

  const vinyl = document.querySelector(".mural-vinyl");
  const spin = gsap.to(vinyl, { rotation: 360, transformOrigin: "center", duration: 20, ease: "none", repeat: -1, paused: true });
  watchScene(vinyl.parentElement, [spin]);

  const cassette = document.querySelector(".social-heading-meta");
  const cassetteReels = cassette.querySelectorAll(".mural-cassette-reel");
  const reels = gsap.to(cassetteReels, {
    rotation: 360, transformOrigin: "center", duration: 9, ease: "none", repeat: -1, paused: true
  });
  watchScene(cassette, [reels]);

  const updateTempo = () => reels.timeScale(cassette.matches(":hover, :focus-within") ? 2.4 : 1);
  const cassetteEvents = ["pointerenter", "pointerleave", "focusin", "focusout"];
  const syncAll = () => { for (const scene of scenes.values()) syncScene(scene); };
  const toggleMotion = () => {
    pausedByVisitor = !pausedByVisitor;
    toggle.textContent = pausedByVisitor ? "Reanudar animaciones" : "Pausar animaciones";
    syncAll();
  };

  for (const event of cassetteEvents) cassette.addEventListener(event, updateTempo);
  document.addEventListener("visibilitychange", syncAll);
  toggle.addEventListener("click", toggleMotion);
  toggle.hidden = false;

  return () => {
    observer.disconnect();
    for (const scene of scenes.values()) {
      for (const loop of scene.loops) loop.kill();
    }
    for (const event of cassetteEvents) cassette.removeEventListener(event, updateTempo);
    document.removeEventListener("visibilitychange", syncAll);
    toggle.removeEventListener("click", toggleMotion);
    const movingParts = [sky.querySelector(".mural-cloud"), clockHand, cup, ...cupEyes, face, smileEyes, guitar, strings, vinyl, ...cassetteReels];
    for (const part of movingParts) {
      part.style.removeProperty("transform");
      part.style.removeProperty("transform-origin");
      part.removeAttribute("transform");
      part.removeAttribute("data-svg-origin");
    }
    outline.setAttribute("d", originalOutline);
    lettering.setAttribute("d", originalLettering);
    toggle.textContent = "Pausar animaciones";
    toggle.hidden = true;
  };
}
