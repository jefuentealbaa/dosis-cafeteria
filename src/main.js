import "./interactions.js";
import "./site-details.js";
import "./open-status.js";
import "./time-suggestion.js";
import "./motion.js";

const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
let heroObserver;

function watchHero() {
  heroObserver?.disconnect();
  const headerHeight = header.getBoundingClientRect().height;
  const updateBackground = () => {
    header.classList.toggle("is-solid", hero.getBoundingClientRect().bottom < headerHeight);
  };

  updateBackground();
  heroObserver = new IntersectionObserver(updateBackground, {
    rootMargin: `-${headerHeight}px 0px 0px`
  });
  heroObserver.observe(hero);
}

const headerObserver = new ResizeObserver(watchHero);
headerObserver.observe(header);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    headerObserver.disconnect();
    heroObserver?.disconnect();
  });
}
