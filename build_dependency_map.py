#!/usr/bin/env python3
"""
Builds confirmed ecosystem_dependency_map.md.
Traces all files feeding models.carlosurena.com (imports, routes, constants).
Run from anywhere:
    python3 build_dependency_map.py
"""

import os, re, json, subprocess, glob
from datetime import datetime, date

def run(cmd, cwd=None):
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd, timeout=8)
        return r.stdout.strip()
    except: return ""

def read(path):
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except: return ""

def find_files(base, patterns, exclude=None):
    exclude = exclude or ['node_modules','.git','dist','build','.next','out',
                          '__pycache__','.cache','.vite']
    results = []
    for pattern in patterns:
        for f in glob.glob(os.path.join(base, pattern), recursive=True):
            if not any(e in f for e in exclude):
                results.append(os.path.relpath(f, base))
    return sorted(set(results))

DESKTOP = os.path.expanduser("~/Desktop")

ACTIVE_REPOS = {
    "carlosurena.github.io": {
        "path":    os.path.join(DESKTOP, "carlosurena.github.io"),
        "remote":  "https://github.com/curena1206/carlosurena.github.io",
        "live_url":"https://carlosurena.com",
        "purpose": "Main site — carlosurena.com, consulting page, PFI diagnostic tool",
        "framework":"Static HTML/CSS/JS",
        "status":  "ACTIVE — included in inventory",
    },
    "ai-payments-portfolio": {
        "path":    os.path.join(DESKTOP, "Payments project", "ai-payments-portfolio"),
        "remote":  "https://github.com/curena1206/ai-payments-portfolio",
        "live_url":"https://models.carlosurena.com",
        "purpose": "Models site — models.carlosurena.com React analytics app",
        "framework":"React + Vite",
        "status":  "ACTIVE — included in inventory",
    },
}

EXCLUDED_REPOS = {
    "carlosurena.github.io (stale clone)": {
        "path":   os.path.join(DESKTOP, "Payments project", "carlosurena.github.io"),
        "remote": "https://github.com/curena1206/carlosurena.github.io",
        "reason": "Stale duplicate clone — last commit 2026-04-08, 37 days behind active copy. Same remote as active. Excluded.",
    },
}

UNKNOWN_REPOS = {
    "carlosurena.com": {
        "github_url": "https://github.com/curena1206/carlosurena.com",
        "local_path": "NOT FOUND LOCALLY",
        "status": "Unknown — not cloned locally. May be a mirror, redirect, or inactive repo. Awaiting confirmation.",
    },
    "-payments-portfolio-diagnostic-": {
        "github_url": "https://github.com/curena1206/-payments-portfolio-diagnostic-",
        "local_path": "NOT FOUND LOCALLY",
        "status": "Unknown — not cloned locally. May be an earlier PFI version now superseded by pfi.html in carlosurena.github.io. Awaiting confirmation.",
    },
}

# ── Map carlosurena.github.io ─────────────────────────────────────────────────

main_path = ACTIVE_REPOS["carlosurena.github.io"]["path"]
main_last  = run(['git','log','-1','--format=%ci — %s'], cwd=main_path)

main_html  = find_files(main_path, ['*.html'])
main_js    = find_files(main_path, ['*.js'], exclude=['node_modules'])
main_css   = find_files(main_path, ['*.css'], exclude=['node_modules'])

# Key source objects inside pfi.html
pfi_raw = read(os.path.join(main_path, 'pfi.html'))
pfi_objects = []
for obj in ['PFI_SCENARIOS','SIGNAL_RULES','window.PPD_MODEL','const SCENARIOS',
            'function exportPDF','function computeAndShow','function renderPriorities',
            'function renderObservations','function renderAdvisoryBridge']:
    if obj in pfi_raw:
        pfi_objects.append(obj)

# ── Map ai-payments-portfolio — deep file trace ────────────────────────────────

models_path = ACTIVE_REPOS["ai-payments-portfolio"]["path"]
models_last = run(['git','log','-1','--format=%ci — %s'], cwd=models_path)

# All source files
models_src  = find_files(models_path, ['src/**/*.jsx','src/**/*.tsx',
                                        'src/**/*.js','src/**/*.ts'])
models_html = find_files(models_path, ['*.html','public/*.html'])

# Entry point
entry_files = []
for f in ['index.html','src/main.jsx','src/main.tsx','src/App.jsx','src/App.tsx']:
    if os.path.exists(os.path.join(models_path, f)):
        entry_files.append(f)

# Route file
router_files = []
for f in find_files(models_path, ['src/**/*.jsx','src/**/*.tsx','src/**/*.js']):
    content = read(os.path.join(models_path, f))
    if any(x in content for x in ['<Route','createBrowserRouter','useNavigate',
                                    'BrowserRouter','Routes']):
        router_files.append(f)

# FrameworkIndex.jsx — find all imports
framework_path = os.path.join(models_path, 'src', 'pages', 'FrameworkIndex.jsx')
framework_raw  = read(framework_path)
framework_imports = re.findall(r"import\s+.*?from\s+['\"]([^'\"]+)['\"]", framework_raw)
framework_local   = [i for i in framework_imports if i.startswith('.')]

