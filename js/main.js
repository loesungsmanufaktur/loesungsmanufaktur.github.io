/* ============================================================
   HOME PAGE LOADER (index.html)
   Reads the Markdown files in /content and /projects and
   fills the page. Shared helpers live in js/common.js.
   You normally don't need to edit this file - change the
   content files instead.
   ============================================================ */

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
  renderFooter(settings.name);
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

// Projects: content/projects.md lists the project folders ("- folder-name").
// Each folder's index.md gives the card title, summary, tags and cover image.
async function renderProjects({ body }) {
  const listStart = body.search(/^\s*- /m);
  const intro = listStart === -1 ? body : body.slice(0, listStart);
  const folders = [...body.matchAll(/^\s*- +(\S+)/gm)].map((m) => m[1]);

  document.getElementById("projects-intro").innerHTML = toHtml(intro.trim());

  // Load all projects; skip (and log) any folder that is missing or broken
  const results = await Promise.allSettled(folders.map(loadProject));
  const projects = results
    .filter((r) => (r.status === "fulfilled" ? true : (console.error(r.reason), false)))
    .map((r) => r.value);

  document.getElementById("projects-content").innerHTML = projects
    .map(({ folder, settings }) => {
      const link = `project.html?id=${encodeURIComponent(folder)}`;
      const cover = settings.cover
        ? `<img class="card-img-top project-cover" src="${escapeText(projectFile(folder, settings.cover))}" alt="">`
        : "";
      return `
      <div class="col-md-6 col-lg-4">
        <div class="card project-card">
          ${cover}
          <div class="card-body d-flex flex-column">
            <h3 class="card-title h5">
              <a class="stretched-link text-reset text-decoration-none" href="${link}">${escapeText(settings.title || folder)}</a>
            </h3>
            <div class="d-flex flex-wrap gap-1 mb-3">${badges(settings.tags)}</div>
            <p class="card-text flex-grow-1">${escapeText(settings.summary || "")}</p>
            <span class="read-more">View project <i class="bi bi-arrow-right"></i></span>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

// ---------- Start ----------

async function init() {
  // Load all files at the same time; one broken file won't break the rest
  const steps = [
    [FILES.config, (file) => {
      const settings = applyConfig(file);
      if (settings.site_title) document.title = settings.site_title;
    }],
    [FILES.personal, renderPersonal],
    [FILES.skills, renderSkills],
    [FILES.certifications, renderCertifications],
    [FILES.projects, renderProjects],
  ];
  await Promise.all(
    steps.map(async ([path, render]) => {
      try {
        await render(parseFile(await loadFile(path)));
      } catch (error) {
        console.error(error);
      }
    })
  );
}

init();
