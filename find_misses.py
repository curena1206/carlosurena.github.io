#!/usr/bin/env python3
"""Find exact current text for the three missed patches."""

import re

with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find B1 key_issue 2 — pricing governance
for m in re.finditer(r'Pricing governance appears.{0,80}', html):
    print(f"Pricing governance: {repr(m.group())}\n")

# Find B1 key_issue 3 — portfolio management rhythm
for m in re.finditer(r'Portfolio management rhythm.{0,80}', html):
    print(f"Portfolio mgmt rhythm: {repr(m.group())}\n")

# Find B2 benchmark — institutionalized
for m in re.finditer(r'current practices.{0,80}', html):
    print(f"Current practices: {repr(m.group())}\n")
PYEOF