#!/usr/bin/env python3
"""
Full ecosystem discovery, dependency map, visible output inventory, and lexical audit.
Run from anywhere:
    python3 ecosystem_audit.py
Outputs:
    ecosystem_dependency_map.md
    visible_output_inventory.txt
    audit_report.txt
"""

import re, os, glob, json, subprocess

# ── PHASE 1: DISCOVER ALL GIT REPOS ──────────────────────────────────────────

HOME    = os.path.expanduser("~")
DESKTOP = os.path.expanduser("~/Desktop")

print("PHASE 1: Discovering git repositories...\n")

def find_git_repos(base, max_depth=4):
    repos = []
    for root, dirs, files in os.walk(base):
        depth = root.replace(base, '').count(os.sep)
        if depth > max_depth:
            dirs.clear()
            continue
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist',
                   'build', '.next', 'out', '__pycache__', '.cache', 'vendor']]
        if '.git' in os.listdir(root):
            repos.append(root)
            dirs.clear()
    return repos

repos = find_git_repos(DESKTOP)

def git_remote(path):
    try:
        r = subprocess.run(['git', 'remote', 'get-url', 'origin'],
                          capture_output=True, text=True, cwd=path)
        return r.stdout.strip()
    except: return ""

def read_file(path):
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except: return ""

def file_exists(path):
    return os.path.exists(path)

# ── PHASE 2: MAP EACH REPO ────────────────────────────────────────────────────

print("PHASE 2: Mapping repositories...\n")

ecosystem = []

for repo_path in repos:
    name = os.path.basename(repo_path)
    remote = git_remote(repo_path)

    # Determine live URL
    cname_path = os.path.join(repo_path, 'CNAME')
    cname = read_file(cname_path).strip() if file_exists(cname_path) else ""
    live_url = f"https://{cname}" if cname else ""

    # GitHub Pages default
    if not live_url and 'github.io' in remote:
        m = re.search(r'github\.com[:/](\w+)/([^/\s]+?)(?:\.git)?$', remote)
        if m:
            user, repo = m.group(1), m.group(2)
            live_url = f"https://{user}.github.io/{repo}" if repo != f"{user}.github.io" else f"https://{user}.github.io"

    # Framework detection
    pkg_path = os.path.join(repo_path, 'package.json')
    pkg = json.loads(read_file(pkg_path)) if file_exists(pkg_path) else {}
    deps = {**pkg.get('dependencies',{}), **pkg.get('devDependencies',{})}
    framework = ("React/Vite" if 'vite' in deps else
                 "React/CRA"  if 'react-scripts' in deps else
                 "React"      if 'react' in deps else
                 "Static HTML" if file_exists(os.path.join(repo_path,'index.html')) else
                 "Unknown")

    # Entry files
    entry_files = []
    for pattern in ['index.html','src/main.jsx','src/main.tsx','src/App.jsx',
                    'src/App.tsx','src/index.js','src/pages/*.jsx','src/pages/*.tsx']:
        matches = glob.glob(os.path.join(repo_path, pattern))
        entry_files.extend([os.path.relpath(m, repo_path) for m in matches])

    # Text source files (html, jsx, tsx, js, ts, md — excluding node_modules)
    text_sources = []
    for ext in ['**/*.html','**/*.jsx','**/*.tsx','**/*.js','**/*.ts','**/*.md']:
        for f in glob.glob(os.path.join(repo_path, ext), recursive=True):
            if 'node_modules' not in f and 'dist' not in f and 'build' not in f:
                text_sources.append(os.path.relpath(f, repo_path))

    # Config files
    config_files = []
    for cfg in ['vite.config.js','vite.config.ts','package.json','CNAME',
                '_config.yml','.github/workflows/*.yml','tailwind.config.js']:
        matches = glob.glob(os.path.join(repo_path, cfg))
        config_files.extend([os.path.relpath(m, repo_path) for m in matches])

    ecosystem.append({
        "name":        name,
        "path":        repo_path,
        "remote":      remote,
        "live_url":    live_url,
        "framework":   framework,
        "entry_files": entry_files[:8],
        "text_sources": text_sources,
        "config_files": config_files[:6],
        "pkg":         pkg,
    })
    print(f"  Found: {name}")
    print(f"    Remote: {remote}")
    print(f"    URL:    {live_url or 'unknown'}")
    print(f"    Frame:  {framework}")
    print(f"    Sources:{len(text_sources)} files")
    print()

# ── PHASE 3: Write ecosystem_dependency_map.md ───────────────────────────────

