# Genshin character sorter

Pick your favorite in a series of head-to-head matchups, and get a fully
ranked list at the end. No server, no database — pure static site, deployable
on GitHub Pages for free.

It uses a binary-insertion sort, so a full roster of ~90 characters takes
around 450-500 comparisons rather than the thousands a naive every-pair
comparison would need.

## 1. Add your character images

1. Download your character portraits from Google Drive to your computer.
2. Resize/compress them if they're large — 400-600px wide is plenty for this
   UI. Converting to `.webp` keeps the repo small (any image tool or an
   online converter works fine for a one-time batch job).
3. Rename each file to match the character's name in lowercase with
   underscores instead of spaces, e.g.:
   - `Hu Tao` &rarr; `hu_tao.webp`
   - `Raiden Shogun` &rarr; `raiden_shogun.webp`
   - `Kamisato Ayaka` &rarr; `kamisato_ayaka.webp`
4. Drop all the files into the `images/` folder in this repo.

If a name doesn't convert cleanly with simple underscore-to-space
title-casing (accents, apostrophes, etc.), leave the filename as-is and add
a manual entry to the `OVERRIDES` map at the top of `generate-list.js`
instead of fighting the automatic conversion.

## 2. Generate the character list

Run this locally (requires [Node.js](https://nodejs.org)) whenever you
add, remove, or rename images:

```bash
node generate-list.js
```

This scans `images/` and writes `characters.js` — the array the app reads
at runtime. Commit `characters.js` along with your images.

## 3. Try it locally

Since the app loads local files via `<script src="...">`, just opening
`index.html` directly in a browser works fine in most cases. If your
browser blocks local file access, serve the folder instead:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## 4. Deploy to GitHub Pages

1. Push this repo to GitHub (images and `characters.js` included).
2. In the repo, go to **Settings &rarr; Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a
   branch," pick your main branch and the `/ (root)` folder.
4. Save. Your site will be live at
   `https://<your-username>.github.io/<repo-name>/` within a minute or two.

## How the sorting works

`sorter.js` implements the sort as a JavaScript generator
(`binaryInsertionSort`). Each time it needs a comparison, it `yield`s a pair
of character indices and pauses — `app.js` displays that pair, waits for a
click (or an arrow-key press), and resumes the generator with the result.
This keeps the algorithm itself simple and fully decoupled from the UI: it
has no idea a human is on the other end of each comparison.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `style.css` | All styling |
| `sorter.js` | Sorting algorithm (framework-agnostic, no DOM code) |
| `app.js` | Wires the sorter to the UI, handles input, renders results |
| `generate-list.js` | Local script: scans `images/` &rarr; writes `characters.js` |
| `characters.js` | Auto-generated list of `{ name, file }` — do not hand-edit |
| `images/` | Character portraits |

## Customizing

- **Colors / fonts**: all in `style.css`, driven by CSS variables at the top.
- **Estimated comparison count** on the start screen and the progress bar
  are both approximations (binary-insertion sort's real cost depends on the
  random shuffle order), so don't be surprised if the actual count differs
  slightly from the displayed estimate.
