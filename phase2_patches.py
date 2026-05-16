#!/usr/bin/env python3
"""
Phase 2 active source patches:
  A. playbooks.html — corridor/correspondent/nostro reframe
  B. FrameworkIndex.jsx — Model03 identity + route
  C. Model03_CorridorAnalyzer.jsx — FX/corridor label reframe
Run from ~/Desktop/carlosurena.github.io:
    python3 phase2_patches.py
"""

import os, re

DESKTOP = os.path.expanduser("~/Desktop")

PATHS = {
    "playbooks":   os.path.join(DESKTOP, "carlosurena.github.io", "playbooks.html"),
    "framework":   os.path.join(DESKTOP, "Payments project", "ai-payments-portfolio",
                                "src", "pages", "FrameworkIndex.jsx"),
    "model03":     os.path.join(DESKTOP, "Payments project", "ai-payments-portfolio",
                                "src", "models", "Model03_CorridorAnalyzer.jsx"),
}

log = []

def load(key):
    with open(PATHS[key], 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def save(key, content):
    with open(PATHS[key], 'w', encoding='utf-8') as f:
        f.write(content)

def rep(content, label, old, new, count=0):
    n = content.count(old)
    if n == 0:
        log.append(f"  MISS  [{label}]")
        return content
    content = content.replace(old, new, count or n)
    log.append(f"  OK    [{label}] ({n}x)")
    return content

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 2A — playbooks.html
# ═══════════════════════════════════════════════════════════════════════════════

html = load("playbooks")
log.append("\n── Phase 2A: playbooks.html ──")

# 1. Section heading
html = rep(html, "Section heading — Corridor Economics → Payment Flow Economics",
    "Corridor Economics",
    "Payment Flow Economics")

# 2. Playbook title
html = rep(html, "Playbook title — Payments Corridor Strategy → Payment Flow Strategy",
    "Payments Corridor Strategy",
    "Payment Flow Strategy")

# 3. Full description with correspondent/nostro (most critical)
html = rep(html, "Description — remove correspondent/nostro",
    "A framework for mapping corridor economics from gross revenue to net margin and "
    "classifying each corridor as Grow, Defend, Optimize, or De-prioritize. Covers "
    "the full cost stack including correspondent charges, nostro funding, compliance, "
    "and operational exceptions.",
    "A framework for mapping payment flow economics from gross revenue to net margin "
    "and classifying each flow as Grow, Defend, Optimize, or De-prioritize. Covers "
    "the full cost stack across pricing, servicing, operating cost, compliance, "
    "and exception activity.")

# 4. Corridor monetization in GTM description
html = rep(html, "Corridor monetization → payment flow monetization",
    "Covers corridor monetization, client segmentation",
    "Covers payment flow monetization, client segmentation")

# 5. Any remaining "corridor" in visible text (not in code/attributes)
remaining_corridor = re.findall(r'(?<!["\'/\w])corridor(?![-\w])', html, re.IGNORECASE)
if remaining_corridor:
    log.append(f"  NOTE  [playbooks.html] remaining 'corridor' occurrences: {len(remaining_corridor)} — review manually")
    # Show context for each
    for m in re.finditer(r'(?<!["\'/\w])corridor(?![-\w])', html, re.IGNORECASE):
        pos = m.start()
        ls = html.rfind('\n', 0, pos) + 1
        le = html.find('\n', pos)
        line = html[ls:le].strip()[:100]
        log.append(f"    context: {line}")

save("playbooks", html)

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 2B — FrameworkIndex.jsx
# ═══════════════════════════════════════════════════════════════════════════════

jsx = load("framework")
log.append("\n── Phase 2B: FrameworkIndex.jsx ──")

# 1. Route
jsx = rep(jsx, "Route — corridor-analyzer → payment-flow-economics",
    "'/models/03-corridor-analyzer'",
    "'/models/03-payment-flow-economics'")

jsx = rep(jsx, 'Route (double-quote variant)',
    '"/models/03-corridor-analyzer"',
    '"/models/03-payment-flow-economics"')

# 2. Model title — try common formats
jsx = rep(jsx, "Model title — Corridor Analyzer",
    "'Corridor Analyzer'",
    "'Payment Flow Economics Analyzer'")

jsx = rep(jsx, "Model title (double-quote)",
    '"Corridor Analyzer"',
    '"Payment Flow Economics Analyzer"')

# 3. Short description — "by volume and corridor"
jsx = rep(jsx, "Description — by volume and corridor",
    "by volume and corridor.",
    "by payment flow and client segment.")

# 4. Full description — net margin by corridor (single-quote variant)
jsx = rep(jsx, "Description — net margin by corridor (single)",
    "to surface true net margin by corridor.",
    "to surface true net margin by flow.")

# 5. Full description replacement (Carlos approved text)
jsx = rep(jsx, "Description — full replacement (single-quote)",
    "Applies the full cost stack to each payment flow, including network, funding, "
    "compliance, and operational layers, to surface true net margin by corridor.",
    "Analyzes payment flows across rails, client segments, servicing structures, "
    "and flow characteristics to surface true net margin and portfolio economics.")

# 6. Also try without trailing period
jsx = rep(jsx, "Description — full replacement (no period)",
    "Applies the full cost stack to each payment flow, including network, funding, "
    "compliance, and operational layers, to surface true net margin by corridor",
    "Analyzes payment flows across rails, client segments, servicing structures, "
    "and flow characteristics to surface true net margin and portfolio economics")

# 7. Group label if present
jsx = rep(jsx, "Group label — Corridor",
    "group: 'Corridor'",
    "group: 'Payment Flow'")

jsx = rep(jsx, "Group label — Corridor (double-quote)",
    'group: "Corridor"',
    'group: "Payment Flow"')

save("framework", jsx)

# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 2C — Model03_CorridorAnalyzer.jsx
# ═══════════════════════════════════════════════════════════════════════════════

m3 = load("model03")
log.append("\n── Phase 2C: Model03_CorridorAnalyzer.jsx ──")

# FX label replacements (user-visible labels only, in quoted strings)
for old, new, label in [
    ('"FX Volatility"',                    '"Pricing Volatility"',                      "FX Volatility → Pricing Volatility"),
    ("'FX Volatility'",                    "'Pricing Volatility'",                      "FX Volatility → Pricing Volatility (single)"),
    ('"FX & Risk Profile"',                '"Pricing & Risk Profile"',                  "FX & Risk Profile → Pricing & Risk Profile"),
    ("'FX & Risk Profile'",                "'Pricing & Risk Profile'",                  "FX & Risk Profile → Pricing & Risk Profile (single)"),
    ('"FX Capture Rate"',                  '"Revenue Capture Rate"',                    "FX Capture Rate → Revenue Capture Rate"),
    ("'FX Capture Rate'",                  "'Revenue Capture Rate'",                    "FX Capture Rate → Revenue Capture Rate (single)"),
    ("FX spread floors to protect revenue","pricing floors to protect revenue",          "FX spread floors → pricing floors"),
    ("FX spread is adequately capturing",  "pricing spread is adequately capturing",     "FX spread adequately → pricing spread"),
    ("FX spread of",                       "pricing spread of",                          "FX spread of → pricing spread of"),
    ("FX spread compresses",               "pricing spread compresses",                  "FX spread compresses → pricing spread"),
    ('"FX spread',                         '"pricing spread',                            "FX spread (quoted) → pricing spread"),
    ("dynamic FX spread",                  "dynamic pricing spread",                     "dynamic FX spread → dynamic pricing spread"),
]:
    m3 = rep(m3, label, old, new)

# Corridor replacements — user-visible labels in quoted strings
for old, new, label in [
    ('"Corridor"',                          '"Payment Flow"',                            "Corridor label → Payment Flow"),
    ("'Corridor'",                          "'Payment Flow'",                            "Corridor label → Payment Flow (single)"),
    ('"corridor"',                          '"payment flow"',                            "corridor label (lower) → payment flow"),
    ('"Select a corridor"',                 '"Select a payment flow"',                   "Select a corridor → Select a payment flow"),
    ("'Select a corridor'",                 "'Select a payment flow'",                   "Select a corridor (single)"),
    ('"No corridor selected"',              '"No payment flow selected"',                "No corridor selected"),
    ("'No corridor selected'",              "'No payment flow selected'",                "No corridor selected (single)"),
    ('"by corridor"',                       '"by payment flow"',                         "by corridor → by payment flow"),
    ("'by corridor'",                       "'by payment flow'",                         "by corridor (single)"),
    ('net margin by corridor',              'net margin by flow',                        "net margin by corridor → by flow"),
    ('"per corridor"',                      '"per flow"',                                "per corridor → per flow"),
    ("'per corridor'",                      "'per flow'",                                "per corridor (single)"),
    ('"Corridor Economics"',                '"Payment Flow Economics"',                  "Corridor Economics → Payment Flow Economics"),
    ("'Corridor Economics'",                "'Payment Flow Economics'",                  "Corridor Economics (single)"),
    ('"Corridor Analyzer"',                 '"Payment Flow Economics Analyzer"',         "Corridor Analyzer → Payment Flow Economics Analyzer"),
    ("'Corridor Analyzer'",                 "'Payment Flow Economics Analyzer'",         "Corridor Analyzer (single)"),
    ('"Payment Corridor"',                  '"Payment Flow"',                            "Payment Corridor → Payment Flow"),
    ("'Payment Corridor'",                  "'Payment Flow'",                            "Payment Corridor (single)"),
]:
    m3 = rep(m3, label, old, new)

# Show remaining corridor occurrences in quoted strings (potential misses)
remaining = []
for m in re.finditer(r'["\']([^"\']*corridor[^"\']*)["\']', m3, re.IGNORECASE):
    remaining.append(m.group(0)[:80])
if remaining:
    log.append(f"  NOTE  [Model03] remaining 'corridor' in quoted strings ({len(remaining)}):")
    for r in remaining[:10]:
        log.append(f"    {r}")

save("model03", m3)

# ═══════════════════════════════════════════════════════════════════════════════
# REPORT
# ═══════════════════════════════════════════════════════════════════════════════

print("PHASE 2 PATCH RESULTS")
print("=" * 65)
for l in log:
    print(l)

ok   = sum(1 for l in log if l.strip().startswith("OK"))
miss = sum(1 for l in log if l.strip().startswith("MISS"))
note = sum(1 for l in log if l.strip().startswith("NOTE"))
print(f"\n{ok} applied  |  {miss} not found  |  {note} notes")

print("""
─────────────────────────────────────────────────────────────────
PHASE 1 REPO INSTRUCTIONS (manual — no script required)

1. -payments-portfolio-diagnostic- → MAKE PRIVATE
   Option A (disable GitHub Pages only):
     Go to: github.com/curena1206/-payments-portfolio-diagnostic-
     Settings → Pages → Source → set to "None" → Save

   Option B (make repo private):
     Go to: github.com/curena1206/-payments-portfolio-diagnostic-
     Settings → Danger Zone → Change visibility → Make private

2. carlosurena.com → MAKE PRIVATE or DISABLE PAGES
   Option A (disable GitHub Pages only):
     Go to: github.com/curena1206/carlosurena.com
     Settings → Pages → Source → set to "None" → Save

   Option B (make repo private):
     Go to: github.com/curena1206/carlosurena.com
     Settings → Danger Zone → Change visibility → Make private

   Recommendation: Make private. USD clearing page should not
   remain publicly indexed.
─────────────────────────────────────────────────────────────────

After completing Phase 1, run the re-audit:
    python3 run_lexical_audit.py > audit_report.txt 2>&1 && cat audit_report.txt
""")
