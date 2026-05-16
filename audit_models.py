#!/usr/bin/env python3
"""
Lexical positioning audit — FrameworkIndex.jsx only.
Audit only. No modifications.
Run from anywhere:
    python3 audit_models.py
"""

import re, os

SOURCE = os.path.expanduser(
    "~/Desktop/Payments project/ai-payments-portfolio/src/pages/FrameworkIndex.jsx"
)

if not os.path.exists(SOURCE):
    print(f"File not found: {SOURCE}")
    exit(1)

with open(SOURCE, 'r', encoding='utf-8', errors='ignore') as f:
    source = f.read()

print(f"FILE: FrameworkIndex.jsx")
print(f"SIZE: {len(source):,} chars  |  {source.count(chr(10))} lines")
print("=" * 70)

TERMS = [
    ("optimization/optimize",     r'\boptimiz(e|ed|ing|ation|ations)?\b'),
    ("deploy/deployment",         r'\bDeploy(ed|ing|ment)?\b|\bdeploy(ed|ing|ment)?\b'),
    ("framework",                 r'\bframework\b'),
    ("playbook",                  r'\bplaybook\b'),
    ("market entry",              r'\bmarket entry\b'),
    ("addressable market",        r'\baddressable market\b'),
    ("leadership",                r'\bleadership\b|\bLeadership\b'),
    ("Senior Leadership",         r'\bSenior Leadership\b'),
    ("Relationship Management",   r'Relationship Management'),
    ("Network Management",        r'Network Management'),
    ("Trading/FX",                r'Trading.?FX'),
    ("FX",                        r'\bFX\b'),
    ("spread",                    r'\bspread\b'),
    ("corridor",                  r'\bcorridor\b'),
    ("cross-border",              r'\bcross[- ]border\b'),
    ("correspondent",             r'\bcorrespondent\b'),
    ("clearing",                  r'\bclearing\b'),
    ("settlement",                r'\bsettlement\b'),
    ("nostro",                    r'\bnostro\b'),
    ("wire/wires",                r'\bwires?\b'),
    ("SWIFT",                     r'\bSWIFT\b'),
    ("institution/institutional", r'\binstitution(al|s|\'s)?\b'),
    ("organization/organizational",r'\borganizat(ion|ional)\b'),
    ("balance-adjusted",          r'balance[- ]adjusted'),
    ("balance-linked",            r'balance[- ]linked'),
    ("rate cycle/rate-cycle",     r'rate[- ]cycle'),
    ("liquidity",                 r'\bliquidity\b'),
    ("producing",                 r'\bproducing\b'),
    ("fragmented",                r'\bfragmented\b'),
    ("underdeveloped",            r'\bunderdeveloped\b'),
    ("roadmap",                   r'\broadmap\b'),
    ("transformation",            r'\btransformation\b'),
    ("diagnosis/diagnose",        r'\bdiagnos(e|is|tic)?\b'),
    ("immediate priority",        r'\bimmediate priority\b'),
    ("structural failure",        r'\bstructural failure\b'),
    ("absent",                    r'\babsent\b'),
]

# Skip lines that are pure JSX infrastructure / CSS-in-JS / imports
SKIP_PATTERNS = [
    r'^\s*import ',
    r'^\s*export ',
    r'^\s*//.*',
    r'className=',
    r'style={{',
    r'^\s*\*',
    r'color:',
    r'background',
    r'padding:',
    r'margin:',
    r'fontSize:',
    r'fontFamily:',
    r'border',
    r'display:',
    r'width:',
    r'height:',
    r'flex',
]

def should_skip(line):
    for p in SKIP_PATTERNS:
        if re.search(p, line):
            return True
    return False

hits = []
seen = set()

for term_label, pattern in TERMS:
    for m in re.finditer(pattern, source, re.IGNORECASE):
        pos = m.start()
        ln_start = source.rfind('\n', 0, pos) + 1
        ln_end   = source.find('\n', pos)
        line = source[ln_start:ln_end if ln_end > 0 else len(source)].strip()

        if should_skip(line): continue
        if len(line) < 8: continue

        mp = line.find(m.group())
        if mp < 0: mp = 0
        ctx_start = max(0, mp - 45)
        ctx = ('...' if ctx_start > 0 else '') + line[ctx_start:mp+100]
        ctx = ctx[:140]

        key = (term_label, ctx[:60])
        if key in seen: continue
        seen.add(key)

        hits.append((term_label, m.group(), ctx, line))

if not hits:
    print("\nNO FLAGGED TERMS FOUND")
    print("Models site: CLEAN")
else:
    print(f"\n{len(hits)} hits found:\n")
    for term_label, matched, ctx, line in hits:
        print(f"  Term:    {matched}  [{term_label}]")
        print(f"  Context: {ctx}")
        print()

print("=" * 70)
print("AUDIT COMPLETE — No modifications made.")
