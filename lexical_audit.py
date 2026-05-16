#!/usr/bin/env python3
"""
Full lexical audit across PFI source objects.
Run from carlosurena.github.io directory:
    python3 lexical_audit.py
"""

import re

with open('pfi.html', 'r', encoding='utf-8') as f:
    raw = f.read()

# ── Extract source blocks ─────────────────────────────────────────────────────

def extract(start_marker, end_marker):
    si = raw.find(start_marker)
    ei = raw.find(end_marker, si) if si >= 0 else -1
    if si >= 0 and ei >= 0:
        return raw[si:ei]
    return ""

# PFI_SCENARIOS block
scenarios_block = extract('const PFI_SCENARIOS = [', '\n    function pfiGetScenario')

# SIGNAL_RULES block
signal_block = extract('    var SIGNAL_RULES = [', '\n    function computeSignals(')

# Question model (PPD_MODEL)
model_block = extract('window.PPD_MODEL = (() => {', '// ── APP.JS EMBEDDED')

# Rendering templates (render functions + exportPDF)
render_block = extract('    function renderObservations(', '    // Share link')
export_block = extract('    function exportPDF() {', '    // Share link')

# Advisory paths + signal engine functions
compute_block = extract('    function computeSignals(', '\n    function renderObservations(')

BLOCKS = {
    "PFI_SCENARIOS":    scenarios_block,
    "SIGNAL_RULES":     signal_block,
    "Question model":   model_block,
    "computeSignals":   compute_block,
    "Render functions": render_block,
    "exportPDF":        export_block,
}

# ── Terms to search ───────────────────────────────────────────────────────────

TERMS = [
    r'\boptimiz(e|ed|ing|ation|ations)\b',
    r'\bmarket entry\b',
    r'\bSenior Leadership\b',
    r'Relationship Management',
    r'\bTrading.?FX\b',
    r'\bFX\b',
    r'\bcorridor\b',
    r'\bcross.border\b',
    r'\bcorrespondent\b',
    r'Network Management',
    r'\binstitution\b',
    r'balance.adjusted',
    r'balance.linked',
    r'addressable market',
    r'\bdeploy\b',
    r'\bDeploy\b',
    r'\bleadership\b',
    r'\bLeadership\b',
    r'\borganizat(ion|ional)\b',
    r'\bframework\b',
    r'\bproducing\b',
]

print("LEXICAL AUDIT — PFI CODEBASE")
print("=" * 70)

found_any = False

for term_pattern in TERMS:
    for block_name, block_text in BLOCKS.items():
        if not block_text:
            continue
        matches = list(re.finditer(term_pattern, block_text, re.IGNORECASE))
        for m in matches:
            found_any = True
            pos = m.start()
            # Get surrounding line
            line_start = block_text.rfind('\n', 0, pos) + 1
            line_end   = block_text.find('\n', pos)
            if line_end == -1: line_end = len(block_text)
            line = block_text[line_start:line_end].strip()
            if len(line) > 120:
                mp = line.find(m.group())
                start_ctx = max(0, mp - 40)
                line = ('...' if start_ctx > 0 else '') + line[start_ctx:mp + 80] + '...'
            print(f"\nTerm found: {m.group()}")
            print(f"Location:   {block_name}")
            print(f"Context:    {line}")

if not found_any:
    print("\nNo flagged terms found.")

print("\n" + "=" * 70)
print("END OF AUDIT")