# Model03_CorridorAnalyzer.jsx
corridor_path = os.path.join(models_path, 'src', 'pages', 'Model03_CorridorAnalyzer.jsx')
corridor_raw  = read(corridor_path)
corridor_exists = os.path.exists(corridor_path)
corridor_imports = re.findall(r"import\s+.*?from\s+['\"]([^'\"]+)['\"]", corridor_raw) if corridor_exists else []
corridor_local   = [i for i in corridor_imports if i.startswith('.')]
corridor_size    = len(corridor_raw) if corridor_raw else 0

# Find all page files
pages_dir = os.path.join(models_path, 'src', 'pages')
page_files = []
if os.path.exists(pages_dir):
    page_files = sorted([f for f in os.listdir(pages_dir)
                         if not f.startswith('.') and not f.endswith('.backup')])

# Find constants / data files
data_files = []
for pattern in ['src/**/*constant*','src/**/*data*','src/**/*config*',
                'src/**/*model*','src/**/*route*']:
    data_files.extend(find_files(models_path, [pattern]))
data_files = [f for f in data_files if not f.endswith(('.css','.map'))]

# Components imported by FrameworkIndex or Corridor
all_local_imports = set(framework_local + corridor_local)
resolved_components = []
for imp in all_local_imports:
    # Resolve relative to src/pages/
    for ext in ['.jsx','.tsx','.js','.ts','']:
        candidate = os.path.normpath(
            os.path.join(models_path, 'src', 'pages', imp.lstrip('./') + ext))
        if os.path.exists(candidate):
            resolved_components.append(os.path.relpath(candidate, models_path))
            break
        # Try from src/
        candidate2 = os.path.normpath(
            os.path.join(models_path, 'src', imp.lstrip('./') + ext))
        if os.path.exists(candidate2):
            resolved_components.append(os.path.relpath(candidate2, models_path))
            break

# Vite config
vite_cfg = read(os.path.join(models_path, 'vite.config.js')) or \
           read(os.path.join(models_path, 'vite.config.ts'))

# Package.json scripts
pkg = {}
try:
    pkg = json.loads(read(os.path.join(models_path, 'package.json')))
except: pass
scripts = pkg.get('scripts', {})
homepage = pkg.get('homepage', '')

# ── Write ecosystem_dependency_map.md ─────────────────────────────────────────

OUT = os.path.join(DESKTOP, "carlosurena.github.io", "ecosystem_dependency_map.md")

L = []
A = L.append

A("# CarlosUrena.com — Ecosystem Dependency Map\n\n")
A(f"_Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M')}_\n\n")
A("---\n\n")

# Summary table
A("## Coverage Status\n\n")
A("| Repo | Live URL | Status | Included |\n|---|---|---|---|\n")
for name, r in ACTIVE_REPOS.items():
    A(f"| `{name}` | {r['live_url']} | Active | ✅ Yes |\n")
for name, r in EXCLUDED_REPOS.items():
    A(f"| `{name}` | — | Stale duplicate | ❌ Excluded |\n")
for name, r in UNKNOWN_REPOS.items():
    A(f"| `{name}` | unknown | Not found locally | ⏳ Pending confirmation |\n")
A("\n---\n\n")

# Unresolved questions
A("## ⚠ Unresolved Coverage Questions\n\n")
A("The following GitHub repos were referenced but not found locally.\n")
A("Language audit is blocked on these until confirmed.\n\n")
for name, r in UNKNOWN_REPOS.items():
    A(f"### {name}\n\n")
    A(f"- GitHub URL: `{r['github_url']}`\n")
    A(f"- Local: {r['local_path']}\n")
    A(f"- Status: {r['status']}\n\n")
A("---\n\n")

# Repo 1: carlosurena.github.io
A("## ✅ carlosurena.github.io — ACTIVE\n\n")
A(f"**Purpose:** {ACTIVE_REPOS['carlosurena.github.io']['purpose']}\n\n")
A(f"| Field | Value |\n|---|---|\n")
A(f"| Local path | `{main_path}` |\n")
A(f"| Remote | `{ACTIVE_REPOS['carlosurena.github.io']['remote']}` |\n")
A(f"| Live URL | {ACTIVE_REPOS['carlosurena.github.io']['live_url']} |\n")
A(f"| Framework | {ACTIVE_REPOS['carlosurena.github.io']['framework']} |\n")
A(f"| Last commit | {main_last} |\n")
A(f"| Branch | {run(['git','branch','--show-current'], cwd=main_path)} |\n\n")

A("**Entry / source files:**\n")
for f in main_html:
    A(f"- `{f}`\n")
A("\n**Embedded source objects in pfi.html:**\n")
for obj in pfi_objects:
    A(f"- `{obj}`\n")
A("\n**Supporting JS/CSS:**\n")
for f in main_js + main_css:
    A(f"- `{f}`\n")
