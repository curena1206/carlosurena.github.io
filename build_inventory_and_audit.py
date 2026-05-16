#!/usr/bin/env python3
"""
Builds a complete user-visible output inventory from the PFI ecosystem
and runs a lexical audit against it.
Outputs: visible_output_inventory.txt + audit report to stdout.
Run from carlosurena.github.io directory:
    python3 build_inventory_and_audit.py
"""

import re, os, json

PFI_PATH    = "pfi.html"
MODELS_PATH = os.path.expanduser(
    "~/Desktop/Payments project/ai-payments-portfolio/src/pages/FrameworkIndex.jsx")

# ── Helpers ───────────────────────────────────────────────────────────────────

def section(html, start, end):
    si = html.find(start)
    ei = html.find(end, si) if si >= 0 else -1
    return html[si:ei] if si >= 0 and ei >= 0 else ""

def strings_in(text, min_len=12):
    """Extract all JS/JSON string values (double-quoted, non-empty)."""
    return [m.group(1) for m in re.finditer(r'"([^"\\]{%d,})"' % min_len, text)
            if not m.group(1).startswith('/')] # skip paths/urls

def clean(s):
    return re.sub(r'\s+', ' ', s.replace('\n',' ').replace('\r','')).strip()

# ── Load files ────────────────────────────────────────────────────────────────

with open(PFI_PATH, 'r', encoding='utf-8', errors='ignore') as f:
    pfi = f.read()

models_src = ""
if os.path.exists(MODELS_PATH):
    with open(MODELS_PATH, 'r', encoding='utf-8', errors='ignore') as f:
        models_src = f.read()

inventory = []  # list of (source_object, field, text)

def add(source, field, text):
    t = clean(str(text))
    if t and len(t) >= 8 and not t.startswith('//'):
        inventory.append((source, field, t))

# ═══════════════════════════════════════════════════════════════════════════════
# 1. PFI_SCENARIOS — all 5 bands, all fields
# ═══════════════════════════════════════════════════════════════════════════════

sc_block = section(pfi, 'const PFI_SCENARIOS = [', '\n    function pfiGetScenario')

# Extract scenario names
for m in re.finditer(r'scenario_name:\s*"([^"]+)"', sc_block):
    add("PFI_SCENARIOS", "scenario_name", m.group(1))

for m in re.finditer(r'benchmark_insight:\s*"([^"]+)"', sc_block):
    add("PFI_SCENARIOS", "benchmark_insight", m.group(1))

for m in re.finditer(r'exec_diagnosis:\s*"([^"]+)"', sc_block):
    add("PFI_SCENARIOS", "exec_diagnosis", m.group(1))

for m in re.finditer(r'strategic_takeaway:\s*"([^"]+)"', sc_block):
    add("PFI_SCENARIOS", "strategic_takeaway", m.group(1))

# key_issues, structural_issues, immediate_focus (arrays of strings)
for field in ['key_issues', 'structural_issues', 'immediate_focus']:
    for m in re.finditer(r'%s:\s*\[([^\]]+)\]' % field, sc_block, re.DOTALL):
        for s in re.finditer(r'"([^"]{10,})"', m.group(1)):
            add("PFI_SCENARIOS", field, s.group(1))

# pillar_commentary (object with pillar keys)
for m in re.finditer(r'pillar_commentary:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}', sc_block, re.DOTALL):
    for s in re.finditer(r'"([^"]{15,})"', m.group(1)):
        add("PFI_SCENARIOS", "pillar_commentary", s.group(1))

# priorities: title, owner, kpi, why
for m in re.finditer(r'priorities:\s*\[([\s\S]*?)\],\s*execution:', sc_block):
    block = m.group(1)
    for field in ['title', 'owner', 'kpi', 'why']:
        for s in re.finditer(r'%s:\s*"([^"]{8,})"' % field, block):
            add("PFI_SCENARIOS", f"priorities.{field}", s.group(1))

# execution phases
for m in re.finditer(r'execution:\s*\[([\s\S]*?)\],\s*strategic_takeaway:', sc_block):
    block = m.group(1)
    for field in ['phase', 'label', 'items']:
        for s in re.finditer(r'"([^"]{6,})"', block):
            add("PFI_SCENARIOS", "execution", s.group(1))

# ═══════════════════════════════════════════════════════════════════════════════
# 2. SIGNAL_RULES — all 18 rules, all priority tiers
# ═══════════════════════════════════════════════════════════════════════════════

sig_block = section(pfi, '    var SIGNAL_RULES = [', '\n    function computeSignals(')

