#!/usr/bin/env python3
"""
Extracts all PDF-feeding text from pfi.html using regex instead of JSON parser.
Run from carlosurena.github.io directory:
    python3 audit_pdf_text.py
"""

import re

with open('pfi.html', 'r', encoding='utf-8') as f:
    html = f.read()

start = html.find('const PFI_SCENARIOS = [')
end   = html.find('\n    function pfiGetScenario', start)
raw   = html[start + len('const PFI_SCENARIOS = '):end].strip()

def get_str(block, key):
    m = re.search(rf'{key}:\s*"((?:[^"\\]|\\.)*)"', block)
    return m.group(1) if m else ''

def get_list(block, key):
    m = re.search(rf'{key}:\s*\[(.*?)\]', block, re.DOTALL)
    if not m: return []
    return re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(1))

def get_obj_vals(block, key):
    m = re.search(rf'{key}:\s*\{{(.*?)\}}', block, re.DOTALL)
    if not m: return {}
    return dict(re.findall(r'(\w+):\s*"((?:[^"\\]|\\.)*)"', m.group(1)))

def wrap(text, width=78, indent='    '):
    words = text.split()
    lines, line = [], ''
    for w in words:
        if len(line) + len(w) + 1 > width:
            lines.append(indent + line)
            line = w
        else:
            line = (line + ' ' + w).strip()
    if line: lines.append(indent + line)
    return '\n'.join(lines)

band_blocks = re.split(r'\n\s*\{(?=\s*\n\s*range:)', raw)
band_blocks = [b for b in band_blocks if 'label:' in b]

DIV = '=' * 70

# Hardcoded
print(DIV)
print("HARDCODED PDF TEXT")
print(DIV)
scale_block = re.search(r'SCALE_COLORS=\[(.*?)\];', html, re.DOTALL)
if scale_block:
    print(f"Scale labels: {re.findall(r'label:\"([^\"]+)\"', scale_block.group(1))}")
note = re.search(r'var noteText="([^"]+)"', html)
if note: print(f"\nBottom note:\n    {note.group(1)}")
coda = re.search(r'doc\.text\("(Execution sequence[^"]+)"', html)
if coda: print(f"\nExecution coda:\n    {coda.group(1)}")

for block in band_blocks:
    label = get_str(block, 'label')
    rng   = re.search(r'range:\s*\[(\d+),\s*(\d+)\]', block)
    name  = get_str(block, 'scenario_name')
    print(f"\n{DIV}")
    print(f"BAND: {label}  ({rng.group(1) if rng else '?'}–{rng.group(2) if rng else '?'})")
    print(f"Scenario: {name}")
    print(DIV)

    print(f"\n── PAGE 1")
    print(f"\n[benchmark_insight]\n{wrap(get_str(block,'benchmark_insight'))}")
    ki = get_list(block, 'key_issues')
    print(f"\n[key_issues]")
    for item in ki: print(f"    • {item}")
    print(f"\n[immediate_focus]\n{wrap(get_str(block,'immediate_focus'))}")

    print(f"\n── PAGE 2")
    for pid, txt in get_obj_vals(block, 'pillar_commentary').items():
        print(f"\n[pillar.{pid}]\n{wrap(txt)}")
    print(f"\n[exec_diagnosis]\n{wrap(get_str(block,'exec_diagnosis'))}")
    si = get_list(block, 'structural_issues')
    print(f"\n[structural_issues]")
    for i, item in enumerate(si, 1): print(f"    {i}. {item}")

    print(f"\n── PAGE 3")
    pri_m = re.search(r'priorities:\s*\[(.*?)\],\s*\n\s*execution:', block, re.DOTALL)
    if pri_m:
        pt = pri_m.group(1)
        for i,(t,o,k,w) in enumerate(zip(
            re.findall(r'title:\s*"([^"]+)"',pt),
            re.findall(r'owner:\s*"([^"]+)"',pt),
            re.findall(r'kpi:\s*"([^"]+)"',pt),
            re.findall(r'why:\s*"([^"]+)"',pt)), 1):
            print(f"\n  Priority {i}: {t}")
            print(f"    Owner: {o}")
            print(f"    KPI:   {k}")
            print(f"    Why:   {w}")

    print(f"\n── PAGE 4")
    exec_m = re.search(r'execution:\s*\[(.*?)\],\s*\n\s*strategic_takeaway:', block, re.DOTALL)
    if exec_m:
        for period, title, items_raw in re.findall(
            r'period:\s*"([^"]+)".*?title:\s*"([^"]+)".*?items:\s*\[(.*?)\]',
            exec_m.group(1), re.DOTALL):
            print(f"\n  {period} — {title}")
            for item in re.findall(r'"([^"]+)"', items_raw):
                print(f"    • {item}")
    print(f"\n[strategic_takeaway]\n{wrap(get_str(block,'strategic_takeaway'))}")

print(f"\n{DIV}\nEND OF AUDIT\n{DIV}")
