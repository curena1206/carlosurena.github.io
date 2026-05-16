#!/usr/bin/env python3
"""
Approved lexical reconciliation patch.
Covers pfi.html and consulting.html per approved change list.
Run from carlosurena.github.io directory:
    python3 patch_lexical_approved.py
"""

import os

log = []

def patch(filepath, label, old, new, count=0):
    """count=0 means replace all; count=1 means replace first only"""
    if not os.path.exists(filepath):
        log.append(f"  FILE NOT FOUND  [{label}]")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    n = html.count(old)
    if n == 0:
        log.append(f"  MISS  [{label}]")
    else:
        html = html.replace(old, new, count or n)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        log.append(f"  OK  [{label}] ({n}x)")

PFI = "pfi.html"
CON = "consulting.html"

# ════════════════════════════════════════════════════════════════
# 1. RA6 QUESTION REFRAME — title, desc, 5 options
# ════════════════════════════════════════════════════════════════

patch(PFI, "RA6 title",
    'title: "FX-related monetization discipline"',
    'title: "Revenue capture across payment activity"')

patch(PFI, "RA6 desc",
    'desc: "Where FX-related payment activity exists, how consistently are pricing, spread management, and economic performance evaluated?"',
    'desc: "Where payment activity generates variable revenue — through pricing spreads, service fees, or flow-specific economics — how consistently is revenue capture evaluated and managed?"')

patch(PFI, "RA6 option score 0 label",
    'label: "FX-related activity minimally monetized or not strategically evaluated"',
    'label: "Revenue capture appears limited or not strategically evaluated"')

patch(PFI, "RA6 option score 0 sub",
    'sub: "FX contribution appears operational rather than strategically managed"',
    'sub: "Variable revenue from payment flows appears operational rather than strategically managed"')

patch(PFI, "RA6 option score 2 label",
    'label: "FX pricing exists but governance appears inconsistent"',
    'label: "Revenue capture exists but consistency varies across flows and segments"')

patch(PFI, "RA6 option score 2 sub",
    'sub: "Spread management and monetization visibility may vary across segments and flows"',
    'sub: "Pricing discipline and revenue visibility may vary across payment types and client segments"')

patch(PFI, "RA6 option score 3 label",
    'label: "FX economics managed across major payment segments"',
    'label: "Revenue capture managed across major payment segments and flows"')

# RA6 score 3 sub is already clean — no FX reference, leave as-is

patch(PFI, "RA6 option score 4 label",
    'label: "FX-related economics incorporated into portfolio management"',
    'label: "Revenue capture incorporated into portfolio management and pricing discipline"')

patch(PFI, "RA6 option score 4 sub",
    'sub: "Pricing, spread management, and economic performance are evaluated systematically across major flows"',
    'sub: "Pricing discipline, value capture, and economic performance are evaluated systematically across major payment flows"')

patch(PFI, "RA6 option score 5 label",
    'label: "FX monetization strategically integrated into payment economics"',
    'label: "Revenue capture strategically integrated into payment economics and portfolio management"')

patch(PFI, "RA6 option score 5 sub",
    'sub: "FX-related contribution is consistently evaluated alongside broader portfolio economics and client strategy"',
    'sub: "Variable revenue contribution is consistently evaluated alongside broader portfolio economics and client strategy"')

# ════════════════════════════════════════════════════════════════
# 2. R5 RECOMMENDATION
# ════════════════════════════════════════════════════════════════

patch(PFI, "R5 title",
    'title: "Develop corridor-based FX strategy with spread management discipline"',
    'title: "Develop payment flow pricing strategy and revenue capture discipline"')

patch(PFI, "R5 metric",
    'metric: "FX capture rate, spread leakage by corridor, corridor-level P&L"',
    'metric: "Revenue capture rate, pricing realization by flow, contribution visibility"')

patch(PFI, "R5 why",
    'why: "Converts cross-border flows into a deliberately managed revenue lever." }',
    'why: "Revenue capture across payment flows is among the more recoverable margin opportunities in a commercial payments portfolio." }')

# ════════════════════════════════════════════════════════════════
# 3. R9 RECOMMENDATION
# ════════════════════════════════════════════════════════════════

patch(PFI, "R9 title",
    'title: "Optimize correspondent and network costs through routing strategy and contract structure"',
    'title: "Strengthen external payment network cost management through routing strategy and provider structure"')