for m in re.finditer(r'pattern_flag:"([^"]+)"', sig_block):
    add("SIGNAL_RULES", "pattern_flag", m.group(1))

for tier in ['priority_low', 'priority_mid', 'priority_high', 'priority']:
    for m in re.finditer(r'%s:\{([^}]+(?:\{[^}]*\}[^}]*)*)\}' % tier, sig_block):
        block = m.group(1)
        for field in ['title', 'owner', 'kpi', 'why']:
            for s in re.finditer(r'%s:"([^"]{8,})"' % field, block):
                add("SIGNAL_RULES", f"{tier}.{field}", s.group(1))

for m in re.finditer(r'advisory_path:\{label:"([^"]+)",description:"([^"]+)"\}', sig_block):
    add("SIGNAL_RULES", "advisory_path.label",       m.group(1))
    add("SIGNAL_RULES", "advisory_path.description", m.group(2))

# ═══════════════════════════════════════════════════════════════════════════════
# 3. PPD_MODEL — question model, recommendations, old rules engine
# ═══════════════════════════════════════════════════════════════════════════════

model_block = section(pfi, 'window.PPD_MODEL = (() => {', '// ── APP.JS EMBEDDED')

# Questions: title, desc, option labels and subs
for m in re.finditer(r'title:\s*"([^"]{8,})"', model_block):
    add("Question model", "question.title", m.group(1))

for m in re.finditer(r'desc:\s*"([^"]{8,})"', model_block):
    add("Question model", "question.desc", m.group(1))

for m in re.finditer(r'label:\s*"([^"]{8,})"', model_block):
    add("Question model", "option.label", m.group(1))

for m in re.finditer(r'sub:\s*"([^"]{8,})"', model_block):
    add("Question model", "option.sub", m.group(1))

# Recommendations
for m in re.finditer(r'R\d+:\s*\{[^}]+\}', model_block, re.DOTALL):
    block = m.group(0)
    for field in ['title', 'owner', 'metric', 'why']:
        for s in re.finditer(r'%s:\s*"([^"]{8,})"' % field, block):
            add("Recommendations", f"rec.{field}", s.group(1))

# Old rules engine diagnoses
for m in re.finditer(r'diagnosis:\s*"([^"]+)"', model_block):
    add("Old rules engine", "diagnosis", m.group(1))

# ═══════════════════════════════════════════════════════════════════════════════
# 4. Render functions — rating labels, prefixes, maturity labels
# ═══════════════════════════════════════════════════════════════════════════════

render_block = section(pfi, '    function computeAndShow(', '    function exportPDF(')

for m in re.finditer(r'label:\s*"([A-Z][A-Z ]+)"', render_block):
    add("Render functions", "rating_label", m.group(1))

for m in re.finditer(r'prefix:\s*"([^"]{4,})"', render_block):
    add("Render functions", "diag_prefix", m.group(1))

for m in re.finditer(r'return\s*"([^"]{8,})"', render_block):
    add("Render functions", "maturity_label", m.group(1))

# ═══════════════════════════════════════════════════════════════════════════════
# 5. exportPDF — all hardcoded text strings
# ═══════════════════════════════════════════════════════════════════════════════

pdf_block = section(pfi, '    function exportPDF() {', '    // Share link')

for m in re.finditer(r'doc\.text\(\s*"([^"]{4,})"', pdf_block):
    add("exportPDF", "pdf_text", m.group(1))

for m in re.finditer(r'doc\.text\(\s*\'([^\']{4,})\'', pdf_block):
    add("exportPDF", "pdf_text", m.group(1))

# Section headers, labels in PDF
for m in re.finditer(r'"([A-Z][A-Z &/\-]{6,})"', pdf_block):
    add("exportPDF", "pdf_header", m.group(1))

# ═══════════════════════════════════════════════════════════════════════════════
# 6. Page HTML — visible non-script text
# ═══════════════════════════════════════════════════════════════════════════════

html_only = re.sub(r'<script[\s\S]*?</script>', '', pfi, flags=re.I)
html_only = re.sub(r'<style[\s\S]*?</style>', '', html_only, flags=re.I)
for m in re.finditer(r'>([^<]{12,})<', html_only):
    t = clean(m.group(1))
    if t and not t.startswith('//') and not t.startswith('*'):
        add("Page HTML", "visible_text", t)

# ═══════════════════════════════════════════════════════════════════════════════
# 7. SCENARIOS array (scenario cards shown before diagnostic)
# ═══════════════════════════════════════════════════════════════════════════════

