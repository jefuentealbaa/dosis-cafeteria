import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animateMuralIllustrations } from "./mural-motion.js";

gsap.registerPlugin(ScrollTrigger);

const hero = document.querySelector(".hero");
const motion = gsap.matchMedia();

function enterOnScroll(trigger) {
  return { trigger, start: "top bottom", once: true };
}

function animateLunch(context) {
  const items = [...document.querySelectorAll(".lunch-family-heading, .lunch-card")]
    .filter(item => item.getBoundingClientRect().top >= window.innerHeight);
  if (!items.length) return;

  gsap.set(items, { y: 12, opacity: 0 });
  ScrollTrigger.batch(items, {
    start: "top bottom",
    once: true,
    interval: 0.06,
    onEnter: batch => context.add(() => {
      gsap.to(batch, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.075,
        ease: "power2.out",
        clearProps: "opacity,transform"
      });
    })
  });
}

function animatePageSections() {
  const visitCopy = document.querySelector(".visit-copy");
  gsap.from(visitCopy.children, {
    y: 25,
    opacity: 0,
    stagger: 0.09,
    duration: 0.54,
    ease: "power3.out",
    immediateRender: false,
    clearProps: "opacity,transform",
    scrollTrigger: enterOnScroll(visitCopy)
  });

  const mural = document.querySelector(".mural-grid");
  if (mural.getBoundingClientRect().top >= window.innerHeight) {
    gsap.from(mural, {
      opacity: 0,
      y: 6,
      duration: 0.45,
      ease: "sine.out",
      immediateRender: true,
      clearProps: "opacity,transform",
      scrollTrigger: enterOnScroll(mural)
    });
  }

  const galleryPhotos = document.querySelectorAll(".gallery-photo");
  for (const [index, frame] of galleryPhotos.entries()) {
    const delay = (index % 2) * 0.1;
    gsap.timeline({
      defaults: { ease: "power3.out", immediateRender: false },
      scrollTrigger: enterOnScroll(frame)
    })
      .fromTo(frame, { clipPath: "inset(0 0 100% 0 round .45rem)" }, {
        clipPath: "inset(0 0 0% 0 round .45rem)",
        duration: 0.68,
        clearProps: "clipPath"
      }, delay)
      .from(frame.querySelector("img"), { scale: 1.09, duration: 0.82, clearProps: "transform" }, delay);
  }

  const visitMap = document.querySelector(".visit-map:not([hidden])");
  if (!visitMap) return;
  gsap.from(visitMap, {
    y: 26,
    opacity: 0,
    duration: 0.7,
    ease: "power3.out",
    immediateRender: false,
    clearProps: "opacity,transform",
    scrollTrigger: enterOnScroll(visitMap)
  });
}

motion.add("(prefers-reduced-motion: no-preference)", context => {
  const copy = hero.querySelector(".hero-copy");
  const stage = hero.querySelector(".hero-stage");
  const art = hero.querySelector(".hero-art");
  const photo = art.querySelector("img");
  const select = gsap.utils.selector(hero);
  const root = document.documentElement;
  let introActive = true;

  if (root.classList.contains("hero-intro") && stage.getBoundingClientRect().bottom > 0) {
    const lines = select(".hero-title-line > span");
    const locationLabel = hero.querySelector(".hero-location");
    const actions = hero.querySelector(".hero-actions");
    const note = hero.querySelector(".hero-note");
    const glow = hero.querySelector(".hero-glow");
    const muralStrokes = select(".hero-mural-mark path");

    gsap.set(lines, { y: 0, yPercent: 108, x: index => index === 0 ? -16 : 16, force3D: true });
    gsap.set([locationLabel, actions, note], { y: 12, opacity: 0 });
    gsap.set(glow, { opacity: 0 });
    gsap.set(muralStrokes, { strokeDashoffset: 1 });
    gsap.set(art, { y: Math.min(126, stage.clientHeight * 0.44), opacity: 0, force3D: true });

    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to(locationLabel, { y: 0, opacity: 1, duration: 0.34 }, 0)
      .to(lines, { yPercent: 0, x: 0, duration: 0.72, stagger: 0.1 }, 0)
      .to(glow, { opacity: 1, duration: 0.76 }, 0.08)
      .to(actions, { y: 0, opacity: 1, duration: 0.42 }, 0.27)
      .to(note, { y: 0, opacity: 1, duration: 0.46 }, 0.43)
      .to(muralStrokes, { strokeDashoffset: 0, duration: 0.68, stagger: 0.085 }, 0.42);

    const enterPhoto = gsap.to(art, { y: 0, opacity: 1, duration: 0.84, ease: "power3.out", paused: true });
    photo.decode().then(
      () => { if (introActive) enterPhoto.play(); },
      () => { if (introActive) enterPhoto.progress(1); }
    );
  }
  root.classList.remove("hero-intro");

  gsap.set(photo, { xPercent: -50, x: 0 });
  gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom top",
      invalidateOnRefresh: true,
      scrub: 0.45
    }
  })
    .to(photo, {
      xPercent: -50,
      x: 0,
      y: () => -Math.min(48, stage.clientHeight * 0.15),
      scale: 1.14,
      force3D: true
    }, 0)
    .to(copy, { yPercent: -9 }, 0);

  for (const section of document.querySelectorAll(".reveal")) {
    gsap.from(section, {
      opacity: 0,
      y: 18,
      duration: 0.65,
      ease: "power2.out",
      clearProps: "opacity,transform",
      scrollTrigger: {
        trigger: section,
        start: "top 90%",
        once: true
      }
    });
  }

  animatePageSections();
  animateLunch(context);
  const stopMuralMotion = animateMuralIllustrations();

  return () => {
    introActive = false;
    stopMuralMotion();
  };
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => motion.revert());
}
