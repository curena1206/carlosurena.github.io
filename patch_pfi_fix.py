#!/usr/bin/env python3
"""
Fix two missed patches from patch_pfi_complete.py.
Run from carlosurena.github.io directory:
    python3 patch_pfi_fix.py
"""

with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

log = []

def rep(label, old, new):
    global html
    if old in html:
        html = html.replace(old, new)
        log.append(f"  OK  [{label}]")
    else:
        log.append(f"  MISS [{label}]")

# Miss 1 — Pillar KPIs band 1 (single-quote format in JS object)
rep("Pillar KPIs band 1 — single quote format",
    "kpi: \"Pillar KPIs trending, actions opened and closed per cycle\"",
    "kpi: \"Portfolio KPIs trending, actions opened and closed per cycle\"")

# Miss 2 — key_issue unicode em dash (literal \u2014 in source)
# The file contains the literal 6-char sequence \u2014, not the em dash character
rep("Band 1 key_issue — unicode literal",
    '"Pricing governance appears fragmented \\u2014 discounting without structured oversight"',
    '"Pricing governance appears fragmented \\u2014 override behavior without consistent review"')

# Also check with actual em dash in case it was decoded
rep("Band 1 key_issue — em dash decoded",
    '"Pricing governance appears fragmented \u2014 discounting without structured oversight"',
    '"Pricing governance appears fragmented \u2014 override behavior without consistent review"')

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