sc_arr = section(pfi, '  const SCENARIOS = [', '\n  function initApp(')
for field in ['label', 'description', 'tag']:
    for m in re.finditer(r'%s:\s*"([^"]{8,})"' % field, sc_arr):
        add("Scenario cards", f"card.{field}", m.group(1))

# ═══════════════════════════════════════════════════════════════════════════════
# 8. Models page — FrameworkIndex.jsx
# ═══════════════════════════════════════════════════════════════════════════════

if models_src:
    for m in re.finditer(r'(?:title|name|description|group|label|usedIn|route):\s*[\'"]([^\'"]{8,})[\'"]', models_src):
        add("Models page", "model_field", m.group(1))
    for m in re.finditer(r'>([^<{]{12,})<', models_src):
        t = clean(m.group(1))
        if t: add("Models page", "visible_text", t)

# ═══════════════════════════════════════════════════════════════════════════════
# Write inventory file
# ═══════════════════════════════════════════════════════════════════════════════

# Deduplicate
seen_inv = set()
unique_inv = []
for source, field, text in inventory:
    key = text[:100]
    if key not in seen_inv:
        seen_inv.add(key)
        unique_inv.append((source, field, text))

INV_PATH = "visible_output_inventory.txt"
with open(INV_PATH, 'w', encoding='utf-8') as f:
    f.write(f"VISIBLE OUTPUT INVENTORY — {len(unique_inv)} unique strings\n")
    f.write("=" * 80 + "\n")
    f.write("Format: [SOURCE] | [FIELD] | TEXT\n")
    f.write("=" * 80 + "\n\n")
    for source, field, text in unique_inv:
        f.write(f"[{source}] | [{field}] | {text}\n")

print(f"Inventory written: {INV_PATH}")
print(f"Total unique strings: {len(unique_inv)}\n")

# ═══════════════════════════════════════════════════════════════════════════════
# Lexical audit against inventory
# ═══════════════════════════════════════════════════════════════════════════════

AUDIT_TERMS = [
    ("optimization/optimize",     r'\boptimiz(e|ed|ing|ation|ations)?\b'),
    ("deploy",                    r'\bDeploy(ed|ing)?\b|\bdeploy(ed|ing)?\b'),
    ("framework",                 r'\bframework\b'),
    ("corridor",                  r'\bcorridor\b'),
    ("cross-border",              r'\bcross[- ]border\b'),
    ("correspondent",             r'\bcorrespondent\b'),
    ("FX",                        r'\bFX\b'),
    ("Trading/FX",                r'Trading.?FX'),
    ("Network Management",        r'Network Management'),
    ("Senior Leadership",         r'Senior Leadership'),
    ("Relationship Management",   r'Relationship Management'),
    ("balance-adjusted",          r'balance[- ]adjusted'),
    ("balance-linked",            r'balance[- ]linked'),
    ("market entry",              r'\bmarket entry\b'),
    ("addressable market",        r'\baddressable market\b'),
    ("institution/institutional", r'\binstitution(al|s)?\b'),
    ("fragmented",                r'\bfragmented\b'),
    ("underdeveloped",            r'\bunderdeveloped\b'),
    ("roadmap",                   r'\broadmap\b'),
    ("immediate priority",        r'\bimmediate priority\b'),
]

# Visibility and risk classification per source object
SOURCE_VIS = {
    "PFI_SCENARIOS":      ("Web+PDF after diagnostic", "conditional"),
    "SIGNAL_RULES":       ("Web+PDF when rule fires",  "conditional"),
    "Question model":     ("Questionnaire",             "during questionnaire"),
    "Recommendations":    ("Web when old rules fire",   "conditional"),
    "Old rules engine":   ("Web when old rules fire",   "conditional"),
    "Render functions":   ("Web+PDF results section",   "conditional"),
    "exportPDF":          ("PDF export",                "conditional"),
    "Page HTML":          ("Website always",            "always"),
    "Scenario cards":     ("Website always",            "always"),
    "Models page":        ("models.carlosurena.com",    "always"),
}

