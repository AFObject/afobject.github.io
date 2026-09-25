const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeLabel = document.querySelector(".theme-label");
const themeMeta = document.querySelector('meta[name="theme-color"]');
const header = document.querySelector(".site-header");
const rotator = document.querySelector(".word-rotator");
const horizontalRunner = document.querySelector(".horizontal-runner");
const featureTrack = document.querySelector(".feature-track");
const projectCounter = document.querySelector(".horizontal-guide strong b");
const projectItems = [...document.querySelectorAll(".feature-track a")];
const researchStage = document.querySelector(".research-stage");
const researchStageButtons = [...document.querySelectorAll(".research-pipeline button")];
const researchStageIndex = document.querySelector(".stage-index");
const researchStageTitle = document.querySelector(".stage-title");
const researchStageDescription = document.querySelector(".stage-description");

const themes = {
  dark: { label: "Dark", aria: "切换为浅色模式", color: "#090a0c" },
  light: { label: "Light", aria: "切换为深色模式", color: "#f1f0eb" },
};

const themeStorageKey = "yz-theme-preference-v2";
const savedTheme = localStorage.getItem(themeStorageKey);
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

function setTheme(theme) {
  const next = themes[theme] ? theme : systemTheme.matches ? "dark" : "light";
  root.dataset.theme = next;
  themeLabel.textContent = themes[next].label;
  themeToggle.setAttribute("aria-label", themes[next].aria);
  themeToggle.setAttribute("aria-pressed", String(next === "dark"));
  themeMeta.setAttribute("content", themes[next].color);
}

setTheme(savedTheme || (systemTheme.matches ? "dark" : "light"));

systemTheme.addEventListener("change", (event) => {
  if (!localStorage.getItem(themeStorageKey)) {
    setTheme(event.matches ? "dark" : "light");
  }
});

themeToggle.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next);
  localStorage.setItem(themeStorageKey, next);
});

let projectDistance = 0;
let projectStart = 0;
let projectTicking = false;

function updateProjectTrack() {
  projectTicking = false;
  header.classList.toggle("scrolled", window.scrollY > 24);

  if (!horizontalRunner || !featureTrack || window.innerWidth <= 820) return;

  const scrollRange = horizontalRunner.offsetHeight - window.innerHeight;
  const progress = Math.max(0, Math.min(1, (window.scrollY - projectStart) / scrollRange));
  featureTrack.style.setProperty("--track-x", `${-projectDistance * progress}px`);
  horizontalRunner.style.setProperty("--project-progress", progress.toFixed(4));

  if (projectCounter) {
    const active = Math.min(projectItems.length, 1 + Math.round(progress * (projectItems.length - 1)));
    projectCounter.textContent = String(active).padStart(2, "0");
  }
}

function requestProjectUpdate() {
  if (projectTicking) return;
  projectTicking = true;
  window.requestAnimationFrame(updateProjectTrack);
}

function layoutProjectTrack() {
  if (!horizontalRunner || !featureTrack) return;

  if (window.innerWidth <= 820) {
    projectDistance = 0;
    horizontalRunner.style.removeProperty("--runner-height");
    featureTrack.style.removeProperty("--track-x");
    horizontalRunner.style.setProperty("--project-progress", "0");
    return;
  }

  projectDistance = Math.max(0, featureTrack.scrollWidth - window.innerWidth);
  projectStart = horizontalRunner.getBoundingClientRect().top + window.scrollY;
  horizontalRunner.style.setProperty("--runner-height", `${window.innerHeight + projectDistance}px`);
  updateProjectTrack();
}

window.addEventListener("scroll", requestProjectUpdate, { passive: true });
window.addEventListener("resize", layoutProjectTrack, { passive: true });
window.addEventListener("load", layoutProjectTrack, { once: true });
window.requestAnimationFrame(layoutProjectTrack);

function selectResearchStage(button) {
  if (!researchStage || !button) return;

  researchStageButtons.forEach((item) => item.classList.toggle("active", item === button));
  researchStage.dataset.stageActive = button.dataset.stage;
  researchStageIndex.textContent = `${button.dataset.index} / 04`;
  researchStageTitle.textContent = button.dataset.title;
  researchStageDescription.textContent = button.dataset.copy;
}

researchStageButtons.forEach((button) => {
  button.addEventListener("click", () => selectResearchStage(button));
  button.addEventListener("pointerenter", () => selectResearchStage(button));
  button.addEventListener("focus", () => selectResearchStage(button));
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -7%" },
);

document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

const rotatingWords = ["music.", "learning.", "thought."];
let wordIndex = 0;

window.setInterval(() => {
  rotator.classList.add("out");
  window.setTimeout(() => {
    wordIndex = (wordIndex + 1) % rotatingWords.length;
    rotator.textContent = rotatingWords[wordIndex];
    rotator.classList.remove("out");
  }, 180);
}, 2600);

if (window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener(
    "pointermove",
    (event) => {
      root.style.setProperty("--mouse-x", `${event.clientX}px`);
      root.style.setProperty("--mouse-y", `${event.clientY}px`);
    },
    { passive: true },
  );
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
