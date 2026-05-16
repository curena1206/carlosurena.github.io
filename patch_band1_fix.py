#!/usr/bin/env python3
"""
Fix two missed band 1 patches.
Run from carlosurena.github.io directory:
    python3 patch_band1_fix.py
"""

import re

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

# Find exact exec_diagnosis text in file
m = re.search(r'exec_diagnosis: "([^"]{50,200})"', html)
if m:
    print(f"Current exec_diagnosis:\n  {m.group(1)}\n")

# Find exact structural_issue 3 text
m3 = re.search(r'"Pricing governance appears (inconsistently applied[^"]+)"', html)
if m3:
    print(f"Current structural_issue 3:\n  {m3.group()}\n")

# Apply fixes based on what's actually in the file
rep("exec_diagnosis — find current",
    'exec_diagnosis: "The portfolio appears unevenly developed across governance, pricing discipline, management visibility, and portfolio management. The immediate management priority is stabilization: establish ownership, reporting discipline, and pricing controls before pursuing broader commercial expansion."',
    'exec_diagnosis: "The portfolio appears unevenly developed across governance, pricing discipline, management visibility, and portfolio management. Initial priorities may include strengthening ownership, reporting discipline, and pricing controls before pursuing broader commercial expansion."')

# structural_issue 3 — previous patch already changed "fragmented" to "inconsistently applied"
# so current text starts with "inconsistently applied" but ends differently
rep("structural_issue 3 — current text",
    '"Pricing governance appears inconsistently applied, which may allow inconsistent deal-level decisions to accumulate across the portfolio."',
    '"Pricing governance appears inconsistently applied, which may allow deal-level decisions to accumulate unevenly across the franchise."')

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
print("\nIf still missing, paste the 'Current' lines above and we'll fix exactly.")
