# Agent Instructions

This repository has two largely independent parts: LaTeX documents and a React web dashboard.

## Web Dashboard (`web/`)
- **Directory**: Always use `web/` as the working directory for Node/npm commands. The root has no `package.json`.
- **Single Source of Truth**: `web/src/data/resume.ts` drives the web app. It is manually transcribed from `resume_andrew_trinh.tex`. When the LaTeX resume changes, you must manually update `resume.ts` to match.
- **Generated Code**: Never manually edit `web/src/data/skills.generated.json`. It is generated from `resume.ts`. To regenerate it, run `npm run extract` inside `web/` (this also happens automatically during `npm run build`).
- **Commands**: Run `npm run typecheck` and `npm run build` to verify changes.

## LaTeX Documents (Root & `cover_letters/`)
- **Build Command**: Use `latexmk -pdf <filename>.tex`.
- **Working Directory**: Always run `latexmk` from the directory containing the target `.tex` file (root for resumes, `cover_letters/` for cover letters). Building from the wrong directory will break relative paths to packages and images.
- **Committed Artifacts**: The generated `.pdf` and all build artifacts (e.g., `.aux`, `.log`, `.fdb_latexmk`) are explicitly tracked in Git. **Do not** delete or ignore build artifacts.
- **No Shared Includes**: Tailored resume variants (e.g., `resume_andrew_trinh_<variant>.tex`) must remain entirely standalone. Do not attempt to DRY them out or refactor them into shared includes. To create a new variant, simply copy the canonical file and edit it.

## Python Scripts (`scripts/`)
- Asset generation scripts must be run from the repository root (e.g., `python scripts/download_logos.py`).