print("PHASE 3: Writing ecosystem_dependency_map.md...\n")

map_lines = [
    "# CarlosUrena.com Ecosystem Dependency Map\n",
    f"_Generated from {len(ecosystem)} repositories discovered under ~/Desktop_\n\n",
    "---\n",
]

for r in ecosystem:
    map_lines.append(f"## {r['name']}\n\n")
    map_lines.append(f"| Field | Value |\n|---|---|\n")
    map_lines.append(f"| **Remote** | `{r['remote']}` |\n")
    map_lines.append(f"| **Live URL** | {r['live_url'] or '_not determined_'} |\n")
    map_lines.append(f"| **Framework** | {r['framework']} |\n")
    map_lines.append(f"| **Status** | {'Deployed (CNAME or GitHub Pages)' if r['live_url'] else 'Status unknown — check repo'} |\n")
    map_lines.append(f"\n**Entry files:**\n")
    for f in r['entry_files']:
        map_lines.append(f"- `{f}`\n")
    map_lines.append(f"\n**Config files:**\n")
    for f in r['config_files']:
        map_lines.append(f"- `{f}`\n")
    map_lines.append(f"\n**Text source files ({len(r['text_sources'])} total):**\n")
    for f in r['text_sources'][:15]:
        map_lines.append(f"- `{f}`\n")
    if len(r['text_sources']) > 15:
        map_lines.append(f"- _...and {len(r['text_sources'])-15} more_\n")
    map_lines.append("\n---\n\n")

MAP_PATH = os.path.join(DESKTOP, "carlosurena.github.io", "ecosystem_dependency_map.md")
with open(MAP_PATH, 'w', encoding='utf-8') as f:
    f.writelines(map_lines)
print(f"  Written: {MAP_PATH}\n")

# ── PHASE 4: Extract ALL user-visible strings from ALL repos ─────────────────

print("PHASE 4: Building visible output inventory...\n")

inventory = []  # list of (repo, source_file, field, text)

def add(repo, source, field, text):
    t = re.sub(r'\s+', ' ', str(text)).strip()
    if t and len(t) >= 8 and not t.startswith('//') and not t.startswith('*'):
        inventory.append((repo, source, field, t))

def extract_js_strings(text, min_len=12):
    return [m.group(1) for m in re.finditer(r'"([^"\\]{%d,})"' % min_len, text)
            if not re.match(r'https?://|/[a-z]', m.group(1))]

def html_visible(text):
    text = re.sub(r'<script[\s\S]*?</script>', '', text, flags=re.I)
    text = re.sub(r'<style[\s\S]*?</style>', '', text, flags=re.I)
    text = re.sub(r'<!--[\s\S]*?-->', '', text)
    return [m.group(1).strip() for m in re.finditer(r'>([^<]{10,})<', text)
            if m.group(1).strip()]

def section(html, start, end):
    si = html.find(start)
    ei = html.find(end, si) if si >= 0 else -1
    return html[si:ei] if si >= 0 and ei >= 0 else ""

# ── Process each repo ─────────────────────────────────────────────────────────

