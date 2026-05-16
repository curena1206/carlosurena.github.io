#!/usr/bin/env python3
"""
Full-system language audit across all PFI source objects.
Audit only — no modifications.
Run from carlosurena.github.io directory:
    python3 full_system_audit.py > audit_report.txt 2>&1
    cat audit_report.txt
"""

import re, os, glob, sys

# ── File paths ────────────────────────────────────────────────────────────────

BASE    = os.path.expanduser("~/Desktop/carlosurena.github.io")
MODELS  = os.path.expanduser("~/Desktop/curena1206.github.io")

FILES = {
    "index.html":      os.path.join(BASE, "index.html"),
    "consulting.html": os.path.join(BASE, "consulting.html"),
    "pfi.html":        os.path.join(BASE, "pfi.html"),
}

# Find models React file
model_files = glob.glob(os.path.join(MODELS, "**/*.jsx"), recursive=True) + \
              glob.glob(os.path.join(MODELS, "**/*.tsx"), recursive=True) + \
              glob.glob(os.path.join(MODELS, "**/*.js"),  recursive=True)
model_files = [f for f in model_files if not any(x in f for x in
               ['node_modules', '.git', 'min.js', 'bundle', 'chunk', 'worker'])]
for mf in model_files:
    key = "models:" + os.path.basename(mf)
    FILES[key] = mf

# ── Search terms ──────────────────────────────────────────────────────────────

TERMS = [
    ("optimization/optimize",  r'\boptimiz(e|ed|ing|ation|ations|er)?\b'),
    ("deploy/deployment",      r'\bDeploy(ed|ing|ment)?\b|\bdeploy(ed|ing|ment)?\b'),
    ("framework",              r'\bframework\b'),
    ("playbook",               r'\bplaybook\b'),
    ("market entry",           r'\bmarket entry\b'),
    ("addressable market",     r'\baddressable market\b'),
    ("leadership",             r'\bleadership\b|\bLeadership\b'),
    ("Senior Leadership",      r'\bSenior Leadership\b'),
    ("Sales Leadership",       r'\bSales Leadership\b'),
    ("Relationship Management",r'Relationship Management'),
    ("Network Management",     r'Network Management'),
    ("Trading/FX",             r'Trading.?FX'),
    ("FX",                     r'\bFX\b'),
    ("spread",                 r'\bspread\b'),
    ("corridor",               r'\bcorridor\b'),
    ("cross-border",           r'\bcross[- ]border\b'),
    ("correspondent",          r'\bcorrespondent\b'),
    ("clearing",               r'\bclearing\b'),
    ("settlement",             r'\bsettlement\b'),
    ("nostro",                 r'\bnostro\b'),
    ("wire/wires",             r'\bwires?\b'),
    ("SWIFT",                  r'\bSWIFT\b'),
    ("affiliate",              r'\baffiliate\b'),
    ("partner bank",           r'\bpartner bank\b'),
    ("institution/institutional", r'\binstitution(al|s|\'s)?\b'),
    ("organization/organizational", r'\borganizat(ion|ional)\b'),
    ("balance-adjusted",       r'balance[- ]adjusted'),
    ("balance-linked",         r'balance[- ]linked'),
    ("rate cycle/rate-cycle",  r'rate[- ]cycle'),
    ("treasury-only",          r'treasury[- ]only'),
    ("liquidity",              r'\bliquidity\b'),
    ("network costs",          r'network costs'),
    ("producing",              r'\bproducing\b'),
    ("diagnosis/diagnose",     r'\bdiagnos(e|is|tic)?\b'),
    ("immediate priority",     r'\bimmediate priority\b'),
    ("structural failure",     r'\bstructural failure\b'),
    ("fragmented",             r'\bfragmented\b'),
    ("underdeveloped",         r'\bunderdeveloped\b'),
    ("absent",                 r'\babsent\b'),
    ("roadmap",                r'\broadmap\b'),
    ("transformation",         r'\btransformation\b'),
]

# ── Section extraction from pfi.html ─────────────────────────────────────────

def get_section(html, start_marker, end_marker):
    si = html.find(start_marker)
    ei = html.find(end_marker, si) if si >= 0 else -1
    if si >= 0 and ei >= 0:
        return html[si:ei], si
    return "", -1

