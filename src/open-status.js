// Estado "Abierto ahora / Cerrado" calculado siempre con la hora de Chile,
// sin importar la zona horaria de quien visita la web.
// Si cambian los horarios, actualizar también los bloques de horario en index.html.
const TIME_ZONE = "America/Santiago";
const DAY_NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

// Índice = día de la semana (0 = domingo). Horas en formato 24 h, null = cerrado.
export const SCHEDULE = [
  null,
  { open: 10, close: 19 },
  { open: 10, close: 19 },
  { open: 10, close: 19 },
  { open: 10, close: 19 },
  { open: 10, close: 19 },
  { open: 10, close: 15 }
];

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  weekday: "short",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23"
});
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function santiagoNow() {
  const parts = Object.fromEntries(formatter.formatToParts(new Date()).map(part => [part.type, part.value]));
  return {
    day: WEEKDAYS.indexOf(parts.weekday),
    minutes: Number(parts.hour) * 60 + Number(parts.minute)
  };
}

const hhmm = hour => `${String(hour).padStart(2, "0")}:00`;

function nextOpening(day) {
  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDay = (day + offset) % 7;
    const hours = SCHEDULE[nextDay];
    if (hours) return { hours, label: offset === 1 ? "mañana" : `el ${DAY_NAMES[nextDay]}` };
  }
  return null;
}

function currentStatus() {
  const { day, minutes } = santiagoNow();
  const today = SCHEDULE[day];

  if (today && minutes >= today.open * 60 && minutes < today.close * 60) {
    return { day, open: true, text: `Abierto ahora · cierra a las ${hhmm(today.close)}` };
  }
  if (today && minutes < today.open * 60) {
    return { day, open: false, text: `Cerrado · abre hoy a las ${hhmm(today.open)}` };
  }
  const next = nextOpening(day);
  return {
    day,
    open: false,
    text: next ? `Cerrado · abre ${next.label} a las ${hhmm(next.hours.open)}` : "Cerrado"
  };
}

function render() {
  const status = currentStatus();

  for (const badge of document.querySelectorAll("[data-open-status]")) {
    badge.textContent = status.text;
    badge.dataset.state = status.open ? "open" : "closed";
    badge.hidden = false;
  }
  for (const row of document.querySelectorAll("[data-days]")) {
    const days = row.dataset.days.split(",").map(Number);
    row.classList.toggle("is-today", days.includes(status.day));
  }
}

render();
setInterval(() => { if (!document.hidden) render(); }, 60_000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
