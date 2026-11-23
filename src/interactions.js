import { ScrollTrigger } from "gsap/ScrollTrigger";

const menu = document.querySelector("[data-menu]");
const menuFilters = menu.querySelector(".menu-filters");
const menuButtons = [...menuFilters.querySelectorAll("[data-menu-filter]")];
const menuContent = menu.querySelector("#menu-categorias");
const menuCategories = [...menu.querySelectorAll("[data-menu-category]")];
const menuStatus = menu.querySelector(".menu-status");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const tiltQuery = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
const menuEase = "cubic-bezier(.22,1,.36,1)";
const visibleCards = new IntersectionObserver(entries => {
  entries.forEach(({ target, isIntersecting }) => {
    target.classList.toggle("menu-card-visible", isIntersecting);
  });
});

for (const card of menu.querySelectorAll(".menu-card")) {
  const surface = card.querySelector(".menu-card-surface");
  visibleCards.observe(card);

  card.addEventListener("pointermove", event => {
    if (!tiltQuery.matches || event.pointerType !== "mouse") return;

    const { left, top, width, height } = card.getBoundingClientRect();
    const x = (event.clientX - left) / width - 0.5;
    const y = (event.clientY - top) / height - 0.5;
    surface.style.setProperty("--card-tilt-x", `${-y * 10}deg`);
    surface.style.setProperty("--card-tilt-y", `${x * 12}deg`);
  });

  card.addEventListener("pointerleave", () => {
    surface.style.removeProperty("--card-tilt-x");
    surface.style.removeProperty("--card-tilt-y");
  });
}

function revealCategory(category, direction) {
  const heading = category.querySelector("h3");
  const title = heading.querySelector("span");
  const photo = category.querySelector(".menu-card-photo");
  const products = category.querySelector(".menu-products");
  const wipeStart = direction > 0 ? "inset(-.2em 100% -.2em -.2em)" : "inset(-.2em -.2em -.2em 100%)";
  const ruleOrigin = direction > 0 ? "left" : "right";

  title.animate([
    { clipPath: wipeStart, translate: `${direction * 12}px 0` },
    { clipPath: "inset(-.2em)", translate: "0 0" }
  ], { duration: 510, easing: menuEase });

  photo.animate([
    { clipPath: direction > 0 ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" },
    { clipPath: "inset(0)" }
  ], { duration: 490, delay: 45, easing: menuEase, fill: "backwards" });

  products.animate([
    { opacity: 0, translate: "0 10px" },
    { opacity: 1, translate: "0 0" }
  ], { duration: 480, delay: 140, easing: menuEase, fill: "backwards" });

  heading.animate([
    { backgroundSize: "0% .09em", backgroundPositionX: ruleOrigin },
    { backgroundSize: "100% .09em", backgroundPositionX: ruleOrigin }
  ], { duration: 385, delay: 80, easing: menuEase, fill: "backwards" });

  category.querySelectorAll(".menu-group").forEach((group, index) => {
    group.animate([
      { opacity: 0, translate: "0 12px" },
      { opacity: 1, translate: "0 0" }
    ], { duration: 420, delay: 120 + index * 65, easing: menuEase, fill: "backwards" });
  });
}

function selectMenuFilter(selected, { animate = true } = {}) {
  if (selected.getAttribute("aria-pressed") === "true") return;

  const filter = selected.dataset.menuFilter;
  const nextIndex = menuButtons.indexOf(selected);
  const currentIndex = menuButtons.findIndex(button => button.getAttribute("aria-pressed") === "true");
  menuContent.getAnimations({ subtree: true }).forEach(animation => {
    if (!(animation instanceof CSSAnimation)) animation.cancel();
  });
  menuFilters.style.setProperty("--active-filter", nextIndex);
  menuButtons.forEach(button => button.setAttribute("aria-pressed", String(button === selected)));
  for (const category of menuCategories) {
    category.hidden = filter !== "toda" && category.dataset.menuCategory !== filter;
  }
  menuStatus.textContent = filter === "toda" ? "Mostrando toda la carta." : "Categoría visible: " + selected.textContent + ".";

  if (animate && !reducedMotion.matches) {
    revealCategory(menuCategories.find(category => !category.hidden), Math.sign(nextIndex - currentIndex));
    ScrollTrigger.refresh(true);
  }
}

menuFilters.hidden = false;
menuFilters.addEventListener("click", event => {
  const selected = event.target.closest("[data-menu-filter]");
  if (selected) selectMenuFilter(selected);
});

const heroMenuLink = document.querySelector("[data-menu-jump]");
const heroMenuFilter = menuButtons.find(button => button.dataset.menuFilter === heroMenuLink.dataset.menuJump);

heroMenuLink.addEventListener("click", event => {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  selectMenuFilter(heroMenuFilter);
});

if (location.hash === heroMenuLink.hash) selectMenuFilter(heroMenuFilter, { animate: false });