def get_html_body(html):
    """Extract non-script, non-style HTML"""
    cleaned = re.sub(r'<style[\s\S]*?</style>', '', html, flags=re.I)
    cleaned = re.sub(r'<script[\s\S]*?</script>', '', cleaned, flags=re.I)
    cleaned = re.sub(r'<!--[\s\S]*?-->', '', cleaned)
    return cleaned

# ── Visibility metadata per section ──────────────────────────────────────────

# (web_visible, pdf_visible, questionnaire, conditional, frozen, description)
SECTIONS_META = {
    "page_html":          (True,  False, False, False, False, "Page HTML — visible on load"),
    "scenarios_array":    (True,  False, False, False, False, "Scenario cards shown before diagnostic"),
    "pfi_scenarios_benchmark": (False, True, False, True, True,  "PDF page 1 — after export"),
    "pfi_scenarios_key_issues":(False, True, False, True, True,  "PDF page 1 — after export"),
    "pfi_scenarios_immediate": (False, True, False, True, True,  "PDF page 1 — after export"),
    "pfi_scenarios_pillar":    (True,  True, False, True, True,  "Web+PDF — after running diagnostic"),
    "pfi_scenarios_exec":      (True,  True, False, True, True,  "Web+PDF — after running diagnostic"),
    "pfi_scenarios_structural":(True,  True, False, True, True,  "Web+PDF — after running diagnostic"),
    "pfi_scenarios_priorities":(True,  True, False, True, True,  "Web+PDF — as static fill if <5 dynamic"),
    "pfi_scenarios_execution": (True,  True, False, True, True,  "Web+PDF — after running diagnostic"),
    "pfi_scenarios_takeaway":  (True,  True, False, True, True,  "Web+PDF — after running diagnostic"),
    "signal_rules_flag":       (True,  True, False, True, False, "Web observations + PDF page 3"),
    "signal_rules_pri_title":  (True,  True, False, True, False, "Web priorities + PDF page 3"),
    "signal_rules_pri_why":    (True,  True, False, True, False, "Web priorities + PDF page 3"),
    "signal_rules_pri_kpi":    (True,  True, False, True, False, "Web priorities + PDF page 3"),
    "signal_rules_owner":      (True,  True, False, True, False, "Web priorities + PDF page 3"),
    "signal_rules_advisory":   (True,  True, False, True, False, "Web advisory + PDF page 4"),
    "question_model_title":    (False, False,True,  False,False, "Questionnaire — question title"),
    "question_model_desc":     (False, False,True,  False,False, "Questionnaire — question description"),
    "question_model_labels":   (False, False,True,  False,False, "Questionnaire — answer option labels"),
    "question_model_subs":     (False, False,True,  False,False, "Questionnaire — answer option sub-labels"),
    "recommendations":         (True,  False,False, True, False, "Web diagnosis — when old rules fire"),
    "old_rules_diagnosis":     (True,  False,False, True, False, "Web diagnosis — when specific rules fire"),
    "render_functions":        (True,  True, False, True, False, "Rating labels, prefixes — results cards"),
    "export_pdf_hardcoded":    (False, True, False, False,False, "PDF hardcoded text"),
    "maturity_label_fn":       (True,  False,False, True, False, "Score card maturity label"),
}

# ── Risk classification ───────────────────────────────────────────────────────

