/* ============================================================
   PORTFOLIO LOADER
   Reads the Markdown files in /content and fills the page.
   You normally don't need to edit this file - change the
   content files instead.
   ============================================================ */

// Where each content file lives
const FILES = {
  config: "content/config.md",
  personal: "content/personal-info.md",
  skills: "content/skills.md",
  certifications: "content/certifications.md",
  projects: "content/projects.md",
};

// ---------- Helpers ----------

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

// Split a Markdown body into an intro (text before the first "## ")
// and a list of sections: [{ title, body }]
function splitSections(body) {
  const parts = body.split(/^## /m);
  const intro = parts.shift().trim();
  const sections = parts.map((part) => {
    const [title, ...rest] = part.split(/\r?\n/);
    return { title: title.trim(), body: rest.join("\n").trim() };
  });
  return { intro, sections };
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
  return list
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `<span class="badge badge-skill rounded-pill">${escapeText(item)}</span>`)
    .join(" ");
}

// ---------- Page sections ----------

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
    document.title = settings.site_title;
    document.getElementById("site-title").textContent = settings.site_title;
  }
}

// Fill the hero header and the About section from personal-info.md
function renderPersonal({ settings, body }) {
  document.getElementById("name").textContent = settings.name || "";
  document.getElementById("role").textContent = settings.role || "";

  const location = document.getElementById("location");
  location.innerHTML = settings.location ? `<i class="bi bi-geo-alt"></i> ${escapeText(settings.location)}` : "";

  if (settings.photo) {
    const photo = document.getElementById("photo");
    photo.src = settings.photo;
    photo.alt = settings.name || "Profile photo";
    photo.hidden = false;
  }

  // Contact buttons - only shown when a value is filled in
  const links = [
    { key: "email", icon: "bi-envelope", label: "Email", href: (v) => `mailto:${v}` },
    { key: "linkedin", icon: "bi-linkedin", label: "LinkedIn", href: (v) => v },
    { key: "github", icon: "bi-github", label: "GitHub", href: (v) => v },
  ];
  document.getElementById("contact-links").innerHTML = links
    .filter((link) => settings[link.key])
    .map((link) => `<a class="btn btn-highlight btn-sm" href="${escapeText(link.href(settings[link.key]))}" target="_blank" rel="noopener">
        <i class="bi ${link.icon}"></i> ${link.label}</a>`)
    .join("");

  document.getElementById("about-content").innerHTML = toHtml(body);
  document.getElementById("footer-text").textContent = `© ${new Date().getFullYear()} ${settings.name || ""}`;
}

// Skills: one card per "## Category", badges from the comma-separated line
function renderSkills({ body }) {
  const { intro, sections } = splitSections(body);
  document.getElementById("skills-intro").innerHTML = toHtml(intro);
  document.getElementById("skills-content").innerHTML = sections
    .map((s) => `
      <div class="col-sm-6 col-lg-4">
        <div class="card"><div class="card-body">
          <h3 class="card-title h6">${escapeText(s.title)}</h3>
          <div class="d-flex flex-wrap gap-1">${badges(s.body)}</div>
        </div></div>
      </div>`)
    .join("");
}

// Certifications: one card per "## Certification"
function renderCertifications({ body }) {
  const { intro, sections } = splitSections(body);
  document.getElementById("certifications-intro").innerHTML = toHtml(intro);
  document.getElementById("certifications-content").innerHTML = sections
    .map((s) => `
      <div class="col-md-6">
        <div class="card cert-card"><div class="card-body">
          <h3 class="card-title h5"><i class="bi bi-patch-check"></i> ${escapeText(s.title)}</h3>
          <div class="card-text">${toHtml(s.body)}</div>
        </div></div>
      </div>`)
    .join("");
}

// Projects: one card per "## Project", optional "Tags:" line becomes badges
function renderProjects({ body }) {
  const { intro, sections } = splitSections(body);
  document.getElementById("projects-intro").innerHTML = toHtml(intro);
  document.getElementById("projects-content").innerHTML = sections
    .map((s) => {
      const tagMatch = s.body.match(/^Tags:(.*)$/im);
      const text = tagMatch ? s.body.replace(tagMatch[0], "").trim() : s.body;
      return `
      <div class="col-md-6 col-lg-4">
        <div class="card"><div class="card-body">
          <h3 class="card-title h5">${escapeText(s.title)}</h3>
          ${tagMatch ? `<div class="d-flex flex-wrap gap-1 mb-3">${badges(tagMatch[1])}</div>` : ""}
          <div class="card-text">${toHtml(text)}</div>
        </div></div>
      </div>`;
    })
    .join("");
}

// ---------- Start ----------

async function init() {
  // Load all files at the same time; one broken file won't break the rest
  const steps = [
    [FILES.config, applyConfig],
    [FILES.personal, renderPersonal],
    [FILES.skills, renderSkills],
    [FILES.certifications, renderCertifications],
    [FILES.projects, renderProjects],
  ];
  await Promise.all(
    steps.map(async ([path, render]) => {
      try {
        render(parseFile(await loadFile(path)));
      } catch (error) {
        console.error(error);
      }
    })
  );
}

init();
