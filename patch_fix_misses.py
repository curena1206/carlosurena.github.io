#!/usr/bin/env python3
"""
Fix three missed patches using exact strings from the file.
Run from carlosurena.github.io directory:
    python3 patch_fix_misses.py
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

# Fix corruption from global institutionalize → establish replacement
# "institutionalized" became "establishd" (missing the 'd')
rep("Fix corruption — establishd → embedded",
    'current practices become establishd before structural improvement occurs.',
    'current practices may become embedded before structural improvement occurs.')

# B1 key_issue 2 — literal \\u2014 in file (not the character)
rep("B1 key_issue 2 — fragmented → inconsistent",
    'Pricing governance appears fragmented \\u2014 override behavior without consistent review',
    'Pricing governance appears inconsistent \\u2014 override behavior lacks structured review.')

# B1 key_issue 3 — literal \\u2014 in file
rep("B1 key_issue 3 — absent → limited",
    'Portfolio management rhythm appears absent \\u2014 metrics undefined or inconsistently reviewed',
    'Portfolio management rhythm appears limited \\u2014 metrics may not be consistently defined or reviewed.')

with open('pfi.html', 'w', encoding='utf-8') as f:
    f.write(html)

for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