def classify_risk(term_label, matched, context, section_key, file_name):
    """Return (category_code, risk_level, reason, replacement)"""
    ctx_lower = context.lower()
    term_lower = term_label.lower()

    # Frozen static content
    if section_key in ("pfi_scenarios_benchmark","pfi_scenarios_key_issues",
                       "pfi_scenarios_immediate","pfi_scenarios_pillar",
                       "pfi_scenarios_exec","pfi_scenarios_structural",
                       "pfi_scenarios_priorities","pfi_scenarios_execution",
                       "pfi_scenarios_takeaway"):
        return ("G", "None", "Frozen static band content — approved for preservation", "")

    # Internal-only (scoring logic, CSS, JS computation)
    if section_key in ("") or re.search(r'score:|weight:|\.score|\.weight|var |const |let |function |return |if \(|Math\.|clamp\(', context):
        pass  # Fall through to more specific checks

    # Specific term + context classifications
    if term_label == "FX":
        if "RA1" in context or "fee, FX" in context or "FX-related activity" in context:
            return ("H", "None", "FX as one of three revenue categories in RA1 — accurate domain language", "")
        if "FX is ad-hoc" in context:
            return ("E", "Low", "Scenario description visible when scenario card is hovered/loaded", "Consider: 'pricing is inconsistent and not systematically managed'")
        if section_key == "recommendations":
            return ("I", "Medium", "Old recommendation still references FX", "Check if R5 was fully updated")
        if section_key == "old_rules_diagnosis":
            return ("I", "Medium", "Old rules diagnosis references FX", "Check if diagnosis was updated")
        if section_key in ("question_model_title","question_model_desc","question_model_labels","question_model_subs"):
            if "RA6" in context or "Revenue capture" in context:
                return ("H","None","RA6 was reframed — residual FX in this context is from RA1 which is acceptable","")
            return ("B","Low","Questionnaire — FX in question model may be acceptable for relevant payment types","")
        if "consulting.html" in file_name:
            return ("A","Low","consulting.html copy lists FX as payment type alongside ACH/wire/cross-border — accurate","")
        return ("H","None","Acceptable domain language for payments with FX component","")

    if term_label == "corridor":
        if section_key == "recommendations" and "R1" in context:
            return ("I","Medium","R1 title still references corridor in metric","Check R1 metric update status")
        if section_key == "old_rules_diagnosis":
            return ("I","Medium","Old rules diagnosis references corridor","Check if diagnosis was updated")
        return ("H","None","Corridor as payment routing concept — acceptable","")

    if term_label == "correspondent":
        if section_key == "recommendations" and "R9" in context:
            return ("I","Medium","R9 still contains correspondent","Check R9 full update")
        if section_key == "question_model_labels" and "score: 5" in context:
            return ("H","None","MR4 score-5 label updated to international — check","")
        return ("H","None","Correspondent as payment concept — check context","")

    if term_label in ("optimization/optimize","deploy/deployment"):
        if section_key in ("pfi_scenarios_benchmark","pfi_scenarios_key_issues",
                           "pfi_scenarios_immediate","pfi_scenarios_pillar",
                           "pfi_scenarios_exec","pfi_scenarios_structural",
                           "pfi_scenarios_priorities","pfi_scenarios_execution",
                           "pfi_scenarios_takeaway"):
            return ("G","None","Frozen static content — approved","")
        if "deployed" in matched.lower() and "capability is" in ctx_lower:
            return ("H","None","Deployed in descriptive/passive context — approved to keep","")
        if "Rail Routing Optimization" in context:
            return ("G","None","Frozen static content","")
        if "advisory_path" in context and "optimization" in ctx_lower:
            return ("H","Low","Advisory path label — low visibility, acceptable routing terminology","")
        if "Routing optimization rate" in context:
            return ("H","Low","KPI field — routing optimization is accurate domain terminology","")
        if "optimize and defend" in ctx_lower:
            return ("C","Low","maturityLabel function — visible in score card","")
        if "Optimization area" in context:
            return ("C","Low","diagLabels prefix — visible in web diagnosis section for strategically aligned band","")
        return ("H","None","Acceptable in context","")

    if term_label == "leadership":
        if "Sales Leadership" in context or "Pricing + Sales Leadership" in context:
            if section_key == "recommendations":
                return ("F","Low","Old recommendations library — only shown when old rules fire","Consider: Pricing + Sales Management")
            return ("G","None","Frozen static or recommendations","")
        if "Market leadership" in context:
            return ("G","None","Frozen Enterprise band content — approved","")
        if section_key in ("question_model_desc","question_model_labels","question_model_subs"):
            return ("B","None","Question model — leadership as management concept in GO6 description","")
        return ("H","None","Leadership as general management concept","")

    if "Senior Leadership" in term_label:
        return ("G","None","Frozen static band content — approved to keep","")

    if "Relationship Management" in term_label:
        if section_key in ("pfi_scenarios_priorities","pfi_scenarios_execution"):
            return ("G","None","Frozen static priorities — approved","")
        if section_key == "signal_rules_owner":
            return ("I","Medium","Dynamic rule owner — should be Portfolio/Commercial Management","Check if patch applied correctly")
        if section_key in ("question_model_labels","question_model_subs"):
            return ("B","None","Question option — relationship management as concept","")
        return ("H","None","Relationship management as domain concept","")

    if term_label == "framework":
        if "shared metrics framework" in ctx_lower:
            return ("I","Low","Advisory description — check if patch to 'structure' applied","")
        if "pricing and cost visibility framework" in ctx_lower:
            return ("I","Low","Execution item — check if patch to 'model' applied","")
        return ("H","None","Framework in general usage","")

    if term_label == "institution/institutional":
        if "institutional discipline" in ctx_lower or "institutional credibility" in ctx_lower or "Scaled Institutional" in context:
            return ("G","None","Frozen Enterprise band — approved to keep","")
        if "institutional value proposition" in ctx_lower:
            return ("G","None","MR6 question option — approved to keep","")
        if "institutions that manage" in ctx_lower:
            return ("I","Medium","consulting.html — should be 'franchises'","Check if patch applied")
        if "the institution's" in ctx_lower:
            return ("H","None","MR1 question was updated to franchise's","")
        return ("H","None","Institutional as general organizational term","")

    if term_label == "organization/organizational":
        if section_key in ("question_model_desc","question_model_labels","question_model_subs"):
            return ("B","None","Question model — organization as neutral entity reference — approved to keep","")
        if "operating scalability" in ctx_lower:
            return ("H","None","Already updated","")
        if "organizational scalability" in ctx_lower:
            return ("I","Medium","Results section — check if patch applied","")
        return ("H","None","Organization as neutral entity reference","")

    if term_label == "liquidity":
        return ("H","None","Liquidity is core pillar terminology — Balance Sheet & Liquidity Contribution pillar","")

    if term_label in ("clearing","settlement","wire/wires","SWIFT","nostro","affiliate","partner bank"):
        if section_key in ("question_model_title","question_model_desc","question_model_labels","question_model_subs"):
            return ("B","Low","Question model — payment rail terminology, acceptable in questionnaire context","")
        return ("H","None","Payment infrastructure terminology — appropriate in multi-rail context","")

    if term_label == "spread":
        if "FX" in context or "corridor" in context:
            return ("H","Low","Spread in FX/corridor context — check if cleared","")
        return ("H","None","Spread as pricing concept — acceptable","")

    if term_label == "cross-border":
        if "international payment flows" in ctx_lower or "international payment flow" in ctx_lower:
            return ("H","None","Already updated to international framing — acceptable","")
        if "consulting.html" in file_name and "ACH, wires" in context:
            return ("A","Low","consulting.html copy — lists cross-border as payment type alongside ACH/wire — accurate","")
        return ("H","None","Cross-border as payment category — acceptable","")

    if term_label == "balance-adjusted":
        return ("I","High","Balance-adjusted should have been replaced — check patch","")

    if term_label == "rate cycle/rate-cycle":
        return ("H","Low","Rate cycle in treasury-payment economics context — approved to keep per earlier decision","")

    if "addressable market" in term_label:
        return ("H","None","Approved to keep","")

    if term_label in ("playbook","market entry"):
        if section_key in ("pfi_scenarios_execution","pfi_scenarios_priorities"):
            return ("G","None","Frozen static content","")
        return ("H","None","Check context","")

    if term_label == "roadmap":
        return ("H","None","Roadmap as planning term — check context for consulting drift","")

    if term_label == "producing":
        return ("F","None","Likely in internal code","")

    if term_label in ("diagnosis/diagnose","immediate priority","structural failure","fragmented","underdeveloped","absent","transformation"):
        return ("H","Low","Check context — may be acceptable domain usage","")

    return ("H","None","Check context","")

