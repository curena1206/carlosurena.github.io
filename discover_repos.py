#!/usr/bin/env python3
"""
Step 1: Local repository discovery and ecosystem dependency map.
Finds all git repos under ~/Desktop that may feed carlosurena.com ecosystem.
Outputs: ecosystem_dependency_map.md
Run from anywhere:
    python3 discover_repos.py
"""

import os, re, json, glob, subprocess
from datetime import datetime

HOME    = os.path.expanduser("~")
DESKTOP = os.path.expanduser("~/Desktop")

# ── Helpers ───────────────────────────────────────────────────────────────────

def run(cmd, cwd=None):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd, timeout=8)
        return r.stdout.strip()
    except:
        return ""

def read(path):
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except:
        return ""

def exists(path):
    return os.path.exists(path)

def find_files(base, patterns, exclude=None):
    """Find files matching patterns, excluding dirs."""
    exclude = exclude or ['node_modules','.git','dist','build','.next','out',
                          '__pycache__','.cache','coverage','.vite']
    results = []
    for pattern in patterns:
        for f in glob.glob(os.path.join(base, pattern), recursive=True):
            if not any(e in f for e in exclude):
                results.append(os.path.relpath(f, base))
    return sorted(set(results))

# ── Discover all git repos ────────────────────────────────────────────────────

def find_repos(base, max_depth=5):
    repos = []
    for root, dirs, files in os.walk(base):
        depth = root.replace(base, '').count(os.sep)
        if depth > max_depth:
            dirs.clear()
            continue
        dirs[:] = [d for d in dirs if d not in
                   ['node_modules','.git','dist','build','.next','out',
                    '__pycache__','.cache','Library','Applications']]
        if '.git' in os.listdir(root) if os.path.isdir(root) else []:
            repos.append(root)
            dirs.clear()
    return repos

repos = find_repos(DESKTOP)

# ── Map each repo ─────────────────────────────────────────────────────────────

mapped = []

for path in repos:
    name = os.path.basename(path)

    # Git info
    remote   = run(['git','remote','get-url','origin'], cwd=path)
    branch   = run(['git','branch','--show-current'], cwd=path)
    last_commit = run(['git','log','-1','--format=%ci %s'], cwd=path)
    last_date   = last_commit[:10] if last_commit else "unknown"
    last_msg    = last_commit[20:80] if len(last_commit) > 20 else ""

    # Active / stale
    try:
        from datetime import date
        if last_date != "unknown":
            delta = (date.today() - date.fromisoformat(last_date)).days
            staleness = "Active (< 30d)" if delta < 30 else \
                        "Recent (< 90d)" if delta < 90 else \
                        f"Stale ({delta}d since last commit)"
        else:
            staleness = "Unknown"
    except:
        staleness = "Unknown"

    # Live URL from CNAME or GitHub Pages pattern
    cname = read(os.path.join(path, 'CNAME')).strip()
    if cname:
        live_url = f"https://{cname}"
    elif remote and 'github.io' in remote:
        m = re.search(r'github\.com[:/](\w+)/([^/\s\.]+?)(?:\.git)?$', remote)
        if m:
            user, repo_name = m.group(1), m.group(2)
            live_url = (f"https://{user}.github.io"
                        if repo_name.lower() == f"{user.lower()}.github.io"
                        else f"https://{user}.github.io/{repo_name}")
        else:
            live_url = ""
    else:
        live_url = ""

    # Package.json
    pkg_raw = read(os.path.join(path, 'package.json'))
    try:
        pkg = json.loads(pkg_raw)
    except:
        pkg = {}
    deps = {**pkg.get('dependencies',{}), **pkg.get('devDependencies',{})}

    # Framework detection
    if 'vite' in deps and 'react' in deps:
        framework = "React + Vite"
    elif 'react-scripts' in deps:
        framework = "React (CRA)"
    elif 'react' in deps:
        framework = "React"
    elif 'next' in deps:
        framework = "Next.js"
    elif 'vue' in deps:
        framework = "Vue"
    elif exists(os.path.join(path, 'index.html')) and not pkg:
        framework = "Static HTML/CSS/JS"
    elif pkg:
        framework = f"Node ({pkg.get('name','unknown')})"
    else:
        framework = "Unknown"

    # Entry files
    entry_patterns = ['index.html','consulting.html','pfi.html',
                      'src/main.jsx','src/main.tsx','src/App.jsx','src/App.tsx',
                      'src/index.js','src/pages/index.*','src/pages/Home.*']
    entry_files = find_files(path, ['**/' + p for p in entry_patterns])
    # Also check root level
    for f in ['index.html','consulting.html','pfi.html']:
        if exists(os.path.join(path, f)):
            if f not in entry_files:
                entry_files.insert(0, f)

    # Text-bearing source files (html, jsx, tsx, js, ts, md, txt, json config)
    text_patterns = ['**/*.html','**/*.jsx','**/*.tsx','**/*.md','**/*.txt']
    js_patterns   = ['**/*.js','**/*.ts']
    text_files = find_files(path, text_patterns)
    js_files   = find_files(path, js_patterns)

    # Config files
    config_patterns = ['package.json','vite.config.*','_config.yml',
                       '.github/workflows/*.yml','CNAME','tailwind.config.*',
                       'vercel.json','netlify.toml']
    config_files = find_files(path, config_patterns)

    # Build/generated dirs to ignore
    build_dirs = [d for d in ['dist','build','out','.next','.vite','public/build']
                  if exists(os.path.join(path, d))]

    # Purpose inference
    name_l = name.lower()
    remote_l = remote.lower()
    has_pfi = exists(os.path.join(path, 'pfi.html'))
    has_consulting = exists(os.path.join(path, 'consulting.html'))
    has_react_src  = exists(os.path.join(path, 'src'))
    has_jsx = bool(find_files(path, ['**/*.jsx']))

    if 'carlosurena.github.io' in name_l or cname == 'carlosurena.com':
        purpose = "PRIMARY: carlosurena.com — main site, PFI diagnostic, consulting page"
        confidence = "HIGH"
    elif 'ai-payments-portfolio' in name_l or 'payments-portfolio' in name_l:
        purpose = "PRIMARY: models.carlosurena.com — React analytics models app"
        confidence = "HIGH"
    elif has_pfi and has_consulting:
        purpose = "LIKELY: Contains PFI and consulting pages — may be staging or backup"
        confidence = "MEDIUM"
    elif 'diagnostic' in name_l:
        purpose = "LIKELY: Payments portfolio diagnostic — standalone or embedded"
        confidence = "MEDIUM"
    elif live_url and 'github.io' in live_url:
        purpose = "POSSIBLE: GitHub Pages deployment — purpose unclear"
        confidence = "LOW"
    elif has_react_src and has_jsx:
        purpose = "POSSIBLE: React app — purpose unclear"
        confidence = "LOW"
    else:
        purpose = "UNCLEAR — likely inactive or unrelated"
        confidence = "LOW"

    mapped.append({
        "name":         name,
        "path":         path,
        "remote":       remote or "(no remote set)",
        "branch":       branch or "(unknown)",
        "last_commit":  last_date,
        "last_msg":     last_msg,
        "staleness":    staleness,
        "live_url":     live_url or "(not detected)",
        "cname":        cname or "(none)",
        "framework":    framework,
        "purpose":      purpose,
        "confidence":   confidence,
        "entry_files":  entry_files[:10],
        "text_files":   text_files,
        "js_files":     js_files[:10],
        "config_files": config_files[:8],
        "build_dirs":   build_dirs,
        "pkg_name":     pkg.get('name',''),
        "pkg_version":  pkg.get('version',''),
    })

