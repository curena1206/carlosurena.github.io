#!/usr/bin/env python3
"""
1. Patches R17 in pfi.html
2. Locates the models.carlosurena.com source file
3. Runs the lexical audit against it
Run from carlosurena.github.io directory:
    python3 patch_r17_and_audit_models.py
"""

import re, os, glob

# ── PART 1: R17 patch ─────────────────────────────────────────────────────────

PFI = "pfi.html"
if os.path.exists(PFI):
    with open(PFI, 'r', encoding='utf-8') as f:
        html = f.read()
    old = 'title: "Implement economics-aware routing strategy across rails and corridors"'
    new = 'title: "Implement economics-aware routing strategy across payment rails and flows"'
    if old in html:
        html = html.replace(old, new)
        with open(PFI, 'w', encoding='utf-8') as f:
            f.write(html)
        print("PART 1 — R17 PATCH")
        print("  OK  [R17 corridors → payment rails and flows]")
    else:
        print("PART 1 — R17 PATCH")
        print("  MISS [R17 — string not found, may already be patched]")
else:
    print("  ERROR — pfi.html not found in current directory")

print()

# ── PART 2: Locate models source file ────────────────────────────────────────

print("PART 2 — MODELS SOURCE FILE LOCATION")
print("=" * 60)

MODELS_BASE = os.path.expanduser("~/Desktop/curena1206.github.io")

if not os.path.exists(MODELS_BASE):
    print(f"  Directory not found: {MODELS_BASE}")
    print("  Trying alternate paths...")
    alternates = [
        "~/Desktop/models.carlosurena.com",
        "~/Desktop/curena1206",
        "~/Desktop/models",
    ]
    for alt in alternates:
        expanded = os.path.expanduser(alt)
        if os.path.exists(expanded):
            MODELS_BASE = expanded
            print(f"  Found at: {MODELS_BASE}")
            break
    else:
        print("  No alternate paths found.")
        print("\n  Full directory listing of ~/Desktop:")
        desktop = os.path.expanduser("~/Desktop")
        for item in sorted(os.listdir(desktop)):
            full = os.path.join(desktop, item)
            kind = "DIR" if os.path.isdir(full) else "FILE"
            print(f"    [{kind}] {item}")
        print("\n  ACTION REQUIRED: Confirm the correct directory for models.carlosurena.com source files.")
        exit(0)

print(f"  Directory found: {MODELS_BASE}")

# List all files (any extension)
all_files = []
for root, dirs, files in os.walk(MODELS_BASE):
    dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build', '.next', 'out']]
    for f in files:
        all_files.append(os.path.join(root, f))

print(f"  Files found (excl. node_modules/build): {len(all_files)}")

# Find likely source files
source_candidates = [f for f in all_files if f.endswith(('.jsx','.tsx','.js','.ts'))
                     and not any(x in f for x in ['min.js','bundle','chunk','worker','.test.'])]

print(f"  JS/JSX/TS candidates: {len(source_candidates)}")
for f in source_candidates[:20]:
    size = os.path.getsize(f)
    print(f"    {os.path.relpath(f, MODELS_BASE)} ({size:,} bytes)")

if not source_candidates:
    print("\n  No source JS/JSX files found. Listing ALL files:")
    for f in all_files[:40]:
        print(f"    {os.path.relpath(f, MODELS_BASE)}")
    exit(0)

# Pick the largest JS/JSX file as the likely main component
main_file = max(source_candidates, key=os.path.getsize)
print(f"\n  Using for audit: {os.path.relpath(main_file, MODELS_BASE)} ({os.path.getsize(main_file):,} bytes)")

# ── PART 3: Lexical audit of models file ─────────────────────────────────────

print()
print("PART 3 — MODELS FILE LEXICAL AUDIT")
print("=" * 60)

with open(main_file, 'r', encoding='utf-8', errors='ignore') as f:
    source = f.read()

TERMS = [
    ("optimization/optimize",  r'\boptimiz(e|ed|ing|ation|ations)?\b'),
    ("deploy",                 r'\bDeploy(ed|ing)?\b|\bdeploy(ed|ing)?\b'),
    ("framework",              r'\bframework\b'),
    ("playbook",               r'\bplaybook\b'),
    ("market entry",           r'\bmarket entry\b'),
    ("addressable market",     r'\baddressable market\b'),
    ("leadership",             r'\bleadership\b|\bLeadership\b'),
    ("Senior Leadership",      r'\bSenior Leadership\b'),
    ("Relationship Management",r'Relationship Management'),
    ("Network Management",     r'Network Management'),
    ("Trading/FX",             r'Trading.?FX'),
    ("FX",                     r'\bFX\b'),
    ("spread",                 r'\bspread\b'),
    ("corridor",               r'\bcorridor\b'),
    ("cross-border",           r'\bcross[- ]border\b'),
    ("correspondent",          r'\bcorrespondent\b'),
    ("clearing",               r'\bclearing\b'),
    ("settlement",             r'\bsettlement\b'),
    ("nostro",                 r'\bnostro\b'),
    ("wire/wires",             r'\bwires?\b'),
    ("institution/institutional", r'\binstitution(al|s)?\b'),
    ("organization",           r'\borganizat(ion|ional)\b'),
    ("balance-adjusted",       r'balance[- ]adjusted'),
    ("balance-linked",         r'balance[- ]linked'),
    ("rate cycle",             r'rate[- ]cycle'),
    ("liquidity",              r'\bliquidity\b'),
    ("producing",              r'\bproducing\b'),
    ("fragmented",             r'\bfragmented\b'),
    ("underdeveloped",         r'\bunderdeveloped\b'),
    ("roadmap",                r'\broadmap\b'),
    ("transformation",         r'\btransformation\b'),
    ("diagnosis/diagnose",     r'\bdiagnos(e|is|tic)?\b'),
]

# Skip pure CSS/JSX infrastructure
SKIP = ['color:','background:','padding:','margin:','font-','border-',
        'import ','export ','className','style=','const ','let ','var ',
        'function ','return ','React','useState','useEffect','onClick']

hits = []
lines = source.split('\n')

for term_label, pattern in TERMS:
    for m in re.finditer(pattern, source, re.IGNORECASE):
        pos = m.start()
        ln_start = source.rfind('\n', 0, pos) + 1
        ln_end   = source.find('\n', pos)
        line = source[ln_start:ln_end if ln_end > 0 else len(source)].strip()
        if any(s in line for s in SKIP): continue
        if len(line) < 10: continue
        mp = line.find(m.group())
        ctx_start = max(0, mp - 40)
        ctx = ('...' if ctx_start > 0 else '') + line[ctx_start:mp+90]
        hits.append((term_label, m.group(), ctx[:130]))

# Deduplicate
seen = set()
unique = []
for h in hits:
    key = (h[0], h[2][:60])
    if key not in seen:
        seen.add(key)
        unique.append(h)

if not unique:
    print("  No flagged terms found in models source file.")
    print("  Models site: CLEAN")
else:
    print(f"  {len(unique)} hits found:\n")
    for term_label, matched, ctx in unique:
        print(f"  Term found: {matched}  [{term_label}]")
        print(f"  Context:    {ctx}")
        print()

print("=" * 60)
print("AUDIT COMPLETE")
