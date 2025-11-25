# ATLAS Daily Report Builder

A static, single-page web app for generating daily construction/demolition work reports. It produces Markdown, a printable HTML view, and downloadable PDFs directly in the browser.

## Using the app

1. Enable GitHub Pages for this repository (Settings → Pages → Build from a branch → `main`, folder `/`).
2. Visit the published GitHub Pages URL (e.g., `https://<username>.github.io/Atlas-Report-Maker/`). The app loads from `index.html` in the repo root—no build step required.
3. Enter project info, crew rows, and report details.
4. Click **Generate Markdown** to populate both the Markdown output and the HTML preview.
5. Use **Copy Markdown**, **Print / Save as PDF** (browser print dialog), or **Download PDF** (via `html2pdf.js`) as needed.

You can also open `index.html` directly in a browser from your local filesystem; all functionality runs client-side.

## Data notes

- `localStorage` is used to remember the last entered Location, Foreman, and Project Lead fields.
- PDF downloads use [`html2pdf.js`](https://cdnjs.com/libraries/html2pdf.js) from a CDN.
- The browser print dialog is used for the **Print / Save as PDF** action.
