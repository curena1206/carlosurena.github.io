#!/usr/bin/env python3
"""
Reframes the corridor model in FrameworkIndex.jsx.
No other models touched. No logic changes.
Run from anywhere:
    python3 patch_models_corridor.py
"""

import re, os

SOURCE = os.path.expanduser(
    "~/Desktop/Payments project/ai-payments-portfolio/src/pages/FrameworkIndex.jsx"
)

if not os.path.exists(SOURCE):
    print(f"File not found: {SOURCE}")
    exit(1)

with open(SOURCE, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

log = []

def rep(label, old, new):
    global content
    n = content.count(old)
    if n > 0:
        content = content.replace(old, new)
        log.append(f"  OK  [{label}] ({n}x)")
    else:
        log.append(f"  MISS [{label}]")

# ── Show what's currently in the corridor section before patching ─────────────

print("CURRENT STATE — corridor references:")
for m in re.finditer(r'corridor', content, re.IGNORECASE):
    pos = m.start()
    ls = content.rfind('\n', 0, pos) + 1
    le = content.find('\n', pos)
    line = content[ls:le].strip()
    if not any(s in line for s in ['import','//','className','style']):
        print(f"  {line[:120]}")

print()

# ── 1. Route ──────────────────────────────────────────────────────────────────

rep("Route — corridor-analyzer → payment-flow-analyzer",
    "route: '/models/03-corridor-analyzer'",
    "route: '/models/03-payment-flow-analyzer'")

# ── 2. Model title / name (try common patterns) ───────────────────────────────

rep("Title — Corridor Analyzer",
    "Corridor Analyzer",
    "Payment Flow Economics Analyzer")

rep("Title — Corridor Economics",
    "Corridor Economics",
    "Payment Flow Economics")

rep("Title — corridor analyzer (lowercase)",
    "corridor analyzer",
    "payment flow economics analyzer")

rep("Title — corridor-analyzer label",
    "corridor-analyzer",
    "payment-flow-analyzer")

# ── 3. Description text — full sentence replacements ─────────────────────────

# Target the full description strings containing corridor
rep("Desc — by volume and corridor",
    "layers, and execution patterns by volume and corridor.",
    "layers, and execution patterns by payment flow and client segment.")

rep("Desc — net margin by corridor",
    "to surface true net margin by corridor.",
    "to surface true net margin by flow.")

# ── 4. Broader description replacement with Carlos's suggested language ────────
# If there's a longer description block, replace it

rep("Desc — segment by corridor variant",
    "by volume and corridor",
    "by payment flow and client segment")

rep("Desc — net margin by corridor standalone",
    "net margin by corridor",
    "net margin by flow")

rep("Desc — margin by corridor",
    "margin by corridor",
    "margin by flow")

rep("Desc — by corridor standalone",
    "by corridor",
    "by payment flow")

# ── Write ─────────────────────────────────────────────────────────────────────

with open(SOURCE, 'w', encoding='utf-8') as f:
    f.write(content)

print("PATCH RESULTS:")
for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")

print()
print("UPDATED STATE — corridor/flow references after patch:")
for m in re.finditer(r'corridor|payment.flow.economics|payment-flow', content, re.IGNORECASE):
    pos = m.start()
    ls = content.rfind('\n', 0, pos) + 1
    le = content.find('\n', pos)
    line = content[ls:le].strip()
    if not any(s in line for s in ['import','//','className','style']):
        print(f"  {line[:120]}")