# Risk rules
def risk(term_label, text, source):
    t = term_label.lower()
    tx = text.lower()
    # Always acceptable
    if "addressable market" in t: return ("None", "Approved to keep")
    if "roadmap" in t and "technology roadmap" in tx: return ("None", "Technology planning context — acceptable")
    if "roadmap" in t: return ("Low", "Planning language — check if consulting-deck framing")
    if "fragmented" in t or "underdeveloped" in t: return ("None", "Diagnostic descriptor — acceptable")
    if "immediate priority" in t: return ("None", "Diagnostic output label — acceptable")
    if "cross-border" in t and ("international payment" in tx or "not part of" in tx): return ("None", "Already normalized to international framing")
    if "cross-border" in t and ("ach, wires" in tx or "real-time payments" in tx): return ("None", "Enumerated payment type — accurate")
    if "cross-border" in t: return ("Low", "Cross-border reference — verify framing is international, not corridor-specific")
    if "correspondent" in t: return ("High", "Correspondent banking term — verify this was patched")
    if "fx" in t and "trading" in t: return ("High", "Trading/FX desk language")
    if "fx" in t and ("fee, fx" in tx or "revenue mix" in tx or "fx-related activity" in tx): return ("None", "FX as one of three revenue categories (RA1) — acceptable")
    if "fx" in t and ("ad-hoc" in tx or "scenario" in tx.lower()): return ("Low", "Scenario description — minor, acceptable")
    if "fx" in t: return ("Low", "FX reference — verify context is not RA6 or specialist")
    if "corridor" in t: return ("High", "Corridor term — verify this was patched")
    if "network management" in t: return ("High", "Functional title — verify SIGNAL_RULES patch applied")
    if "senior leadership" in t: return ("None", "Frozen static band content — approved")
    if "relationship management" in t and ("owner:" in tx or 'owner"' in tx): return ("None", "Static band owner field — approved for frozen content")
    if "relationship management" in t: return ("None", "Domain concept — acceptable")
    if "balance-adjusted" in t: return ("High", "Should have been patched — verify")
    if "balance-linked" in t: return ("High", "Should have been patched — verify")
    if "market entry" in t: return ("None", "Band 4 execution — check if patched to 'defined approach'")
    if "institution" in t and ("scaled institutional" in tx or "institutional discipline" in tx or "institutional credibility" in tx): return ("None", "Frozen Enterprise band — approved")
    if "institution" in t: return ("Low", "Institution reference — verify context")
    if "optimization" in t and "rail routing" in tx: return ("Low", "Rail routing context — acceptable domain language")
    if "optimization" in t and ("band" in source.lower() or "scenario" in source.lower()): return ("None", "Frozen static content — approved")
    if "optimization" in t: return ("Low", "Optimize — check if consulting framing or domain language")
    if "deploy" in t and ("capability is" in tx or "fully deployed" in tx): return ("None", "Descriptive/passive — approved")
    if "deploy" in t: return ("Low", "Deploy — check if action phrase or passive descriptor")
    if "framework" in t and "shared metrics" in tx: return ("Low", "Check if patched to 'structure'")
    if "framework" in t and "pricing and cost" in tx: return ("Low", "Check if patched to 'model'")
    if "framework" in t: return ("Low", "Framework reference — check context")
    return ("Low", "Check context")

print("LEXICAL AUDIT — VISIBLE OUTPUT INVENTORY")
print("=" * 80)

audit_hits = []
for source, field, text in unique_inv:
    for term_label, pattern in AUDIT_TERMS:
        if re.search(pattern, text, re.IGNORECASE):
            vis, timing = SOURCE_VIS.get(source, ("Unknown", "unknown"))
            risk_level, reason = risk(term_label, text, source)
            audit_hits.append({
                "term":       term_label,
                "text":       text[:140],
                "source":     source,
                "field":      field,
                "visible_where": vis,
                "timing":     timing,
                "risk":       risk_level,
                "reason":     reason,
            })

# Group by risk
for risk_level, label in [("High","HIGH RISK"), ("Low","LOW RISK / MONITOR"), ("None","ACCEPTABLE / NO ACTION")]:
    group = [h for h in audit_hits if h["risk"] == risk_level]
    if not group: continue
    print(f"\n{'─'*80}")
    print(f"{label}  ({len(group)} items)")
    print(f"{'─'*80}")
    for h in group:
        print(f"\n  Term:           {h['term']}")
        print(f"  Rendered text:  {h['text']}")
        print(f"  Source object:  {h['source']} → {h['field']}")
        print(f"  Visible where:  {h['visible_where']} ({h['timing']})")
        print(f"  Risk:           {h['risk']}")
        print(f"  Action:         {h['reason']}")

print(f"\n{'='*80}")
print(f"INVENTORY: {len(unique_inv)} unique strings audited")
print(f"HITS:      {len(audit_hits)} flagged")
print(f"  High:    {sum(1 for h in audit_hits if h['risk']=='High')}")
print(f"  Low:     {sum(1 for h in audit_hits if h['risk']=='Low')}")
print(f"  None:    {sum(1 for h in audit_hits if h['risk']=='None')}")
print(f"{'='*80}")