for r in ecosystem:
    rname = r['name']
    rpath = r['path']

    for src_rel in r['text_sources']:
        src_path = os.path.join(rpath, src_rel)
        raw = read_file(src_path)
        if not raw or len(raw) < 100: continue

        # For main carlosurena.github.io, do deep extraction
        if 'carlosurena.github.io' in rpath and src_rel.endswith('.html'):

            # HTML visible text
            for t in html_visible(raw):
                add(rname, src_rel, "html.visible", t)

            # PFI_SCENARIOS
            sc = section(raw, 'const PFI_SCENARIOS = [', '\n    function pfiGetScenario')
            if sc:
                for field in ['scenario_name','benchmark_insight','exec_diagnosis','strategic_takeaway']:
                    for m in re.finditer(r'%s:\s*"([^"]+)"' % field, sc):
                        add(rname, src_rel, f"PFI_SCENARIOS.{field}", m.group(1))
                for field in ['key_issues','structural_issues','immediate_focus']:
                    for m in re.finditer(r'%s:\s*\[([^\]]+)\]' % field, sc, re.DOTALL):
                        for s in re.finditer(r'"([^"]{10,})"', m.group(1)):
                            add(rname, src_rel, f"PFI_SCENARIOS.{field}", s.group(1))
                for m in re.finditer(r'pillar_commentary:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}', sc, re.DOTALL):
                    for s in re.finditer(r'"([^"]{15,})"', m.group(1)):
                        add(rname, src_rel, "PFI_SCENARIOS.pillar_commentary", s.group(1))
                for block_m in re.finditer(r'priorities:\s*\[([\s\S]*?)\],\s*execution:', sc):
                    for field in ['title','owner','kpi','why']:
                        for s in re.finditer(r'%s:\s*"([^"]{8,})"' % field, block_m.group(1)):
                            add(rname, src_rel, f"PFI_SCENARIOS.priorities.{field}", s.group(1))
                for block_m in re.finditer(r'execution:\s*\[([\s\S]*?)\],\s*strategic_takeaway:', sc):
                    for s in re.finditer(r'"([^"]{6,})"', block_m.group(1)):
                        add(rname, src_rel, "PFI_SCENARIOS.execution", s.group(1))

            # SIGNAL_RULES
            sig = section(raw, '    var SIGNAL_RULES = [', '\n    function computeSignals(')
            if sig:
                for m in re.finditer(r'pattern_flag:"([^"]+)"', sig):
                    add(rname, src_rel, "SIGNAL_RULES.pattern_flag", m.group(1))
                for tier in ['priority_low','priority_mid','priority_high','priority']:
                    for m in re.finditer(r'%s:\{([^}]+(?:\{[^}]*\}[^}]*)*)\}' % tier, sig):
                        for field in ['title','owner','kpi','why']:
                            for s in re.finditer(r'%s:"([^"]{8,})"' % field, m.group(1)):
                                add(rname, src_rel, f"SIGNAL_RULES.{tier}.{field}", s.group(1))
                for m in re.finditer(r'advisory_path:\{label:"([^"]+)",description:"([^"]+)"\}', sig):
                    add(rname, src_rel, "SIGNAL_RULES.advisory.label",       m.group(1))
                    add(rname, src_rel, "SIGNAL_RULES.advisory.description", m.group(2))

            # PPD_MODEL
            mdl = section(raw, 'window.PPD_MODEL = (() => {', '// ── APP.JS EMBEDDED')
            if mdl:
                for field in ['title','desc']:
                    for m in re.finditer(r'%s:\s*"([^"]{8,})"' % field, mdl):
                        add(rname, src_rel, f"Question.{field}", m.group(1))
                for field in ['label','sub']:
                    for m in re.finditer(r'%s:\s*"([^"]{8,})"' % field, mdl):
                        add(rname, src_rel, f"Question.option.{field}", m.group(1))
                for m in re.finditer(r'R\d+:\s*\{[^}]+\}', mdl, re.DOTALL):
                    blk = m.group(0)
                    for field in ['title','owner','metric','why']:
                        for s in re.finditer(r'%s:\s*"([^"]{8,})"' % field, blk):
                            add(rname, src_rel, f"Recommendations.{field}", s.group(1))
                for m in re.finditer(r'diagnosis:\s*"([^"]+)"', mdl):
                    add(rname, src_rel, "OldRules.diagnosis", m.group(1))

            # exportPDF hardcoded
            pdf = section(raw, '    function exportPDF() {', '    // Share link')
            if pdf:
                for m in re.finditer(r'doc\.text\(\s*["\']([^"\']{4,})["\']', pdf):
                    add(rname, src_rel, "exportPDF.text", m.group(1))
                for m in re.finditer(r'"([A-Z][A-Z &/\-]{5,})"', pdf):
                    add(rname, src_rel, "exportPDF.label", m.group(1))

            # Scenario cards
            sc_arr = section(raw, '  const SCENARIOS = [', '\n  function initApp(')
            if sc_arr:
                for field in ['label','description','tag']:
                    for m in re.finditer(r'%s:\s*"([^"]{8,})"' % field, sc_arr):
                        add(rname, src_rel, f"ScenarioCards.{field}", m.group(1))

            # Render functions
            render = section(raw, '    function computeAndShow(', '    function exportPDF(')
            if render:
                for m in re.finditer(r'(?:label|prefix):\s*"([^"]{4,})"', render):
                    add(rname, src_rel, "RenderFn.label", m.group(1))
                for m in re.finditer(r'return\s*"([^"]{8,})"', render):
                    add(rname, src_rel, "RenderFn.maturity_label", m.group(1))

        else:
            # Generic extraction for all other files
            # HTML visible text
            if src_rel.endswith('.html'):
                for t in html_visible(raw):
                    add(rname, src_rel, "html.visible", t)

            # JSX/TSX/JS — extract string literals in content context
            if src_rel.endswith(('.jsx','.tsx','.js','.ts')):
                SKIP_LINE = ['import ','export ','className=','style={{',
                             'color:','padding:','margin:','//','*']
                for line in raw.split('\n'):
                    ls = line.strip()
                    if any(ls.startswith(s) for s in SKIP_LINE): continue
                    for m in re.finditer(r'["\']([^"\']{12,})["\']', line):
                        val = m.group(1)
                        if re.match(r'https?://|/[a-z/]|\.[a-z]{2,4}$', val): continue
                        add(rname, src_rel, "jsx.string", val)

