#!/usr/bin/env python3
"""
Patches playbooks.html:
  1. FX Margin tag → Payment Spread
  2. PDF href corridor → payment-flow (if PDF can be renamed)
Run from ~/Desktop/carlosurena.github.io:
    python3 patch_playbooks.py
"""

import os

PB = "playbooks.html"

with open(PB, 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

log = []

def rep(label, old, new):
    global html
    n = html.count(old)
    if n > 0:
        html = html.replace(old, new)
        log.append(f"  OK    [{label}] ({n}x)")
    else:
        log.append(f"  MISS  [{label}]")

# 1. FX Margin tag → Payment Spread
rep('Tag — FX Margin → Payment Spread',
    '<span class="playbook-tag">FX Margin</span>',
    '<span class="playbook-tag">Payment Spread</span>')

# 2. PDF href — rename corridor to payment-flow
# Only patch if the PDF file has been or will be renamed
rep('PDF href — corridor → payment-flow-strategy',
    'href="/payments-corridor-strategy-framework.pdf"',
    'href="/payment-flow-strategy-framework.pdf"')

with open(PB, 'w', encoding='utf-8') as f:
    f.write(html)

print("Playbooks patch results:")
for l in log: print(l)
ok   = sum(1 for l in log if l.strip().startswith("OK"))
miss = sum(1 for l in log if l.strip().startswith("MISS"))
print(f"\n{ok} applied  |  {miss} not found")
print("\nNOTE: If the PDF href was updated, rename the actual PDF file too:")
print("  mv ~/Desktop/carlosurena.github.io/payments-corridor-strategy-framework.pdf \\")
print("     ~/Desktop/carlosurena.github.io/payment-flow-strategy-framework.pdf")
print("  git add -A")
print("  git commit -m 'Playbooks — rename corridor PDF to payment-flow-strategy'")