# ── Write ecosystem_dependency_map.md ─────────────────────────────────────────

OUT = os.path.join(DESKTOP, "carlosurena.github.io", "ecosystem_dependency_map.md")

lines = []
lines.append("# CarlosUrena.com — Ecosystem Dependency Map\n\n")
lines.append(f"_Generated {datetime.now().strftime('%Y-%m-%d %H:%M')} — {len(mapped)} repos discovered under ~/Desktop_\n\n")
lines.append("---\n\n")
lines.append("## Summary\n\n")
lines.append("| Repo | Live URL | Framework | Status | Confidence |\n")
lines.append("|---|---|---|---|---|\n")
for r in mapped:
    lines.append(f"| `{r['name']}` | {r['live_url']} | {r['framework']} | "
                 f"{r['staleness']} | {r['confidence']} |\n")
lines.append("\n---\n\n")

for r in mapped:
    lines.append(f"## {r['name']}\n\n")

    lines.append(f"**Purpose:** {r['purpose']}\n\n")
    lines.append(f"| Field | Value |\n|---|---|\n")
    lines.append(f"| Repo path | `{r['path']}` |\n")
    lines.append(f"| Remote URL | `{r['remote']}` |\n")
    lines.append(f"| Branch | `{r['branch']}` |\n")
    lines.append(f"| Last commit | {r['last_commit']} — _{r['last_msg']}_  |\n")
    lines.append(f"| Status | {r['staleness']} |\n")
    lines.append(f"| Live URL | {r['live_url']} |\n")
    lines.append(f"| CNAME | {r['cname']} |\n")
    lines.append(f"| Framework | {r['framework']} |\n")
    if r['pkg_name']:
        lines.append(f"| Package name | `{r['pkg_name']}` v{r['pkg_version']} |\n")
    lines.append(f"| Confidence | **{r['confidence']}** |\n")

    if r['entry_files']:
        lines.append(f"\n**Entry files:**\n")
        for f in r['entry_files']:
            lines.append(f"- `{f}`\n")

    if r['config_files']:
        lines.append(f"\n**Config files:**\n")
        for f in r['config_files']:
            lines.append(f"- `{f}`\n")

    if r['build_dirs']:
        lines.append(f"\n**Build / generated directories (exclude from audit):**\n")
        for d in r['build_dirs']:
            lines.append(f"- `{d}/`\n")

    lines.append(f"\n**Text-bearing source files ({len(r['text_files'])} HTML/JSX/MD):**\n")
    for f in r['text_files'][:20]:
        lines.append(f"- `{f}`\n")
    if len(r['text_files']) > 20:
        lines.append(f"- _...and {len(r['text_files'])-20} more — see full list in inventory step_\n")

    if r['js_files']:
        lines.append(f"\n**JS/TS source files ({len(r['js_files'])} total — first 10):**\n")
        for f in r['js_files'][:10]:
            lines.append(f"- `{f}`\n")

    lines.append(f"\n---\n\n")

with open(OUT, 'w', encoding='utf-8') as f:
    f.writelines(lines)

# ── Print summary ──────────────────────────────────────────────────────────────

print(f"ecosystem_dependency_map.md written to:\n  {OUT}\n")
print(f"{'='*60}")
print(f"REPOS DISCOVERED: {len(mapped)}\n")
for r in mapped:
    print(f"  [{r['confidence']:6s}] {r['name']}")
    print(f"           {r['live_url']}")
    print(f"           {r['framework']} | {r['staleness']}")
    print(f"           {r['purpose']}")
    print()
print(f"{'='*60}")
print("Step 1 complete. Review ecosystem_dependency_map.md before proceeding.")