# ── Deduplicate inventory ─────────────────────────────────────────────────────

seen_inv = set()
unique_inv = []
for repo, source, field, text in inventory:
    key = text[:100]
    if key not in seen_inv:
        seen_inv.add(key)
        unique_inv.append((repo, source, field, text))

INV_PATH = os.path.join(DESKTOP, "carlosurena.github.io", "visible_output_inventory.txt")
with open(INV_PATH, 'w', encoding='utf-8') as f:
    f.write(f"VISIBLE OUTPUT INVENTORY — {len(unique_inv)} unique strings\n")
    f.write(f"Repos covered: {len(ecosystem)}\n")
    f.write("=" * 80 + "\n")
    f.write("Format: [REPO] | [SOURCE FILE] | [FIELD] | TEXT\n")
    f.write("=" * 80 + "\n\n")
    for repo, source, field, text in unique_inv:
        f.write(f"[{repo}] | [{source}] | [{field}] | {text}\n")
print(f"  Inventory written: {INV_PATH}")
print(f"  Total unique strings: {len(unique_inv)}\n")

# ── PHASE 5: LEXICAL AUDIT against inventory ──────────────────────────────────

print("PHASE 5: Running lexical audit...\n")

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

SOURCE_VIS = {
    "PFI_SCENARIOS":     "Web+PDF after diagnostic (conditional)",
    "SIGNAL_RULES":      "Web+PDF when rule fires (conditional)",
    "Question":          "Questionnaire — during assessment",
    "Recommendations":   "Web when old rules fire (conditional)",
    "OldRules":          "Web when old rules fire (conditional)",
    "RenderFn":          "Web+PDF results section (conditional)",
    "exportPDF":         "PDF export only (conditional)",
    "html":              "Website — always visible",
    "ScenarioCards":     "Website — always visible",
    "jsx":               "models.carlosurena.com — always visible",
}

def get_vis(field):
    prefix = field.split('.')[0]
    return SOURCE_VIS.get(prefix, "Unknown — verify")

def classify(term_label, text, field, repo):
    t  = term_label.lower()
    tx = text.lower()
    src = field.split('.')[0]
    # Approved keeps
    if "addressable market" in t:     return ("None","Approved to keep")
    if "immediate priority" in t:     return ("None","Diagnostic output label — acceptable")
    if "fragmented" in t:             return ("None","Diagnostic descriptor — acceptable")
    if "underdeveloped" in t:         return ("None","Diagnostic descriptor — acceptable")
    # FX
    if "trading" in t and "fx" in t:  return ("High","Trading/FX desk language — verify cleared")
    if "fx" in t and any(x in tx for x in ["fee, fx","revenue mix","fx-related activity","fx is ad-hoc"]):
        return ("None","FX as revenue category (RA1) or scenario — acceptable")
    if "fx" in t:                     return ("Low","FX reference — verify not specialist framing")
    # Corridor / Correspondent
    if "corridor" in t:               return ("High","Corridor term — verify all instances patched")
    if "correspondent" in t:          return ("High","Correspondent banking term — verify cleared")
    # Structural
    if "network management" in t:     return ("High","Functional title — verify signal rules patched")
    if "balance-adjusted" in t:       return ("High","Should be balance-inclusive — verify patch")
    if "balance-linked" in t:         return ("High","Should be treasury-inclusive — verify patch")
    # Frozen/approved
    if "senior leadership" in t:      return ("None","Frozen static band content — approved")
    if "institution" in t and any(x in tx for x in ["scaled institutional","institutional discipline","institutional credibility","institutional value"]):
        return ("None","Frozen Enterprise band — approved")
    if "institution" in t:            return ("Low","Institution reference — verify context")
    if "relationship management" in t and src in ("PFI_SCENARIOS","Question"):
        return ("None","Static/question model domain concept — approved")
    if "relationship management" in t: return ("Low","Verify not in dynamic signal rules owner fields")
    # Cross-border
    if "cross-border" in t and any(x in tx for x in ["international payment","not part of","ach, wires"]):
        return ("None","Already normalized or accurate enumeration — acceptable")
    if "cross-border" in t:           return ("Low","Cross-border — verify framing is international")
    # Optimize
    if "optimization" in t and any(x in tx for x in ["rail routing","routing optimization rate"]):
        return ("Low","Rail routing context — acceptable domain language")
    if "optimization" in t and src == "PFI_SCENARIOS":
        return ("None","Frozen static content — approved")
    if "optimization" in t and any(x in tx for x in ["optimized","optimizing for scale","optimize returns","optimization area"]):
        return ("None","Frozen static or system label — approved")
    if "optimization" in t:           return ("Low","Optimize — check context")
    # Deploy
    if "deploy" in t and any(x in tx for x in ["capability is","fully deployed","is deployed"]):
        return ("None","Descriptive/passive — approved")
    if "deploy" in t:                 return ("Low","Deploy — check if action phrase")
    # Framework
    if "framework" in t and "shared metrics framework" in tx: return ("Low","Check if patched to structure")
    if "framework" in t and "pricing and cost" in tx:         return ("Low","Check if patched to model")
    if "framework" in t:              return ("Low","Framework — check context")
    # Market entry
    if "market entry" in t:           return ("Low","Check if patched to defined approach")
    # Roadmap
    if "roadmap" in t and "technology roadmap" in tx: return ("None","Technology planning — acceptable")
    if "roadmap" in t:                return ("Low","Planning language — check context")

    return ("Low","Check context")

