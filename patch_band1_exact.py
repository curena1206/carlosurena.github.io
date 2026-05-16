#!/usr/bin/env python3
"""
Fix exec_diagnosis and structural_issue 3 using exact strings from file.
Run from carlosurena.github.io directory:
    python3 patch_band1_exact.py
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

# exec_diagnosis — exact text from file
rep("exec_diagnosis",
    'exec_diagnosis: "The portfolio appears structurally fragmented across governance, pricing discipline, management visibility, and portfolio management. The immediate management priority is stabilization: establish ownership, reporting cadence, and pricing discipline before pursuing broader commercial expansion."',
    'exec_diagnosis: "The portfolio appears unevenly developed across governance, pricing discipline, management visibility, and portfolio management. Initial priorities may include strengthening ownership, reporting discipline, and pricing controls before pursuing broader commercial expansion."')

# structural_issue 3 — exact text from file (still has "fragmented")
rep("structural_issue 3",
    '"Pricing governance appears fragmented, which may allow inconsistent deal-level decisions to accumulate across the portfolio."',
    '"Pricing governance appears inconsistently applied, which may allow deal-level decisions to accumulate unevenly across the franchise."')

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