# ── Run audit ─────────────────────────────────────────────────────────────────

def get_line(text, pos):
    ls = text.rfind('\n', 0, pos) + 1
    le = text.find('\n', pos)
    if le < 0: le = len(text)
    return text[ls:le].strip()

hits = []

print("FULL SYSTEM LANGUAGE AUDIT")
print("=" * 72)

# Check models file
if not any("models:" in k for k in FILES):
    print("\n⚠  MODELS FILE NOT FOUND")
    print("   No .jsx/.tsx/.js files found in ~/Desktop/curena1206.github.io")
    print("   (excluding node_modules, bundles, minified files)")
    print("   Models site audit is INCOMPLETE.")
    print("   Action required: Confirm file path before final sign-off.\n")
else:
    mf_list = [v for k,v in FILES.items() if "models:" in k]
    print(f"\n✓  Models files found: {[os.path.basename(f) for f in mf_list]}\n")

print("=" * 72)

for file_key, fpath in FILES.items():
    if not os.path.exists(fpath):
        print(f"\n[FILE NOT FOUND] {fpath}")
        continue

    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
        raw = f.read()

    fname = os.path.basename(fpath)

    # Extract sections from pfi.html
    if fname == "pfi.html":
        pfi_sections = {}

        pfi_sections["page_html"] = (get_html_body(raw), "Page HTML")

        s, _ = get_section(raw, 'const PFI_SCENARIOS = [', '\n    function pfiGetScenario')
        pfi_sections["pfi_scenarios_all"] = (s, "PFI_SCENARIOS")

        s2, _ = get_section(raw, 'window.PPD_MODEL = (() => {', '// ── APP.JS EMBEDDED')
        pfi_sections["question_model_all"] = (s2, "PPD_MODEL / Question Model")

        s3, _ = get_section(raw, '    var SIGNAL_RULES = [', '\n    function computeSignals(')
        pfi_sections["signal_rules_all"] = (s3, "SIGNAL_RULES")

        s4, _ = get_section(raw, '    function exportPDF() {', '    // Share link')
        pfi_sections["export_pdf_all"] = (s4, "exportPDF()")

        s5, _ = get_section(raw, '    function renderObservations(', '    function renderAdvisoryBridge(')
        pfi_sections["render_obs"] = (s5, "renderObservations()")

        s6, _ = get_section(raw, '    function renderAdvisoryBridge(', '    function renderPriorities(')
        pfi_sections["render_advisory"] = (s6, "renderAdvisoryBridge()")

        s7, _ = get_section(raw, '  const SCENARIOS = [', '\n  function initApp(')
        pfi_sections["scenarios_array"] = (s7, "SCENARIOS array (scenario cards)")

        search_sections = pfi_sections
    else:
        # For other files, search the whole file
        search_sections = {file_key: (raw, fname)}

    for sect_key, (sect_text, sect_label) in search_sections.items():
        if not sect_text: continue

        for term_label, pattern in TERMS:
            for m in re.finditer(pattern, sect_text, re.IGNORECASE):
                pos = m.start()
                line = get_line(sect_text, pos)
                if not line: continue

                # Skip pure CSS/infrastructure
                if any(skip in line for skip in [
                    'var(--','font-family','border-radius','padding:','margin:',
                    'display:','color:','background:','font-size','line-height',
                    '.length','score5','score100','Math.','clamp(','\.weight',
                ]):
                    continue

                # Get context snippet
                mp = line.find(m.group())
                if mp < 0: mp = 0
                ctx_start = max(0, mp - 40)
                ctx = ('...' if ctx_start > 0 else '') + line[ctx_start:mp+100]
                if len(ctx) > 140: ctx = ctx[:140] + '...'

                cat, risk, reason, replacement = classify_risk(
                    term_label, m.group(), line, sect_key, fname)

                hits.append({
                    "term": term_label,
                    "matched": m.group(),
                    "file": fname,
                    "section": sect_label,
                    "context": ctx,
                    "full_line": line[:200],
                    "category": cat,
                    "risk": risk,
                    "reason": reason,
                    "replacement": replacement,
                })

