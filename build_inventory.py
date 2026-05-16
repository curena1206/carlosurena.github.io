#!/usr/bin/env python3
"""
Step 2: Build visible_output_inventory.txt across all 17 approved files.
Classifies each file. Extracts all user-visible strings.
Run from ~/Desktop/carlosurena.github.io:
    python3 build_inventory.py > inventory_log.txt 2>&1
"""

import re, os, glob

DESKTOP = os.path.expanduser("~/Desktop")

# ── File manifest with classification ─────────────────────────────────────────

FILES = [
    # carlosurena.github.io
    {"path": f"{DESKTOP}/carlosurena.github.io/index.html",
     "repo": "carlosurena.github.io", "type": "html",
     "classification": "active-primary",
     "label": "Home page — carlosurena.com"},
    {"path": f"{DESKTOP}/carlosurena.github.io/consulting.html",
     "repo": "carlosurena.github.io", "type": "html",
     "classification": "active-primary",
     "label": "Consulting page — carlosurena.com/consulting"},
    {"path": f"{DESKTOP}/carlosurena.github.io/pfi.html",
     "repo": "carlosurena.github.io", "type": "pfi",
     "classification": "active-primary",
     "label": "PFI diagnostic tool — carlosurena.com/pfi"},
    {"path": f"{DESKTOP}/carlosurena.github.io/playbooks.html",
     "repo": "carlosurena.github.io", "type": "html",
     "classification": "active-secondary",
     "label": "Playbooks page — carlosurena.com/playbooks"},

    # ai-payments-portfolio
    {"path": f"{DESKTOP}/Payments project/ai-payments-portfolio/src/main.jsx",
     "repo": "ai-payments-portfolio", "type": "jsx",
     "classification": "active-secondary",
     "label": "React router / entry point — models.carlosurena.com"},
    {"path": f"{DESKTOP}/Payments project/ai-payments-portfolio/src/pages/FrameworkIndex.jsx",
     "repo": "ai-payments-portfolio", "type": "jsx",
     "classification": "active-primary",
     "label": "Model index + routing table — models.carlosurena.com"},
    {"path": f"{DESKTOP}/Payments project/ai-payments-portfolio/src/models/Model01_ProfitabilityEngine.jsx",
     "repo": "ai-payments-portfolio", "type": "jsx",
     "classification": "active-primary",
     "label": "Model 01 — Profitability Engine"},
    {"path": f"{DESKTOP}/Payments project/ai-payments-portfolio/src/models/Model02_RailOptimizer.jsx",
     "repo": "ai-payments-portfolio", "type": "jsx",
     "classification": "active-primary",
     "label": "Model 02 — Rail Optimizer"},
    {"path": f"{DESKTOP}/Payments project/ai-payments-portfolio/src/models/Model03_CorridorAnalyzer.jsx",
     "repo": "ai-payments-portfolio", "type": "jsx",
     "classification": "active-primary",
     "label": "Model 03 — Corridor Analyzer (positioning risk)"},
    {"path": f"{DESKTOP}/Payments project/ai-payments-portfolio/src/models/Model04_ClientBehavior.jsx",
     "repo": "ai-payments-portfolio", "type": "jsx",
     "classification": "active-primary",
     "label": "Model 04 — Client Behavior"},
    {"path": f"{DESKTOP}/Payments project/ai-payments-portfolio/src/models/Model05_PortfolioScorecard.jsx",
     "repo": "ai-payments-portfolio", "type": "jsx",
     "classification": "active-primary",
     "label": "Model 05 — Portfolio Scorecard"},
    {"path": f"{DESKTOP}/Payments project/ai-payments-portfolio/src/models/Model06_MoneyMovement.jsx",
     "repo": "ai-payments-portfolio", "type": "jsx",
     "classification": "active-primary",
     "label": "Model 06 — Money Movement"},

    # carlosurena.com (legacy)
    {"path": f"{DESKTOP}/carlosurena.com/index.html",
     "repo": "carlosurena.com", "type": "html",
     "classification": "legacy-public",
     "label": "Legacy home page — curena1206.github.io/carlosurena.com/"},
    {"path": f"{DESKTOP}/carlosurena.com/usd-clearing.html",
     "repo": "carlosurena.com", "type": "html",
     "classification": "legacy-public",
     "label": "USD Clearing page — high-risk positioning, candidate for removal"},

    # -payments-portfolio-diagnostic- (legacy)
    {"path": f"{DESKTOP}/-payments-portfolio-diagnostic-/index.html",
     "repo": "-payments-portfolio-diagnostic-", "type": "html",
     "classification": "legacy-public",
     "label": "Legacy diagnostic — original PFI, likely superseded"},
    {"path": f"{DESKTOP}/-payments-portfolio-diagnostic-/app.js",
     "repo": "-payments-portfolio-diagnostic-", "type": "js",
     "classification": "legacy-public",
     "label": "Legacy app logic — pre-patch language likely present"},
    {"path": f"{DESKTOP}/-payments-portfolio-diagnostic-/model.js",
     "repo": "-payments-portfolio-diagnostic-", "type": "js",
     "classification": "legacy-public",
     "label": "Legacy model/question data — pre-patch language likely present"},
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def read(path):
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except: return ""

def clean(s):
    return re.sub(r'\s+', ' ', str(s)).strip()

def extract_html_visible(raw):
    """Extract visible text from HTML (strip scripts, styles, comments)."""
    text = re.sub(r'<script[\s\S]*?</script>', '', raw, flags=re.I)
    text = re.sub(r'<style[\s\S]*?</style>',  '', text, flags=re.I)
    text = re.sub(r'<!--[\s\S]*?-->',          '', text)
    results = []
    for m in re.finditer(r'>([^<]{10,})<', text):
        t = clean(m.group(1))
        if t and not t.startswith('//'):
            results.append(t)
    return results

def extract_html_attrs(raw):
    """Extract title, placeholder, alt, aria-label attributes."""
    results = []
    for attr in ['title', 'placeholder', 'alt', 'aria-label', 'content']:
        for m in re.finditer(rf'{attr}=["\']([^"\'{{}}]{{8,}})["\']', raw, re.I):
            results.append(clean(m.group(1)))
    return results

def extract_js_strings(raw, min_len=12):
    """Extract meaningful string literals from JS/JSX."""
    SKIP_LINE = ['import ', 'export ', 'require(', 'className=', 'style={{',
                 'color:', 'background', 'padding:', 'margin:', 'fontSize:',
                 'fontFamily:', 'border', 'display:', 'width:', 'height:',
                 'flex', '/*', '//', '*.', 'node_modules']
    results = []
    for line in raw.split('\n'):
        ls = line.strip()
        if any(ls.startswith(s) for s in SKIP_LINE): continue
        if any(s in line for s in ['node_modules', '.css', '.svg', '.png']): continue
        for m in re.finditer(r'"([^"\\]{%d,})"' % min_len, line):
            val = m.group(1)
            if re.match(r'https?://|/[a-z/]|\.[a-z]{2,4}$', val): continue
            if val.count(' ') == 0 and len(val) > 30: continue  # skip long tokens
            results.append(clean(val))
        for m in re.finditer(r"'([^'\\]{%d,})'" % min_len, line):
            val = m.group(1)
            if re.match(r'https?://|/[a-z/]|\.[a-z]{2,4}$', val): continue
            results.append(clean(val))
    return results

def section(html, start, end):
    si = html.find(start)
    ei = html.find(end, si) if si >= 0 else -1
    return html[si:ei] if si >= 0 and ei >= 0 else ""

def extract_pfi_deep(raw):
    """Deep extraction from pfi.html — all embedded source objects."""
    results = []  # list of (field, text)

    def add(field, text):
        t = clean(str(text))
        if t and len(t) >= 10:
            results.append((field, t))

    # PFI_SCENARIOS
    sc = section(raw, 'const PFI_SCENARIOS = [', '\n    function pfiGetScenario')
    if sc:
        for f in ['scenario_name','benchmark_insight','exec_diagnosis','strategic_takeaway']:
            for m in re.finditer(rf'{f}:\s*"([^"]+)"', sc):
                add(f"PFI_SCENARIOS.{f}", m.group(1))
        for f in ['key_issues','structural_issues','immediate_focus']:
            for m in re.finditer(rf'{f}:\s*\[([^\]]+)\]', sc, re.DOTALL):
                for s in re.finditer(r'"([^"]{10,})"', m.group(1)):
                    add(f"PFI_SCENARIOS.{f}", s.group(1))
        for m in re.finditer(r'pillar_commentary:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}', sc, re.DOTALL):
            for s in re.finditer(r'"([^"]{15,})"', m.group(1)):
                add("PFI_SCENARIOS.pillar_commentary", s.group(1))
        for bm in re.finditer(r'priorities:\s*\[([\s\S]*?)\],\s*execution:', sc):
            for f in ['title','owner','kpi','why']:
                for s in re.finditer(rf'{f}:\s*"([^"]{{8,}})"', bm.group(1)):
                    add(f"PFI_SCENARIOS.priority.{f}", s.group(1))
        for bm in re.finditer(r'execution:\s*\[([\s\S]*?)\],\s*strategic_takeaway:', sc):
            for s in re.finditer(r'"([^"]{6,})"', bm.group(1)):
                add("PFI_SCENARIOS.execution", s.group(1))

    # SIGNAL_RULES
    sig = section(raw, '    var SIGNAL_RULES = [', '\n    function computeSignals(')
    if sig:
        for m in re.finditer(r'pattern_flag:"([^"]+)"', sig):
            add("SIGNAL_RULES.pattern_flag", m.group(1))
        for tier in ['priority_low','priority_mid','priority_high','priority']:
            for m in re.finditer(rf'{tier}:\{{([^}}]+(?:\{{[^}}]*\}}[^}}]*)*)\}}', sig):
                for f in ['title','owner','kpi','why']:
                    for s in re.finditer(rf'{f}:"([^"]{{8,}})"', m.group(1)):
                        add(f"SIGNAL_RULES.{tier}.{f}", s.group(1))
        for m in re.finditer(r'advisory_path:\{label:"([^"]+)",description:"([^"]+)"\}', sig):
            add("SIGNAL_RULES.advisory.label",       m.group(1))
            add("SIGNAL_RULES.advisory.description", m.group(2))

    # PPD_MODEL
    mdl = section(raw, 'window.PPD_MODEL = (() => {', '// ── APP.JS EMBEDDED')
    if mdl:
        for f in ['title','desc']:
            for m in re.finditer(rf'{f}:\s*"([^"]{{8,}})"', mdl):
                add(f"Question.{f}", m.group(1))
        for f in ['label','sub']:
            for m in re.finditer(rf'{f}:\s*"([^"]{{8,}})"', mdl):
                add(f"Question.option.{f}", m.group(1))
        for m in re.finditer(r'R\d+:\s*\{[^}]+\}', mdl, re.DOTALL):
            blk = m.group(0)
            for f in ['title','owner','metric','why']:
                for s in re.finditer(rf'{f}:\s*"([^"]{{8,}})"', blk):
                    add(f"Recommendation.{f}", s.group(1))
        for m in re.finditer(r'diagnosis:\s*"([^"]+)"', mdl):
            add("OldRules.diagnosis", m.group(1))

    # exportPDF
    pdf = section(raw, '    function exportPDF() {', '    // Share link')
    if pdf:
        for m in re.finditer(r'doc\.text\(\s*["\']([^"\']{4,})["\']', pdf):
            add("exportPDF.text", m.group(1))
        for m in re.finditer(r'"([A-Z][A-Z &/\-]{5,})"', pdf):
            add("exportPDF.label", m.group(1))

    # Render functions
    render = section(raw, '    function computeAndShow(', '    function exportPDF(')
    if render:
        for m in re.finditer(r'(?:label|prefix):\s*"([^"]{4,})"', render):
            add("RenderFn.label", m.group(1))
        for m in re.finditer(r'return\s*"([^"]{8,})"', render):
            add("RenderFn.maturity_label", m.group(1))

    # Scenario cards
    sc_arr = section(raw, '  const SCENARIOS = [', '\n  function initApp(')
    if sc_arr:
        for f in ['label','description','tag']:
            for m in re.finditer(rf'{f}:\s*"([^"]{{8,}})"', sc_arr):
                add(f"ScenarioCard.{f}", m.group(1))

    # Page HTML
    for t in extract_html_visible(raw):
        add("HTML.visible", t)

    return results

# ── Build inventory ───────────────────────────────────────────────────────────

inventory = []  # (repo, file_label, classification, field, text)

for fdef in FILES:
    path  = fdef["path"]
    repo  = fdef["repo"]
    label = fdef["label"]
    cls   = fdef["classification"]
    ftype = fdef["type"]
    fname = os.path.basename(path)

    if not os.path.exists(path):
        print(f"  MISSING: {path}")
        continue

    raw = read(path)
    size = len(raw)
    print(f"  Reading [{cls:18s}] {repo}/{fname} ({size:,} chars)")

    entries = []

    if ftype == "pfi":
        for field, text in extract_pfi_deep(raw):
            entries.append((field, text))

    elif ftype == "html":
        for t in extract_html_visible(raw):
            entries.append(("HTML.visible", t))
        for t in extract_html_attrs(raw):
            entries.append(("HTML.attr", t))
        # Also extract JS strings from inline scripts
        for m in re.finditer(r'<script[^>]*>([\s\S]*?)</script>', raw, re.I):
            for t in extract_js_strings(m.group(1), min_len=15):
                entries.append(("InlineScript.string", t))

    elif ftype in ("jsx", "js"):
        for t in extract_js_strings(raw, min_len=12):
            entries.append(("JSX.string", t))
        # Also pull JSX text content
        for m in re.finditer(r'>([^<>{]{12,})<', raw):
            t = clean(m.group(1))
            if t:
                entries.append(("JSX.text", t))

    for field, text in entries:
        inventory.append({
            "repo":  repo,
            "file":  fname,
            "path":  path,
            "label": label,
            "cls":   cls,
            "field": field,
            "text":  text,
        })

# Deduplicate by text
seen = set()
unique = []
for item in inventory:
    key = item["text"][:120]
    if key not in seen:
        seen.add(key)
        unique.append(item)

print(f"\n  Total raw entries:   {len(inventory)}")
print(f"  Unique strings:      {len(unique)}")

# ── Write inventory file ──────────────────────────────────────────────────────

OUT = os.path.join(DESKTOP, "carlosurena.github.io", "visible_output_inventory.txt")

with open(OUT, 'w', encoding='utf-8') as f:
    f.write("VISIBLE OUTPUT INVENTORY\n")
    f.write(f"17 files | {len(unique)} unique strings\n")
    f.write("=" * 90 + "\n")
    f.write("Format: [REPO] | [FILE] | [CLASSIFICATION] | [FIELD] | TEXT\n")
    f.write("=" * 90 + "\n\n")

    for cls_code, cls_label in [
        ("active-primary",   "ACTIVE PRIMARY SOURCES"),
        ("active-secondary", "ACTIVE SECONDARY SOURCES"),
        ("legacy-public",    "LEGACY / PUBLIC — candidate for review"),
    ]:
        group = [i for i in unique if i["cls"] == cls_code]
        if not group: continue
        f.write(f"\n{'─'*90}\n")
        f.write(f"{cls_label}  ({len(group)} strings)\n")
        f.write(f"{'─'*90}\n\n")
        for item in group:
            f.write(f"[{item['repo']}] | [{item['file']}] | [{item['field']}] | {item['text']}\n")

print(f"\n  Written: {OUT}")
print(f"\n  Breakdown by classification:")
for cls_code in ["active-primary","active-secondary","legacy-public"]:
    n = sum(1 for i in unique if i["cls"] == cls_code)
    print(f"    {cls_code:20s}: {n} strings")

print(f"\nStep 2 complete. Awaiting approval to proceed to lexical audit.")