audit_hits = []
for repo, source, field, text in unique_inv:
    for term_label, pattern in AUDIT_TERMS:
        if re.search(pattern, text, re.IGNORECASE):
            risk, action = classify(term_label, text, field, repo)
            audit_hits.append({
                "term":    term_label,
                "text":    text[:150],
                "repo":    repo,
                "source":  source,
                "field":   field,
                "visible": get_vis(field),
                "risk":    risk,
                "action":  action,
            })

# Deduplicate audit hits
seen_audit = set()
unique_hits = []
for h in audit_hits:
    key = (h['term'], h['text'][:80])
    if key not in seen_audit:
        seen_audit.add(key)
        unique_hits.append(h)

# Write audit report
AUDIT_PATH = os.path.join(DESKTOP, "carlosurena.github.io", "audit_report.txt")
lines = ["LEXICAL AUDIT REPORT\n", "=" * 80 + "\n",
         f"Inventory: {len(unique_inv)} strings | Hits: {len(unique_hits)}\n",
         f"High: {sum(1 for h in unique_hits if h['risk']=='High')} | "
         f"Low: {sum(1 for h in unique_hits if h['risk']=='Low')} | "
         f"None: {sum(1 for h in unique_hits if h['risk']=='None')}\n\n"]

for risk_level, label in [("High","HIGH RISK"),("Low","LOW RISK / MONITOR"),("None","ACCEPTABLE")]:
    group = [h for h in unique_hits if h['risk'] == risk_level]
    if not group: continue
    lines.append(f"\n{'─'*80}\n{label}  ({len(group)} items)\n{'─'*80}\n")
    for h in group:
        lines.append(f"\n  Term:           {h['term']}\n")
        lines.append(f"  Rendered text:  {h['text']}\n")
        lines.append(f"  Source object:  {h['repo']} → {h['source']} → {h['field']}\n")
        lines.append(f"  Visible where:  {h['visible']}\n")
        lines.append(f"  Risk:           {h['risk']}\n")
        lines.append(f"  Action:         {h['action']}\n")

with open(AUDIT_PATH, 'w', encoding='utf-8') as f:
    f.writelines(lines)

# Print summary to stdout
print("=" * 80)
print("AUDIT SUMMARY")
print("=" * 80)
print(f"Repos discovered:     {len(ecosystem)}")
print(f"Unique strings:       {len(unique_inv)}")
print(f"Total audit hits:     {len(unique_hits)}")
print(f"  High risk:          {sum(1 for h in unique_hits if h['risk']=='High')}")
print(f"  Low risk/monitor:   {sum(1 for h in unique_hits if h['risk']=='Low')}")
print(f"  Acceptable/none:    {sum(1 for h in unique_hits if h['risk']=='None')}")
print()
print("HIGH RISK ITEMS:")
for h in unique_hits:
    if h['risk'] == 'High':
        print(f"  [{h['repo']}] {h['term']}: {h['text'][:80]}")
print()
print(f"Files written:")
print(f"  {MAP_PATH}")
print(f"  {INV_PATH}")
print(f"  {AUDIT_PATH}")