# ── Determine visibility from category ───────────────────────────────────────

VIS_MAP = {
    "A": {"web":True,  "pdf":False,"q":False,"cond":False},
    "B": {"web":False, "pdf":False,"q":True, "cond":False},
    "C": {"web":True,  "pdf":False,"q":False,"cond":True},
    "D": {"web":False, "pdf":True, "q":False,"cond":True},
    "E": {"web":True,  "pdf":False,"q":False,"cond":True},
    "F": {"web":False, "pdf":False,"q":False,"cond":False},
    "G": {"web":True,  "pdf":True, "q":False,"cond":True},
    "H": {"web":True,  "pdf":True, "q":False,"cond":True},
    "I": {"web":True,  "pdf":True, "q":False,"cond":True},
}

# ── Deduplicate ───────────────────────────────────────────────────────────────

seen = set()
unique_hits = []
for h in hits:
    key = (h["term"], h["section"], h["full_line"][:80])
    if key not in seen:
        seen.add(key)
        unique_hits.append(h)

# ── Output report ─────────────────────────────────────────────────────────────

def print_hit(h, idx):
    v = VIS_MAP.get(h["category"], VIS_MAP["H"])
    print(f"\n  [{idx}] Term: {h['matched']}  [{h['term']}]")
    print(f"       File:            {h['file']}")
    print(f"       Source:          {h['section']}")
    print(f"       Context:         {h['context']}")
    print(f"       Web-visible:     {'yes' if v['web'] else 'no'}")
    print(f"       PDF-visible:     {'yes' if v['pdf'] else 'no'}")
    print(f"       Questionnaire:   {'yes' if v['q'] else 'no'}")
    print(f"       Conditional:     {'yes' if v['cond'] else 'no'}")
    print(f"       Frozen:          {'yes' if h['category']=='G' else 'no'}")
    print(f"       Risk:            {h['risk']}")
    print(f"       Reason:          {h['reason']}")
    if h['replacement']:
        print(f"       ➜ Replacement:   {h['replacement']}")

