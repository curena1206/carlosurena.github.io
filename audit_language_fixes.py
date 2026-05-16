#!/usr/bin/env python3
"""
Confirm all 11 flagged language items.
Run from carlosurena.github.io directory:
    python3 audit_language_fixes.py
"""

with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

checks = [
    # Should NOT be present (old language)
    ("REMOVED: Trading/FX",           "Trading/FX",                           False),
    ("REMOVED: Network Management",    "Network Management + Product",          False),
    ("REMOVED: balance-adjusted (1)",  "Balance-adjusted relationship economics", False),
    ("REMOVED: balance-adjusted (2)",  "balance-adjusted portfolio economics",   False),
    ("REMOVED: balance linkage rate",  "balance linkage rate",                  False),
    ("REMOVED: balance-linked deal",   "balance-linked deal count",             False),
    ("REMOVED: Senior Leadership (B4)","HR + Senior Leadership",                False),
    ("REMOVED: Senior Leadership (B5a)","Senior Leadership + HR",               False),
    ("REMOVED: Senior Leadership (B5b)","Senior Leadership + Compliance",       False),
    ("REMOVED: market entry",          "market entry plan",                     False),
    ("REMOVED: correspondent (title)", "correspondent flow management",         False),
    ("REMOVED: correspondent (desc)",  "cross-border or correspondent flows",   False),
    ("REMOVED: institution's",         "the institution's strategic",           False),
    ("REMOVED: corridor strategy",     "cross-border corridor strategy",        False),

    # Should BE present (new language)
    ("PRESENT: Product + Pricing + Sales",    "Product + Pricing + Sales",                    True),
    ("PRESENT: Portfolio Management + Product","Portfolio Management + Product",               True),
    ("PRESENT: balance contribution review",  "balance contribution and pricing review",       True),
    ("PRESENT: balance-inclusive",            "balance-inclusive portfolio economics",         True),
    ("PRESENT: balance contribution rate",    "balance contribution rate",                    True),
    ("PRESENT: treasury-inclusive deal count","treasury-inclusive deal count",                True),
    ("PRESENT: HR + Senior Management",       "HR + Senior Management",                       True),
    ("PRESENT: Senior Management + HR",       "Senior Management + HR",                       True),
    ("PRESENT: Senior Management + Compliance","Senior Management + Compliance",              True),
    ("PRESENT: defined approach",             "Implement expanded flow strategy with defined approach", True),
    ("PRESENT: international payment flows (title)", "international payment flow management", True),
    ("PRESENT: international payment flows (desc)",  "cross-border or international payment flows", True),
    ("PRESENT: franchise's strategic",        "the franchise's strategic",                    True),
    ("PRESENT: MR4 instruction updated",      "MR4 (international payment flows)",            True),
]

print("LANGUAGE AUDIT RESULTS")
print("=" * 60)
passed = failed = 0
for label, term, should_exist in checks:
    found = term in html
    ok = found == should_exist
    status = "PASS" if ok else "FAIL"
    if ok: passed += 1
    else:  failed += 1
    print(f"  {status}  {label}")

print(f"\n{passed} passed  |  {failed} failed")
