# Portfolio

A simple one-page portfolio built with Bootstrap 5.3. All content lives in Markdown files, so you never need to touch HTML to update it.

## Editing content

| File | What it controls |
|---|---|
| `content/config.md` | Site title and the five palette colors (HEX) |
| `content/personal-info.md` | Name, role, photo, contact links and the "About Me" text |
| `content/skills.md` | Skill categories (`## Category` + a comma-separated list) |
| `content/certifications.md` | One `## Heading` per certification |
| `content/projects.md` | One `## Heading` per project, optional `Tags:` line |

Each file starts with a commented block explaining how to use it.

## Project structure

```
index.html        page layout (sections and navigation)
css/style.css     styles, built on the palette variables
js/main.js        reads the Markdown files and fills the page
content/          your editable Markdown content
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
