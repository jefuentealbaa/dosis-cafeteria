import { instagramReels, locationDetails, socialLinks } from "./site-content.js";

const instagramOrigin = "https://www.instagram.com";
let embedScript;

function httpsUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return url;
  } catch {
    return undefined;
  }
}

function externalLink(label, url) {
  const link = document.createElement("a");
  link.textContent = label;
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function loadInstagram() {
  if (window.instgrm?.Embeds) return Promise.resolve(window.instgrm.Embeds);

  embedScript ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${instagramOrigin}/embed.js`;
    script.async = true;
    script.addEventListener("load", () => {
      const embeds = window.instgrm?.Embeds;
      if (embeds) resolve(embeds);
      else reject(new Error("No se pudo iniciar el reproductor de Instagram."));
    }, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.append(script);
  }).catch(error => {
    embedScript = undefined;
    throw error;
  });

  return embedScript;
}

function makeReel(title, url, cover) {
  const card = document.createElement("article");
  card.className = "social-reel";

  const player = document.createElement("div");
  player.className = "social-player";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "reel-cover";
  button.setAttribute("aria-label", `Ver video: ${title}`);
  const poster = document.createElement("img");
  poster.src = `${import.meta.env.BASE_URL}assets/${cover || "dosis-barra.webp"}`;
  poster.alt = "";
  poster.loading = "lazy";
  poster.decoding = "async";
  const play = document.createElement("span");
  play.className = "reel-cover-play";
  play.setAttribute("aria-hidden", "true");
  button.append(poster, play);
  const status = document.createElement("p");
  status.className = "social-player-status";
  status.setAttribute("role", "status");
  player.append(button, status);

  button.addEventListener("click", async () => {
    button.disabled = true;
    status.textContent = "Cargando video de Instagram…";

    try {
      const embeds = await loadInstagram();
      const post = document.createElement("blockquote");
      post.className = "instagram-media";
      post.dataset.instgrmPermalink = url;
      post.dataset.instgrmVersion = "14";
      post.append(externalLink("Ver video en Instagram", url));
      const restoreFocus = document.activeElement === button;
      player.replaceChildren(post);
      player.classList.add("social-player-active");
      if (restoreFocus) {
        player.tabIndex = -1;
        player.focus({ preventScroll: true });
      }
      embeds.process();
    } catch {
      player.replaceChildren(button, status);
      player.classList.remove("social-player-active");
      button.disabled = false;
      status.textContent = "El reproductor no cargó. Puedes abrir el video en Instagram.";
    }
  });

  const link = externalLink("Abrir en Instagram ↗", url);
  link.setAttribute("aria-label", `Abrir en Instagram: ${title}`);
  card.append(player, link);
  return card;
}

for (const container of document.querySelectorAll("[data-social-links]")) {
  for (const { label, url } of socialLinks) {
    const link = httpsUrl(url);
    if (link && label) container.append(externalLink(label, link));
  }
  container.hidden = container.childElementCount === 0;
}

const reelList = document.querySelector("[data-social-reels]");
for (const { title, url, cover } of instagramReels) {
  const link = httpsUrl(url);
  if (!link || !["instagram.com", "www.instagram.com"].includes(link.hostname)) continue;
  const path = link.pathname.match(/^\/(?:reel|p)\/[\w-]+\/?$/);
  if (!path) continue;
  const permalink = `${instagramOrigin}${path[0].replace(/\/$/, "")}/`;
  reelList.append(makeReel(title || "Reel de Dosis", permalink, cover));
}
reelList.hidden = reelList.childElementCount === 0;
document.querySelector("[data-social-preview]").hidden = !reelList.hidden;

const streetAddress = locationDetails.address.trim();
const mapsUrl = httpsUrl(locationDetails.mapsUrl);
if (streetAddress) {
  for (const field of document.querySelectorAll("[data-visit-address]")) field.textContent = streetAddress;
  const map = document.querySelector("[data-visit-map]");
  const embed = new URL("https://www.google.com/maps");
  embed.search = new URLSearchParams({ q: `${streetAddress}, Concepción, Chile`, z: "17", output: "embed" });
  map.src = embed;
  map.parentElement.hidden = false;
}
if (streetAddress || mapsUrl) {
  const query = encodeURIComponent(streetAddress);
  const destination = mapsUrl || `https://www.google.com/maps/search/?api=1&query=${query}`;
  for (const link of document.querySelectorAll("[data-maps-link]")) {
    link.href = destination;
    link.textContent = "Cómo llegar";
  }
}

const lunchContact = document.querySelector("#almuerzos-reservar").href;
for (const link of document.querySelectorAll("[data-lunch-reservation]")) {
  const meal = link.dataset.lunchReservation;
  const chat = new URL(lunchContact);
  chat.searchParams.set("text", meal
    ? `Hola, Dosis. Me gustaría reservar un almuerzo: ${meal}. ¿Está disponible?`
    : "Hola, Dosis. Me gustaría reservar un almuerzo. ¿Qué opciones tienen disponibles?");
  link.href = chat.href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
}
