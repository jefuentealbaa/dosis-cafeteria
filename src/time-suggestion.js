// Recomendación del hero según la hora de Chile:
// mañana y tarde -> café y algo dulce; 13:00 a 16:00 -> almuerzo.
// Solo se muestra mientras el local está abierto (usa el mismo horario que open-status.js).
import { SCHEDULE, santiagoNow } from "./open-status.js";

const LUNCH_START = 13 * 60;
const LUNCH_END = 16 * 60;

const SUGGESTIONS = {
  morning: { text: "Esta mañana: café y algo dulce", href: "#carta" },
  lunch: { text: "Hora de almorzar: ver almuerzos", href: "#almuerzos" },
  afternoon: { text: "Pausa de la tarde: café y algo dulce", href: "#carta" }
};

function currentSuggestion() {
  const { day, minutes } = santiagoNow();
  const hours = SCHEDULE[day];
  if (!hours || minutes < hours.open * 60 || minutes >= hours.close * 60) return null;
  if (minutes >= LUNCH_START && minutes < LUNCH_END) return SUGGESTIONS.lunch;
  return minutes < LUNCH_START ? SUGGESTIONS.morning : SUGGESTIONS.afternoon;
}

const link = document.querySelector("[data-time-suggestion]");

function render() {
  const suggestion = currentSuggestion();
  link.hidden = !suggestion;
  if (!suggestion) return;
  link.href = suggestion.href;
  link.querySelector("span").textContent = suggestion.text;
}

if (link) {
  render();
  setInterval(() => { if (!document.hidden) render(); }, 60_000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
}
