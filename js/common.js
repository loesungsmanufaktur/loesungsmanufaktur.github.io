/* ============================================================
   SHARED HELPERS
   Used by both pages: index.html (js/main.js) and
   project.html (js/project.js).
   ============================================================ */

// Where each content file lives
const FILES = {
  config: "content/config.md",
  personal: "content/personal-info.md",
  skills: "content/skills.md",
  certifications: "content/certifications.md",
  projects: "content/projects.md",
};

// Folder that holds one sub-folder per project
const PROJECTS_FOLDER = "projects";

// Download a text file (the Markdown files)
async function loadFile(path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return response.text();
}

// Split a Markdown file into its settings block (between the first
// two "---" lines) and the Markdown body that follows.
// Settings are simple "key: value" lines; lines starting with "#" are comments.
function parseFile(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const settingsText = match ? match[1] : "";
  const body = match ? match[2] : text;

  const settings = {};
  for (const line of settingsText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).trim().replace(/^["']|["']$/g, ""); // remove quotes
    settings[key] = value;
  }
  return { settings, body };
}

// Convert Markdown to safe HTML
function toHtml(markdown) {
  return DOMPurify.sanitize(marked.parse(markdown));
}

// Escape plain text before putting it inside HTML
function escapeText(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Turn "a, b, c" into a row of badges
function badges(list) {
  return (list || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `<span class="badge badge-skill rounded-pill">${escapeText(item)}</span>`)
    .join(" ");
}

// Apply the color palette and site title from config.md
function applyConfig({ settings }) {
  const colors = {
    "--color-bg": settings.background,
    "--color-text": settings.typography,
    "--color-accent-main": settings.accent_main,
    "--color-accent-mid": settings.accent_mid,
    "--color-highlight": settings.highlight,
  };
  const root = document.documentElement.style;
  for (const [variable, value] of Object.entries(colors)) {
    if (value) root.setProperty(variable, value);
  }

  // Bootstrap's link color needs the main accent as "r, g, b"
  const hex = settings.accent_main;
  if (/^#[0-9a-f]{6}$/i.test(hex || "")) {
    const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(", ");
    root.setProperty("--bs-link-color-rgb", rgb);
  }

  if (settings.site_title) {
    document.getElementById("site-title").textContent = settings.site_title;
  }
  return settings;
}

// Footer text, e.g. "© 2026 Your Name"
function renderFooter(name) {
  document.getElementById("footer-text").textContent = `© ${new Date().getFullYear()} ${name || ""}`;
}

// ---------- Projects ----------

// Load one project: projects/<folder>/index.md
// Returns { folder, settings, body }
async function loadProject(folder) {
  // Only allow simple folder names (letters, numbers, - and _)
  if (!/^[\w-]+$/.test(folder || "")) throw new Error(`Invalid project folder: ${folder}`);
  const { settings, body } = parseFile(await loadFile(`${PROJECTS_FOLDER}/${folder}/index.md`));
  return { folder, settings, body };
}

// Full path of a file inside a project folder (used for images)
function projectFile(folder, fileName) {
  return `${PROJECTS_FOLDER}/${folder}/${fileName}`;
}

// Markdown in a project refers to images by file name only ("diagram.svg").
// This rewrites those relative paths so they point inside the project folder.
function fixProjectPaths(container, folder) {
  const base = new URL(`${PROJECTS_FOLDER}/${folder}/`, location.href);
  const isRelative = (path) => path && !/^([a-z]+:|\/|#)/i.test(path);

  container.querySelectorAll("img[src]").forEach((img) => {
    if (isRelative(img.getAttribute("src"))) img.src = new URL(img.getAttribute("src"), base);
  });
  container.querySelectorAll("a[href]").forEach((link) => {
    if (isRelative(link.getAttribute("href"))) link.href = new URL(link.getAttribute("href"), base);
  });
}