# ════════════════════════════════════════════════════════════════
# 4. MR4 SCORE-5 OPTION LABEL
# ════════════════════════════════════════════════════════════════

patch(PFI, "MR4 score-5 option label",
    'label: "Cross-border and correspondent flows integrated into portfolio strategy"',
    'label: "Cross-border and international payment flows integrated into portfolio strategy"')

patch(PFI, "MR4 score-5 option sub",
    'sub: "Major flows are managed through structured economic, partner, client, and operating discipline"',
    'sub: "Major flows are managed through structured economic, servicing, client, and operating discipline"')

# ════════════════════════════════════════════════════════════════
# 5. BALANCE-ADJUSTED → BALANCE-INCLUSIVE
# ════════════════════════════════════════════════════════════════

patch(PFI, "BL2 title — balance-adjusted",
    'title: "Visibility into balance-adjusted relationship economics"',
    'title: "Visibility into balance-inclusive relationship economics"')

patch(PFI, "BL2 score 3 label",
    'label: "Balance-adjusted economics incorporated for major relationships"',
    'label: "Balance-inclusive economics incorporated for major relationships"')

patch(PFI, "BL2 score 5 label",
    'label: "Balance-adjusted economics operationalized across the franchise"',
    'label: "Balance-inclusive economics operationalized across the franchise"')

patch(PFI, "R4 title — balance-adjusted",
    'title: "Build and implement balance-adjusted pricing model"',
    'title: "Build and implement balance-inclusive pricing model"')

# ════════════════════════════════════════════════════════════════
# 6. consulting.html — QUADRANT LABEL
# ════════════════════════════════════════════════════════════════

patch(CON, "Quadrant label Optimize → Refine",
    '>Optimize<',
    '>Refine<')

# ════════════════════════════════════════════════════════════════
# 7. pfi.html — RESULTS SECTION: organizational scalability
# ════════════════════════════════════════════════════════════════

patch(PFI, "organizational scalability → operating scalability",
    'organizational scalability',
    'operating scalability')

# ════════════════════════════════════════════════════════════════
# 8. RELATIONSHIP MANAGEMENT — dynamic rules only
# Distinguish SIGNAL_RULES format (owner:") from PFI_SCENARIOS (owner: ")
# ════════════════════════════════════════════════════════════════

patch(PFI, "SIGNAL_RULES: Finance + Relationship Management → Portfolio Management",
    'owner:"Finance + Relationship Management"',
    'owner:"Finance + Portfolio Management"')

patch(PFI, "SIGNAL_RULES: Treasury + Relationship Management → Portfolio Management",
    'owner:"Treasury + Relationship Management"',
    'owner:"Treasury + Portfolio Management"')

patch(PFI, "SIGNAL_RULES: Relationship Management + Product → Commercial Management",
    'owner:"Relationship Management + Product"',
    'owner:"Commercial Management + Product"')

# ════════════════════════════════════════════════════════════════
# 9. DEPLOY — action phrases only (not descriptive uses)
# ════════════════════════════════════════════════════════════════

patch(PFI, "Deploy growth engine → Implement",
    '"Deploy growth engine across pipeline with repeatable model"',
    '"Implement growth engine across pipeline with repeatable model"')

patch(PFI, "Deploy Enterprise Analytics → Implement",
    'title: "Deploy Enterprise Analytics and Intelligence Platform"',
    'title: "Implement Enterprise Analytics and Intelligence Platform"')

patch(PFI, "Deploy next-stage analytics → Implement",
    '"Deploy next-stage analytics platform with real-time portfolio KPI capability"',
    '"Implement next-stage analytics capability with real-time portfolio KPI visibility"')

# ════════════════════════════════════════════════════════════════
# 10. FRAMEWORK — consulting/methodology usage only
# ════════════════════════════════════════════════════════════════

patch(PFI, "Framework → model (Band 2 execution)",
    '"Launch flow-level pricing and cost visibility framework"',
    '"Launch flow-level pricing and cost visibility model"')

patch(PFI, "Framework → structure (SIGNAL_RULES advisory)",
    'shared metrics framework."}',
    'shared metrics structure."}')

# ════════════════════════════════════════════════════════════════

print("Lexical reconciliation patch results:")
for l in log: print(l)
ok   = sum(1 for l in log if l.startswith("  OK"))
miss = sum(1 for l in log if l.startswith("  MISS"))
print(f"\n{ok} applied  |  {miss} not found")
print("\nRun full_site_audit.py to verify remaining hits.")
