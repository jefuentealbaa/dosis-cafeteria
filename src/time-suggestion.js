// Recomendación del hero según la hora de Chile:
// 10:00 a 12:59 -> desayuno; 13:00 a 16:00 -> almuerzo; 16:01 al cierre -> café de la tarde.
// Solo se muestra mientras el local está abierto (usa el mismo horario que open-status.js).
import { SCHEDULE, santiagoNow } from "./open-status.js";

const LUNCH_START = 13 * 60;
const LUNCH_END = 16 * 60;

const SUGGESTIONS = {
  morning: { text: "¿Buscas qué desayunar? Revisa la carta", href: "#carta" },
  lunch: { text: "¿Hora de almorzar? Prueba un gohan", href: "#almuerzos" },
  afternoon: { text: "¿Un cafecito por la tarde?", href: "#carta" }
};

function currentSuggestion() {
  const { day, minutes } = santiagoNow();
  const hours = SCHEDULE[day];
  if (!hours || minutes < hours.open * 60 || minutes >= hours.close * 60) return null;
  if (minutes >= LUNCH_START && minutes <= LUNCH_END) return SUGGESTIONS.lunch;
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
