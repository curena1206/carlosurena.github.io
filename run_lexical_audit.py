#!/usr/bin/env python3
"""
Fixed lexical audit — corrects inventory parser (len < 4, not < 5).
Run from ~/Desktop/carlosurena.github.io:
    python3 run_lexical_audit.py > audit_report.txt 2>&1 && cat audit_report.txt
"""

import re, os

DESKTOP  = os.path.expanduser("~/Desktop")
INV_PATH = os.path.join(DESKTOP, "carlosurena.github.io", "visible_output_inventory.txt")
LEGACY_REPOS = {"carlosurena.com", "-payments-portfolio-diagnostic-"}

entries = []
with open(INV_PATH, 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        line = line.rstrip('\n')
        if not line.startswith('[') or ' | ' not in line:
            continue
        parts = [p.strip() for p in line.split(' | ')]
        if len(parts) < 4:
            continue
        repo  = parts[0].strip('[]')
        fname = parts[1].strip('[]')
        field = parts[2].strip('[]')
        text  = ' | '.join(parts[3:])
        cls   = "legacy-public" if repo in LEGACY_REPOS else "active"
        entries.append({"repo": repo, "file": fname, "field": field,
                        "text": text, "cls": cls})

print(f"Inventory loaded: {len(entries)} unique strings\n")

TERMS = [
    ("USD clearing",              r'\bUSD clearing\b|\busd clearing\b'),
    ("clearing",                  r'\bclearing\b'),
    ("corridor",                  r'\bcorridor\b'),
    ("correspondent",             r'\bcorrespondent\b'),
    ("FX",                        r'\bFX\b'),
    ("Trading/FX",                r'Trading.?FX'),
    ("cross-border",              r'\bcross[- ]border\b'),
    ("Network Management",        r'Network Management'),
    ("balance-adjusted",          r'balance[- ]adjusted'),
    ("balance-linked",            r'balance[- ]linked'),
    ("Senior Leadership",         r'Senior Leadership'),
    ("Relationship Management",   r'Relationship Management'),
    ("institution/institutional", r'\binstitution(al|s|\'s)?\b'),
    ("market entry",              r'\bmarket entry\b'),
    ("roadmap",                   r'\broadmap\b'),
    ("framework",                 r'\bframework\b'),
    ("deploy",                    r'\bDeploy(ed|ing)?\b|\bdeploy(ed|ing)?\b'),
    ("optimization/optimize",     r'\boptimiz(e|ed|ing|ation|ations)?\b'),
    ("addressable market",        r'\baddressable market\b'),
    ("settlement",                r'\bsettlement\b'),
    ("nostro",                    r'\bnostro\b'),
    ("SWIFT",                     r'\bSWIFT\b'),
    ("fragmented",                r'\bfragmented\b'),
    ("transformation",            r'\btransformation\b'),
]

def classify(term_label, text, repo, field, cls):
    t, tx = term_label.lower(), text.lower()
    if cls == "legacy-public":
        if "usd clearing" in t:  return ("High",   "USD clearing — candidate for removal")
        if "clearing" in t:      return ("High",   "Clearing — specialist framing in legacy file")
        if "corridor" in t:      return ("High",   "Corridor — legacy language")
        if "correspondent" in t: return ("High",   "Correspondent — legacy banking term")
        if "nostro" in t:        return ("High",   "Nostro — institutional term in legacy file")
        if "swift" in t:         return ("Medium", "SWIFT — verify context in legacy file")
        if "fx" in t:            return ("Medium", "FX — verify not specialist framing")
        if "settlement" in t:    return ("Medium", "Settlement — verify context")
        return                          ("Medium", "Legacy file — verify not live or visible")
    if "usd clearing" in t:      return ("High",   "USD clearing — active source")
    if "corridor" in t:
        if "payment" in tx or "flow" in tx or "international" in tx:
            return ("None", "Corridor in payment flow context — acceptable")
        return ("High", "Corridor term — verify patched in active source")
    if "correspondent" in t:     return ("High",   "Correspondent — verify cleared")
    if "network management" in t:return ("High",   "Network Management — verify signal rules patch")
    if "balance-adjusted" in t:  return ("High",   "Should be balance-inclusive — verify patch")
    if "balance-linked" in t:    return ("High",   "Should be treasury-inclusive — verify patch")
    if "nostro" in t:            return ("High",   "Nostro — active source, institutional term")
    if "trading/fx" in t:        return ("High",   "Trading/FX desk language — verify cleared")
    if "clearing" in t:          return ("Medium", "Clearing — verify context")
    if "swift" in t:             return ("Medium", "SWIFT — institutional term, verify context")
    if "settlement" in t:        return ("Medium", "Settlement — verify if banking framing needed")
    if "fx" in t:
        if any(x in tx for x in ["fee, fx","revenue mix","fx-related activity","fx is ad-hoc"]):
            return ("None", "FX as revenue category (RA1) — acceptable")
        return ("Low", "FX — verify not specialist framing")
    if "senior leadership" in t: return ("None", "Frozen static — approved")
    if "institution" in t:
        if any(x in tx for x in ["scaled institutional","institutional discipline",
                                   "institutional credibility","institutional value"]):
            return ("None", "Frozen Enterprise band — approved")
        return ("Low", "Institution — verify context")
    if "relationship management" in t:
        return ("None", "Domain concept or frozen owner — acceptable")
    if "cross-border" in t:
        if any(x in tx for x in ["international payment","not part of","ach, wires"]):
            return ("None", "Already normalized or accurate enumeration")
        return ("Low", "Cross-border — verify international framing used")
    if "market entry" in t:
        if "defined approach" in tx: return ("None", "Already patched")
        return ("Low", "Market entry — verify patched")
    if "roadmap" in t:
        if "technology roadmap" in tx: return ("None", "Technology planning — acceptable")
        return ("Low", "Planning language — check framing")
    if "framework" in t:
        if "shared metrics" in tx: return ("Low", "Check if patched to structure")
        if "pricing and cost" in tx: return ("Low", "Check if patched to model")
        return ("None", "General usage")
    if "deploy" in t:
        if any(x in tx for x in ["capability is","fully deployed","is deployed"]):
            return ("None", "Descriptive/passive — approved")
        return ("Low", "Deploy — verify action vs passive")
    if "optimization" in t:
        if "rail routing" in tx or "routing optimization" in tx:
            return ("Low", "Rail routing — acceptable domain language")
        if "pfi_scenarios" in field.lower():
            return ("None", "Frozen static — approved")
        return ("Low", "Optimize — verify framing")
    if "addressable market" in t: return ("None", "Approved to keep")
    if "fragmented" in t:         return ("None", "Diagnostic descriptor — acceptable")
    if "transformation" in t:     return ("Low",  "Check for strategy-deck framing")
    return ("Low", "Review context")

hits, seen = [], set()
for entry in entries:
    for term_label, pattern in TERMS:
        if re.search(pattern, entry["text"], re.IGNORECASE):
            risk, reason = classify(term_label, entry["text"],
                                    entry["repo"], entry["field"], entry["cls"])
            key = (term_label, entry["text"][:100])
            if key not in seen:
                seen.add(key)
                hits.append({**entry, "term": term_label, "risk": risk, "reason": reason})

print("FULL ECOSYSTEM LEXICAL AUDIT")
print("=" * 80)
print(f"Files: 17 | Strings: {len(entries)} | Hits: {len(hits)}")
print(f"High: {sum(1 for h in hits if h['risk']=='High')}  "
      f"Medium: {sum(1 for h in hits if h['risk']=='Medium')}  "
      f"Low: {sum(1 for h in hits if h['risk']=='Low')}  "
      f"None: {sum(1 for h in hits if h['risk']=='None')}")
print("=" * 80)

for risk_level, risk_label in [
    ("High",   "HIGH RISK — ACTION REQUIRED"),
    ("Medium", "MEDIUM RISK — REVIEW REQUIRED"),
    ("Low",    "LOW RISK — MONITOR"),
    ("None",   "ACCEPTABLE / APPROVED"),
]:
    group = [h for h in hits if h["risk"] == risk_level]
    if not group: continue
    print(f"\n{'─'*80}")
    print(f"{risk_label}  ({len(group)} items)")
    print(f"{'─'*80}")
    for h in group:
        print(f"\n  Term:     {h['term']}")
        print(f"  Text:     {h['text']}")
        print(f"  Source:   [{h['cls']}] {h['repo']} → {h['file']} → {h['field']}")
        print(f"  Action:   {h['reason']}")

print(f"\n{'='*80}")
print("REPO-LEVEL RECOMMENDATIONS")
print(f"{'='*80}\n")
for repo in ["carlosurena.github.io","ai-payments-portfolio",
             "carlosurena.com","-payments-portfolio-diagnostic-"]:
    rh = [h for h in hits if h["repo"] == repo and h["risk"] in ("High","Medium")]
    print(f"  {repo}  (High: {sum(1 for h in rh if h['risk']=='High')}  Medium: {sum(1 for h in rh if h['risk']=='Medium')})")
    for h in rh[:5]:
        print(f"    [{h['risk']:6s}] {h['term']}: {h['text'][:65]}")
    if len(rh) > 5: print(f"    ...and {len(rh)-5} more")
    print()
print("  STATUS:")
print("  carlosurena.github.io           → KEEP ACTIVE")
print("  ai-payments-portfolio           → KEEP ACTIVE — targeted patches needed")
print("  carlosurena.com                 → RETIRE / REDIRECT — usd-clearing.html primary risk")
print("  -payments-portfolio-diagnostic- → ARCHIVE OR MAKE PRIVATE — superseded by pfi.html")
