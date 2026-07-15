# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A personal repository for Quoc Anh Trinh (Andrew) with two largely independent halves:

1. **LaTeX documents** (repo root + `cover_letters/`) — the master resume, per-application resume variants, and per-company cover letters. Built with `pdflatex`; the produced PDFs and their build artifacts are committed.
2. **Web dashboard** (`web/`) — a React + Vite + Tailwind v4 single-page resume/portfolio site deployed to GitHub Pages. This is the only part with a build toolchain, dependencies, type-checking, and CI.

There is no traditional test suite. The `scripts/` directory holds small Python utilities for preparing logo assets (used by the LaTeX resume and copied into the web app).

## Build

Documents compile with `pdflatex` (driven by `latexmk` — `.fdb_latexmk` files are present).

```bash
# build the resume (from the repo root — handles reruns for refs/toc)
latexmk -pdf resume_andrew_trinh.tex

# build a cover letter (from the cover_letters/ directory)
cd cover_letters && latexmk -pdf cover_letter_<company>.tex

# clean build artifacts (keeps the .pdf)
latexmk -c

# clean everything including the .pdf
latexmk -C
```

The resume depends on the custom package `skillicons.sty` (repo root) and the `logos/` PNGs, so it must be built from the repo root where `pdflatex` searches the current directory. Cover letters are self-contained (no `skillicons`/`logos` dependency), so they build from inside `cover_letters/`.

## Document layout

- `resume_andrew_trinh.tex` — the canonical resume. Tailored variants live alongside it as `resume_andrew_trinh_<variant>.tex` (e.g. `_hesta`, `_with_photo`). When creating a new tailored resume, copy the canonical file and edit; don't refactor into shared includes — each variant is meant to be standalone so it can be sent as-is.
- `cover_letters/cover_letter_<company>[_role].tex` — one file per application, kept in the `cover_letters/` directory. The naming convention is load-bearing: the PDF that gets sent shares the stem. New cover letters should follow this pattern and typically start from an existing letter as a template (they share a common header/footer structure but each is hand-edited for the role).
- Each `.tex` file has a sibling set of build artifacts (`.aux`, `.fdb_latexmk`, `.fls`, `.log`, `.out`, sometimes `.synctex.gz`) and the produced `.pdf`. These are committed to the repo — do not delete other documents' artifacts when working on one.

## Header / styling conventions

The resume header embeds a row of square-cropped tech-stack PNGs from `logos/` (sql, python, r, excel, powerbi, tableau, aws, gcp, spark). Colors are defined as `headerblue` / `sectionline` (RGB 13,35,58) and section headings use the custom `\linesection{...}` command with a dashed-left `mdframed` content block (`style=dashedleft`). Preserve these when editing — tailored variants are expected to look identical to the canonical resume except for content changes.

## Logo asset pipeline

The scripts in `scripts/` regenerate `logos/`. They are run manually and rarely — only when adding or refreshing a tech icon. They expect to be invoked from the repo root, e.g. `python scripts/download_logos.py` (paths are relative to `./logos`).

- `download_logos.py` / `download_new_logos.py` / `download_sql.py` — fetch source SVG/PNG from upstream (gilbarbara/logos, icons8, r-project).
- `svg_to_png.py` / `convert_logos.py` — rasterize SVG → PNG via ImageMagick `convert` (falls back to `rsvg-convert`) and crop to a square with transparent padding.
- `clean_backgrounds.py` — strips grey checkered or near-black backgrounds from already-rasterized PNGs. It targets a hardcoded list (`python.png`, `sql.png`, `aws.png`, `powerbi.png`) and overwrites in place — re-running it is destructive if the source PNG no longer has the grey background it was written to detect.

Required external tools for the pipeline: ImageMagick (`convert`) or `librsvg` (`rsvg-convert`), plus Python with Pillow and requests.

## Web dashboard (`web/`)

A React 18 + Vite 6 + Tailwind v4 SPA that presents the resume as an interactive page. Run everything from inside `web/`:

```bash
cd web
npm install          # first time
npm run dev          # local dev server
npm run extract      # regenerate src/data/skills.generated.json (also runs on prebuild)
npm run typecheck    # tsc --noEmit
npm run build        # tsc --noEmit && vite build  -> web/dist
npm run preview      # serve the production build locally
```

Architecture / data flow:

- `src/data/resume.ts` is the **single source of truth** for the dashboard — it is hand-transcribed from `resume_andrew_trinh.tex`. When the canonical resume changes, update `resume.ts` to match; they are not auto-synced. It also pins `CURRENT_YEAR`, which drives years-of-experience math.
- `scripts/extractSkills.ts` reads `resume.ts` and writes `src/data/skills.generated.json` (per-skill years-of-experience derived from the earliest start year, plus the related achievements). It runs automatically via the `prebuild` script, so a normal `npm run build` always regenerates it — edit `resume.ts`, not the generated JSON.
- `src/App.tsx` composes the page from section components (`Hero`, `TimelineChart`, `SkillsTable`, `ProjectGallery`). Logo PNGs for the web app live in `web/public/logos/` (a separate copy from the LaTeX `logos/`).
- `vite.config.ts` sets `base: '/profile/'` because the site is served from `https://<user>.github.io/profile/`. This must stay in sync with the GitHub repo name — renaming the repo breaks asset paths until this is updated (see commit `1a70202`).

## Deployment / CI

`.github/workflows/deploy.yml` is the only CI. It builds `web/` and publishes `web/dist` to GitHub Pages, triggered on pushes to `master` that touch `web/**` (or the workflow itself), plus manual `workflow_dispatch`. The LaTeX documents are not built in CI — only the committed PDFs represent them.
