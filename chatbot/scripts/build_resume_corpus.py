import os
import re
import sys
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from rag_lib import chunk_text, write_corpus

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

# NOTE: reads a file outside this repo, in the sibling `profile/` repo — will break
# if resume_andrew_trinh_bendigo_fcs.tex is renamed or moved.
TEX_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'resume_andrew_trinh_bendigo_fcs.tex')
CORPUS_NAME = "resume"


def strip_latex(raw: str) -> str:
    # 1. Isolate the document body -- drop the preamble (\documentclass, \usepackage,
    #    \definecolor, \newcommand{\linesection}..., etc. are all cosmetic/macro defs).
    m = re.search(r'\\begin\{document\}(.*)\\end\{document\}', raw, re.DOTALL)
    body = m.group(1) if m else raw

    # 2. Strip LaTeX comments (unescaped %). Negative lookbehind protects `\%` (literal percent).
    body = re.sub(r'(?<!\\)%.*', '', body)

    # 3. Drop images entirely -- no text value.
    body = re.sub(r'\\includegraphics(\[[^\]]*\])?\{[^}]*\}', '', body)

    # 4. \href{url}{text} -> text (padded)
    body = re.sub(r'\\href\{[^}]*\}\{([^}]*)\}', r' \1 ', body)

    # 5. Two-brace-arg commands with no useful text (\fontsize{28}{32}) -> drop
    body = re.sub(r'\\fontsize\{[^}]*\}\{[^}]*\}', ' ', body)

    # 6. Bare-dimension commands (\vrule width 2pt) -> drop
    body = re.sub(r'\\vrule\s+width\s+[0-9.]+(pt|em|ex)?', ' ', body)

    # 7. Content-preserving unwraps, run to a fixed point to peel nested braces layer by
    #    layer (e.g. \subsection*{... \textbf{Bendigo \& Adelaide Bank} ...} needs \textbf
    #    unwrapped before \subsection*'s own no-nested-braces regex can match).
    #    Every replacement is padded with spaces: commands often abut with no whitespace
    #    in the source (e.g. \selectfont\textbf{QUOC ANH TRINH...}), and an unpadded unwrap
    #    would let the later catch-all command-stripper swallow the adjacent real word into
    #    what it mistakes for a command name.
    for _ in range(5):
        new = body
        new = re.sub(r'\\textbf\{([^{}]*)\}', r' \1 ', new)
        new = re.sub(r'\\textit\{([^{}]*)\}', r' \1 ', new)
        new = re.sub(r'\\emph\{([^{}]*)\}', r' \1 ', new)
        new = re.sub(r'\\linesection\{([^{}]*)\}', r'\n\n\1\n', new)
        new = re.sub(r'\\subsection\*?\{([^{}]*)\}', r'\n\1\n', new)
        if new == body:
            break
        body = new

    # 8. Structural separators
    body = re.sub(r'\\hfill', ' | ', body)
    body = re.sub(r'\\item\b', '\n- ', body)
    body = re.sub(r'\\\\(\[[^\]]*\])?', '\n', body)

    # 9. Strip environment wrappers (mdframed, itemize, minipage...) incl. optional
    #    [args] and up to 2 trailing {args} (e.g. \begin{minipage}[t]{0.28\textwidth}).
    body = re.sub(r'\\(begin|end)\{[a-zA-Z*]+\}(\[[^\]]*\])?(\{[^}]*\}){0,2}', '', body)

    # 10. Escaped space (\faPhone\ : ...) -> literal space
    body = re.sub(r'\\ ', ' ', body)

    # 11. Final catch-all: remaining backslash-commands are purely cosmetic at this point
    #     (icons \faPhone/\faEnvelope/..., \noindent, \raggedright, \selectfont, \normalsize,
    #     \quad, \textbullet, \color{...}, \pagecolor{...}, \hspace{...}, \vspace{...}).
    #     Padded for the same word-boundary-safety reason as step 7.
    body = re.sub(r'\\[a-zA-Z]+\*?(\[[^\]]*\])?(\{[^}]*\})?', ' ', body)

    # 12. Un-escape literal special characters
    for esc, lit in [(r'\&', '&'), (r'\%', '%'), (r'\$', '$'), (r'\#', '#'), (r'\_', '_')]:
        body = body.replace(esc, lit)

    # 13. Strip any leftover bare grouping braces
    body = body.replace('{', ' ').replace('}', ' ')

    # 14. Collapse whitespace, keep single blank lines between sections
    body = re.sub(r'[ \t]+', ' ', body)
    body = re.sub(r' *\n *', '\n', body)
    body = re.sub(r'\n{3,}', '\n\n', body)
    return body.strip()


def main():
    print(f"Reading {TEX_PATH}...")
    with open(TEX_PATH, 'r', encoding='utf-8') as f:
        raw = f.read()

    text = strip_latex(raw)
    chunks = chunk_text(text)
    print(f"Extracted {len(text)} chars -> {len(chunks)} chunks.")

    write_corpus(CORPUS_NAME, chunks)
    print(f"Wrote {len(chunks)} chunks -> corpus_chunks (corpus='{CORPUS_NAME}') in Neon")


if __name__ == "__main__":
    main()
