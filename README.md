# Portfolio

A simple one-page portfolio built with Bootstrap 5.3. All content lives in Markdown files, so you never need to touch HTML to update it.

## Editing content

| File | What it controls |
|---|---|
| `content/config.md` | Site title and the five palette colors (HEX) |
| `content/personal-info.md` | Name, role, photo, contact links and the "About Me" text |
| `content/skills.md` | Skill categories (`## Category` + a comma-separated list) |
| `content/certifications.md` | One `## Heading` per certification |
| `content/projects.md` | Which project folders are shown, and in which order |
| `projects/<folder>/index.md` | One project: title, summary, tags, cover image and the full project page |

Each file starts with a commented block explaining how to use it.

### Adding a project

1. Create a folder in `projects/`, e.g. `projects/my-project/` (letters, numbers, `-` and `_` only).
2. Copy an existing `index.md` into it and edit it.
3. Put the project's images in the same folder and reference them by file name: `![Screenshot](screenshot.png)`.
4. Add `- my-project` to `content/projects.md`.

The project card on the home page links to `project.html?id=my-project`.

## Project structure

```
index.html        home page layout (sections and navigation)
project.html      page that shows a single project
css/style.css     styles, built on the palette variables
js/common.js      shared helpers (loading Markdown, colors, projects)
js/main.js        fills the home page
js/project.js     fills the project page
content/          your editable Markdown content
projects/         one folder per project (index.md + images)
images/           photo and favicon
.nojekyll         tells GitHub Pages to serve files as-is
```

## Previewing locally

The page loads the Markdown files with `fetch`, so open it through a small local server instead of double-clicking `index.html`:

```bash
npx serve .
```

## Deploying

Push to the `main` branch, then in the GitHub repository go to **Settings → Pages** and set the source to **Deploy from a branch → main / (root)**.