# Group by category
for cat_code, cat_label in [
    ("I", "REQUIRES ACTION"),
    ("A", "USER-VISIBLE — WEBSITE"),
    ("B", "USER-VISIBLE — QUESTIONNAIRE"),
    ("C", "USER-VISIBLE — WEB RESULTS (conditional)"),
    ("D", "USER-VISIBLE — PDF ONLY (conditional)"),
    ("E", "USER-VISIBLE — SPECIFIC CONDITION ONLY"),
    ("G", "FROZEN STATIC CONTENT — APPROVED"),
    ("H", "ACCEPTABLE DOMAIN LANGUAGE"),
    ("F", "INTERNAL ONLY — NOT RENDERED"),
]:
    group = [h for h in unique_hits if h["category"] == cat_code]
    if not group: continue
    print(f"\n{'='*72}")
    print(f"CATEGORY {cat_code}: {cat_label}  ({len(group)} items)")
    print(f"{'='*72}")
    for i, h in enumerate(group, 1):
        print_hit(h, i)

print(f"\n{'='*72}")
print(f"TOTAL UNIQUE HITS: {len(unique_hits)}")
print(f"  Requires action (I):    {sum(1 for h in unique_hits if h['category']=='I')}")
print(f"  Acceptable/visible:     {sum(1 for h in unique_hits if h['category'] in 'ABCDEGH')}")
print(f"  Internal only (F):      {sum(1 for h in unique_hits if h['category']=='F')}")

# ── Final confirmations ───────────────────────────────────────────────────────

print(f"\n{'='*72}")
print("FINAL CONFIRMATION CHECKS")
print(f"{'='*72}")

check_terms = {
    "correspondent in recommendations": "correspondent",
    "corridor in recommendations":      "corridor",
    "FX-specialist in recommendations": "FX strategy",
    "Trading/FX":                       "Trading/FX",
    "Network Management":               "Network Management",
    "balance-adjusted":                 "balance-adjusted",
}

pfi_raw = open(FILES["pfi.html"], 'r').read() if os.path.exists(FILES["pfi.html"]) else ""
rec_block, _ = get_section(pfi_raw, 'const recommendations = {', '// ── Rules engine')
signal_block, _ = get_section(pfi_raw, '    var SIGNAL_RULES = [', '\n    function computeSignals(')

for label, term in check_terms.items():
    in_recs    = term in rec_block
    in_signals = term in signal_block
    print(f"\n  {label}:")
    print(f"    In recommendations library: {'FOUND ⚠' if in_recs else 'CLEAR ✓'}")
    print(f"    In SIGNAL_RULES:            {'FOUND ⚠' if in_signals else 'CLEAR ✓'}")

# Band coverage confirmation
print(f"\n{'─'*72}")
print("MATURITY BAND COVERAGE:")
bands = ["FOUNDATIONAL GAPS", "DEVELOPING FRANCHISE", "OPERATIONALLY STABLE",
         "STRATEGICALLY ALIGNED", "ENTERPRISE-GRADE"]
for band in bands:
    found = band in pfi_raw
    print(f"  {band}: {'✓' if found else '✗ NOT FOUND'}")

# Signal rules coverage
print(f"\n{'─'*72}")
print("SIGNAL RULES COVERAGE:")
rule_ids = re.findall(r'id:"([^"]+)"', signal_block)
print(f"  Rules found: {len(rule_ids)}")
for rid in rule_ids:
    print(f"    ✓ {rid}")

print(f"\n{'='*72}")
print("END OF AUDIT")
print(f"{'='*72}")
