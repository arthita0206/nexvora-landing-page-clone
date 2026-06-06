const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-links a");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  navMenu.classList.toggle("open", !isOpen);
});

const themeButton = document.querySelector(".theme-button");
const lightThemeClass = "light-theme";
const themeStorageKey = "nexvora-theme";

function updateThemeIcon(isLight) {
  if (!themeButton) return;
  themeButton.textContent = isLight ? "🌙" : "☀";
  themeButton.setAttribute(
    "aria-label",
    isLight ? "Switch to dark mode" : "Switch to light mode"
  );
}

function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle(lightThemeClass, isLight);
  updateThemeIcon(isLight);
}

function saveTheme(theme) {
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch (error) {
    console.warn("Unable to save theme preference:", error);
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle(lightThemeClass);
  const nextTheme = isLight ? "light" : "dark";
  updateThemeIcon(isLight);
  saveTheme(nextTheme);
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navMenu.classList.remove("open");
  });
});

if (themeButton) {
  themeButton.addEventListener("click", toggleTheme);
}

const savedTheme = localStorage.getItem(themeStorageKey);
applyTheme(savedTheme === "light" ? "light" : "dark");

// Hero network background
const canvas = document.querySelector(".network-canvas");
const context = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let points = [];
let animationFrame;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const pointCount = Math.max(32, Math.round(rect.width / 32));
  points = Array.from({ length: pointCount }, (_, index) => {
    const cluster = index % 3;
    const areaStart = cluster * (rect.width / 3);
    return {
      x: areaStart + Math.random() * (rect.width / 3),
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 0.13,
      vy: (Math.random() - 0.5) * 0.13,
      radius: Math.random() * 1.6 + 0.8,
    };
  });
}

function drawNetwork() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  context.clearRect(0, 0, width, height);

  points.forEach((point, index) => {
    if (!reduceMotion) {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < 0 || point.x > width) point.vx *= -1;
      if (point.y < 0 || point.y > height) point.vy *= -1;
    }

    points.slice(index + 1).forEach((otherPoint) => {
      const distance = Math.hypot(point.x - otherPoint.x, point.y - otherPoint.y);
      if (distance < 175) {
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(otherPoint.x, otherPoint.y);
        context.strokeStyle = `rgba(103, 15, 132, ${0.23 * (1 - distance / 175)})`;
        context.lineWidth = 1;
        context.stroke();
      }
    });

    context.beginPath();
    context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    context.fillStyle = "rgba(4, 217, 230, 0.72)";
    context.shadowColor = "rgba(2, 225, 238, 0.7)";
    context.shadowBlur = 5;
    context.fill();
    context.shadowBlur = 0;
  });

  if (!reduceMotion) animationFrame = requestAnimationFrame(drawNetwork);
}

function initializeNetwork() {
  cancelAnimationFrame(animationFrame);
  resizeCanvas();
  drawNetwork();
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initializeNetwork, 150);
});

initializeNetwork();
