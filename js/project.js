/* ============================================================
   PROJECT PAGE LOADER (project.html)
   Reads the folder name from the URL (project.html?id=folder)
   and shows projects/<folder>/index.md.
   Shared helpers live in js/common.js.
   ============================================================ */

async function init() {
  // Colors, site title and footer are shared with the home page
  loadFile(FILES.config).then((text) => applyConfig(parseFile(text))).catch(console.error);
  loadFile(FILES.personal).then((text) => renderFooter(parseFile(text).settings.name)).catch(console.error);

  const folder = new URLSearchParams(location.search).get("id");
  const content = document.getElementById("project-content");

  try {
    const { settings, body } = await loadProject(folder);
    const title = settings.title || folder;

    document.title = title;
    document.getElementById("project-title").textContent = title;
    document.getElementById("project-summary").textContent = settings.summary || "";
    document.getElementById("project-tags").innerHTML = badges(settings.tags);

    // Optional cover image above the text. Like the images in the Markdown,
    // it is a plain file name; fixProjectPaths points it to the project folder.
    const cover = settings.cover
      ? `<img class="project-hero-img mb-4" src="${escapeText(settings.cover)}" alt="">`
      : "";
    content.innerHTML = cover + toHtml(body);
    fixProjectPaths(content, folder);
  } catch (error) {
    console.error(error);
    document.getElementById("project-title").textContent = "Project not found";
    content.innerHTML = `<p>This project could not be loaded. Check that the folder exists in /projects and contains an index.md file.</p>`;
  }
}

init();