A("\n**Build/generated dirs to exclude:** none (static site, no build step)\n")
A("\n---\n\n")

# Repo 2: ai-payments-portfolio
A("## ✅ ai-payments-portfolio — ACTIVE\n\n")
A(f"**Purpose:** {ACTIVE_REPOS['ai-payments-portfolio']['purpose']}\n\n")
A(f"| Field | Value |\n|---|---|\n")
A(f"| Local path | `{models_path}` |\n")
A(f"| Remote | `{ACTIVE_REPOS['ai-payments-portfolio']['remote']}` |\n")
A(f"| Live URL | {ACTIVE_REPOS['ai-payments-portfolio']['live_url']} |\n")
A(f"| Framework | {ACTIVE_REPOS['ai-payments-portfolio']['framework']} |\n")
A(f"| Last commit | {models_last} |\n")
A(f"| Branch | {run(['git','branch','--show-current'], cwd=models_path)} |\n")
if homepage:
    A(f"| Homepage (package.json) | {homepage} |\n")
A("\n")

A("**Entry files:**\n")
for f in entry_files:
    A(f"- `{f}`\n")

A("\n**Router / navigation files:**\n")
for f in sorted(set(router_files)):
    A(f"- `{f}`\n")

A("\n**All page files (src/pages/):**\n")
for f in page_files:
    flag = ""
    if 'FrameworkIndex' in f: flag = " ← **PRIMARY — model index + routing**"
    if 'Corridor' in f or 'corridor' in f: flag = " ← **INCLUDES CORRIDOR CONTENT**"
    A(f"- `{f}`{flag}\n")

A("\n**FrameworkIndex.jsx — local imports:**\n")
for imp in framework_local:
    A(f"- `{imp}`\n")
if resolved_components:
    A("\n**Resolved component paths:**\n")
    for f in sorted(set(resolved_components)):
        A(f"- `{f}`\n")

A(f"\n**Model03_CorridorAnalyzer.jsx:**\n")
A(f"- Exists: {'Yes' if corridor_exists else 'NO — FILE NOT FOUND'}\n")
A(f"- Size: {corridor_size:,} chars\n")
if corridor_local:
    A("- Local imports:\n")
    for imp in corridor_local:
        A(f"  - `{imp}`\n")

A("\n**Data / constants / config files:**\n")
for f in data_files:
    A(f"- `{f}`\n")

A("\n**Build/generated dirs to exclude from inventory:**\n")
for d in ['dist/','build/','.vite/','node_modules/']:
    full = os.path.join(models_path, d.rstrip('/'))
    if os.path.exists(full):
        A(f"- `{d}`\n")

if vite_cfg:
    A(f"\n**vite.config:**\n```\n{vite_cfg[:400]}\n```\n")

if scripts:
    A(f"\n**Build/deploy scripts:**\n")
    for k,v in scripts.items():
        A(f"- `{k}`: `{v}`\n")

A("\n---\n\n")

# Excluded
A("## ❌ Excluded — Stale Clone\n\n")
for name, r in EXCLUDED_REPOS.items():
    A(f"### {name}\n\n")
    A(f"- Path: `{r['path']}`\n")
    A(f"- Remote: `{r['remote']}`\n")
    A(f"- Reason: {r['reason']}\n\n")

A("---\n\n")
A("## Next Steps\n\n")
A("- [ ] Carlos to confirm status of `carlosurena.com` GitHub repo\n")
A("- [ ] Carlos to confirm status of `-payments-portfolio-diagnostic-` GitHub repo\n")
A("- [ ] After confirmation → proceed to Step 2: Build visible_output_inventory.txt\n")
A("- [ ] After inventory approved → Step 3: Lexical audit\n")
A("- [ ] Do not patch language until audit is approved\n")

with open(OUT, 'w', encoding='utf-8') as f:
    f.writelines(L)

print(f"ecosystem_dependency_map.md written: {OUT}\n")
print("=" * 60)
print("ACTIVE REPOS CONFIRMED:")
print(f"  [1] carlosurena.github.io — {main_last[:40]}")
print(f"      Entry: {main_html}")
print(f"      PFI source objects: {len(pfi_objects)}")
print()
print(f"  [2] ai-payments-portfolio — {models_last[:40]}")
print(f"      Entry: {entry_files}")
print(f"      Pages: {page_files}")
print(f"      FrameworkIndex.jsx local imports: {framework_local}")
print(f"      Model03_CorridorAnalyzer.jsx: {'FOUND' if corridor_exists else 'NOT FOUND'} ({corridor_size:,} chars)")
print(f"      Corridor local imports: {corridor_local}")
print(f"      Router files: {router_files}")
print()
print("EXCLUDED:")
for name in EXCLUDED_REPOS:
    print(f"  {name}")
print()
print("PENDING CONFIRMATION:")
for name in UNKNOWN_REPOS:
    print(f"  {name} — not found locally")
print()
print("=" * 60)
print("Awaiting repo confirmation before Step 2.")
