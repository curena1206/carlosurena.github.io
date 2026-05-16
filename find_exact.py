#!/usr/bin/env python3
"""
Show exact current text around exec_diagnosis and structural_issue 3.
Run from carlosurena.github.io directory:
    python3 find_exact.py
"""

with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find exec_diagnosis in band 1 (first occurrence)
idx = html.find('exec_diagnosis:')
if idx >= 0:
    print("=== exec_diagnosis (first occurrence) ===")
    print(repr(html[idx:idx+300]))
    print()

# Find all structural_issues occurrences
for match_start in range(len(html)):
    if html[match_start:match_start+20] == '"Pricing governance a':
        print(f"=== 'Pricing governance' at position {match_start} ===")
        print(repr(html[match_start:match_start+200]))
        print()

# Also search for "inconsistently applied"
import re
for m in re.finditer(r'inconsistently applied', html):
    pos = m.start()
    print(f"=== 'inconsistently applied' at {pos} ===")
    print(repr(html[max(0,pos-20):pos+150]))
    print()

# And "immediate management priority"
for m in re.finditer(r'immediate management priority', html):
    pos = m.start()
    print(f"=== 'immediate management priority' at {pos} ===")
    print(repr(html[max(0,pos-30):pos+200]))
    print()
