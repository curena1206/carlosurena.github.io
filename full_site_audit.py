#!/usr/bin/env python3
"""
Full site lexical reconciliation audit.
Searches across all 4 source files for positioning drift terms.
Run from anywhere:
    python3 full_site_audit.py
"""

import re, os, glob

FILES = [
    "~/Desktop/carlosurena.github.io/index.html",
    "~/Desktop/carlosurena.github.io/consulting.html",
    "~/Desktop/carlosurena.github.io/pfi.html",
]

# Find React file for models.carlosurena.com
models_dir = os.path.expanduser("~/Desktop/curena1206.github.io")
jsx_files = glob.glob(os.path.join(models_dir, "**/*.jsx"), recursive=True) + \
            glob.glob(os.path.join(models_dir, "**/*.js"),  recursive=True)
# Filter to likely main component file
jsx_files = [f for f in jsx_files if not any(x in f for x in
             ['node_modules', '.git', 'bundle', 'min.js'])]
for f in jsx_files:
    FILES.append(f)

# Expand paths
FILES = [os.path.expanduser(f) for f in FILES]

# ── Terms ────────────────────────────────────────────────────────────────────

TERMS = [
    (r'\boptimiz(e|ed|ing|ation|ations)\b',   "optimize/optimization"),
    (r'\bmarket entry\b',                      "market entry"),
    (r'\bSenior Leadership\b',                 "Senior Leadership"),
    (r'Relationship Management',               "Relationship Management"),
    (r'\bTrading[/ ]?FX\b',                    "Trading/FX"),
    (r'\bFX\b',                                "FX"),
    (r'\bcorridor\b',                          "corridor"),
    (r'\bcross[- ]border\b',                   "cross-border"),
    (r'\bcorrespondent\b',                     "correspondent"),
    (r'Network Management',                    "Network Management"),
    (r'\binstitution(al|s)?\b',                "institution/institutional"),
    (r'balance[- ]adjusted',                   "balance-adjusted"),
    (r'balance[- ]linked',                     "balance-linked"),
    (r'\baddressable market\b',                "addressable market"),
    (r'\bdeploy(ed|ing|ment)?\b',              "deploy"),
    (r'\bDeploy(ed|ing|ment)?\b',              "Deploy"),
    (r'\bleadership\b',                        "leadership"),
    (r'\borganizat(ion|ional)\b',              "organization/organizational"),
    (r'\bframework\b',                         "framework"),
    (r'\bproducing\b',                         "producing"),
]

# ── Sections to exclude (CSS, script imports, meta tags) ────────────────────

SKIP_PATTERNS = [
    re.compile(r'<style[\s\S]*?</style>', re.IGNORECASE),
    re.compile(r'<!--.*?-->', re.DOTALL),
    re.compile(r'<meta[^>]*>'),
    re.compile(r'<link[^>]*>'),
    re.compile(r'<script src[^>]*>'),
]

def strip_boilerplate(text):
    for pat in SKIP_PATTERNS:
        text = pat.sub('', text)
    return text

print("FULL SITE LEXICAL AUDIT")
print("=" * 70)
print("Scope: index.html, consulting.html, pfi.html, models React file(s)")
print("=" * 70)

total_hits = 0

for fpath in FILES:
    if not os.path.exists(fpath):
        print(f"\n[FILE NOT FOUND] {fpath}")
        continue

    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        raw = f.read()

    fname = os.path.basename(fpath)
    cleaned = strip_boilerplate(raw)
    lines = cleaned.split('\n')

    file_hits = []

    for term_pat, term_label in TERMS:
        for m in re.finditer(term_pat, cleaned, re.IGNORECASE):
            pos = m.start()
            # Get surrounding line
            line_start = cleaned.rfind('\n', 0, pos) + 1
            line_end   = cleaned.find('\n', pos)
            if line_end == -1: line_end = len(cleaned)
            line = cleaned[line_start:line_end].strip()
            # Skip pure CSS/JS infrastructure lines
            if any(skip in line for skip in [
                'var(--', 'font-family', 'border-radius', 'padding:',
                'margin:', 'display:', 'position:', 'color:', 'background:',
                'font-size', 'line-height', 'import ', 'export ', 'require(',
            ]):
                continue
            # Truncate long lines around match
            mp = line.find(m.group())
            if mp < 0: mp = 0
            ctx_start = max(0, mp - 50)
            ctx = ('...' if ctx_start > 0 else '') + line[ctx_start:mp+100]
            if len(ctx) > 150: ctx = ctx[:150] + '...'
            file_hits.append((term_label, m.group(), ctx))
            total_hits += 1

    if file_hits:
        print(f"\n{'─'*70}")
        print(f"FILE: {fname}  ({fpath})")
        print(f"{'─'*70}")
        for term_label, matched, ctx in file_hits:
            print(f"\n  Term found:  {matched}  [{term_label}]")
            print(f"  Context:     {ctx}")

print(f"\n{'='*70}")
print(f"TOTAL HITS: {total_hits}")
print(f"{'='*70}")
print("\nAudit complete. No changes made.")
