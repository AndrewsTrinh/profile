# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A personal LaTeX repository for Quoc Anh Trinh (Andrew) containing the master resume plus per-application variants (repo root) and per-company cover letters (`cover_letters/`). There is no application code, no test suite, and no CI — everything here is either a `.tex` document, a built artifact, or a small Python utility for preparing logo assets (`scripts/`).

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
