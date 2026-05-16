#!/usr/bin/env python3
"""
Surgical Model03 patch — 3 exact user-visible label changes.
Run from ~/Desktop/carlosurena.github.io:
    python3 patch_model03.py
"""

import os

MODEL03 = os.path.expanduser(
    "~/Desktop/Payments project/ai-payments-portfolio/"
    "src/models/Model03_CorridorAnalyzer.jsx"
)

with open(MODEL03, 'r', encoding='utf-8', errors='ignore') as f:
    src = f.read()

log = []

def rep(label, old, new):
    global src
    n = src.count(old)
    if n > 0:
        src = src.replace(old, new)
        log.append(f"  OK    [{label}] ({n}x)")
    else:
        log.append(f"  MISS  [{label}]")

# 1. KpiCard sub label — "Fees + FX margin" → "Fees + pricing spread"
rep('KpiCard sub — Fees + FX margin',
    'sub="Fees + FX margin"',
    'sub="Fees + pricing spread"')

# 2. FX Spread label → Pricing Spread
rep('FX Spread label → Pricing Spread (double-quote)',
    'l:"FX Spread"',
    'l:"Pricing Spread"')

rep('FX Spread label → Pricing Spread (single-quote)',
    "l:'FX Spread'",
    "l:'Pricing Spread'")

# 3. FX volatility in body string → pricing volatility
rep('FX volatility → pricing volatility (in body string)',
    'FX volatility of σ ',
    'pricing volatility of σ ')

# 4. Also catch any remaining FX Volatility as standalone label
rep('FX Volatility standalone → Pricing Volatility',
    'FX Volatility',
    'Pricing Volatility')

# 5. FX & Risk Profile → Pricing & Risk Profile (backtick or other format)
rep('FX & Risk Profile → Pricing & Risk Profile',
    'FX & Risk Profile',
    'Pricing & Risk Profile')

# 6. FX Capture Rate → Revenue Capture Rate
rep('FX Capture Rate → Revenue Capture Rate',
    'FX Capture Rate',
    'Revenue Capture Rate')

with open(MODEL03, 'w', encoding='utf-8') as f:
    f.write(src)

print("Model03 patch results:")
for l in log: print(l)
ok   = sum(1 for l in log if l.strip().startswith("OK"))
miss = sum(1 for l in log if l.strip().startswith("MISS"))
print(f"\n{ok} applied  |  {miss} not found")
