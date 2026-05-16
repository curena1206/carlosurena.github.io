# CarlosUrena.com — Ecosystem Dependency Map

_Last updated: 2026-05-15 — manually verified from local repo inspection_

---

## Coverage Status

| Repo | Live URL | Local Path | Status | Included |
|---|---|---|---|---|
| `carlosurena.github.io` | https://carlosurena.com | `~/Desktop/carlosurena.github.io` | Active | ✅ Yes |
| `ai-payments-portfolio` | https://models.carlosurena.com | `~/Desktop/Payments project/ai-payments-portfolio` | Active | ✅ Yes |
| `carlosurena.github.io` (stale clone) | — | `~/Desktop/Payments project/carlosurena.github.io` | Stale duplicate | ❌ Excluded |
| `carlosurena.com` | unknown | Not found locally | Unknown | ⏳ Pending |
| `-payments-portfolio-diagnostic-` | unknown | Not found locally | Unknown | ⏳ Pending |

---

## ⚠ Unresolved Coverage Questions

Language audit is blocked on these until confirmed.

### carlosurena.com
- GitHub: `https://github.com/curena1206/carlosurena.com`
- Local: NOT FOUND — not cloned on this machine
- Status: Unknown. May be a redirect, mirror, or inactive predecessor to `carlosurena.github.io`. Needs confirmation.

### -payments-portfolio-diagnostic-
- GitHub: `https://github.com/curena1206/-payments-portfolio-diagnostic-`
- Local: NOT FOUND — not cloned on this machine
- Status: Unknown. May be an earlier standalone PFI version, now superseded by `pfi.html` in `carlosurena.github.io`. Needs confirmation.

---

## ✅ REPO 1 — carlosurena.github.io

**Purpose:** Main site — carlosurena.com, consulting page, PFI diagnostic tool, playbooks page

| Field | Value |
|---|---|
| Local path | ~/Desktop/carlosurena.github.io |
| Remote | https://github.com/curena1206/carlosurena.github.io |
| Live URL | https://carlosurena.com |
| Framework | Static HTML / CSS / JS (no build step) |
| Last commit | 2026-05-15 — PFI final lexical reconciliation |
| Branch | main |
| CNAME | carlosurena.com |

**Source files — all user-visible:**

| File | Purpose | Audit status |
|---|---|---|
| `index.html` | Home page | Previously audited |
| `consulting.html` | Consulting + diagnostic intro | Previously audited |
| `pfi.html` | PFI diagnostic tool — full engine | Previously audited |
| `playbooks.html` | Playbooks page | NOT YET AUDITED |

**Embedded source objects inside pfi.html:**

| Object | Type | Feeds |
|---|---|---|
| `PFI_SCENARIOS` | JS array — 5 maturity bands | Web results + PDF |
| `SIGNAL_RULES` | JS array — 18 rules, 3 priority tiers | Web results + PDF (conditional) |
| `window.PPD_MODEL` | JS object — questions, recommendations, old rules | Questionnaire + web diagnosis |
| `const SCENARIOS` | JS array — scenario cards | Website always visible |
| `function exportPDF` | PDF generator | PDF export |
| `function computeAndShow` | Results renderer | Web results |
| `function renderPriorities` | Priority display | Web results + PDF |
| `function renderObservations` | Signal observations | Web results + PDF |
| `function renderAdvisoryBridge` | Advisory display | Web results + PDF |

**Build / generated dirs:** None — static site, no build step.

---

## ✅ REPO 2 — ai-payments-portfolio

**Purpose:** Models site — models.carlosurena.com — React analytics app with 6 payment models

| Field | Value |
|---|---|
| Local path | ~/Desktop/Payments project/ai-payments-portfolio |
| Remote | https://github.com/curena1206/ai-payments-portfolio |
| Live URL | https://models.carlosurena.com |
| Framework | React + Vite |
| Last commit | 2026-04-16 — Update Model03_CorridorAnalyzer.jsx |
| Branch | main |

**Entry and routing:**

| File | Purpose |
|---|---|
| `index.html` | HTML shell |
| `src/main.jsx` | React entry point + router |

**Page files (src/pages/):**

| File | Purpose |
|---|---|
| `src/pages/FrameworkIndex.jsx` | PRIMARY — model index, routing table, all model descriptions, group labels |
| `src/pages/FrameworkIndex.jsx.backup` | Backup — exclude from inventory |

**Model files (src/models/) — all 6, all user-visible:**

| File | Positioning risk |
|---|---|
| `src/models/Model01_ProfitabilityEngine.jsx` | Not yet audited |
| `src/models/Model02_RailOptimizer.jsx` | Not yet audited |
| `src/models/Model03_CorridorAnalyzer.jsx` | Contains corridor language — not yet patched |
| `src/models/Model04_ClientBehavior.jsx` | Not yet audited |
| `src/models/Model05_PortfolioScorecard.jsx` | Not yet audited |
| `src/models/Model06_MoneyMovement.jsx` | Not yet audited |

**Build / generated dirs to exclude:** dist/, node_modules/

---

## ❌ EXCLUDED — Stale Clone

**carlosurena.github.io (Payments project copy)**
- Path: ~/Desktop/Payments project/carlosurena.github.io
- Remote: https://github.com/curena1206/carlosurena.github.io (same remote as active)
- Last commit: 2026-04-08 — 37 days behind active copy
- Reason: Duplicate local clone. Active working copy is ~/Desktop/carlosurena.github.io. Excluded from inventory — would produce duplicate and outdated strings.

---

## Proposed Inventory Scope — Pending Approval

When approved, Step 2 extracts visible strings from these 12 files only:

1. ~/Desktop/carlosurena.github.io/index.html
2. ~/Desktop/carlosurena.github.io/consulting.html
3. ~/Desktop/carlosurena.github.io/pfi.html
4. ~/Desktop/carlosurena.github.io/playbooks.html (new — not previously audited)
5. ~/Desktop/Payments project/ai-payments-portfolio/src/pages/FrameworkIndex.jsx
6. ~/Desktop/Payments project/ai-payments-portfolio/src/models/Model01_ProfitabilityEngine.jsx
7. ~/Desktop/Payments project/ai-payments-portfolio/src/models/Model02_RailOptimizer.jsx
8. ~/Desktop/Payments project/ai-payments-portfolio/src/models/Model03_CorridorAnalyzer.jsx
9. ~/Desktop/Payments project/ai-payments-portfolio/src/models/Model04_ClientBehavior.jsx
10. ~/Desktop/Payments project/ai-payments-portfolio/src/models/Model05_PortfolioScorecard.jsx
11. ~/Desktop/Payments project/ai-payments-portfolio/src/models/Model06_MoneyMovement.jsx
12. ~/Desktop/Payments project/ai-payments-portfolio/src/main.jsx

---

## Next Steps

- [ ] Confirm carlosurena.com GitHub repo — active, redirect, or inactive?
- [ ] Confirm -payments-portfolio-diagnostic- — superseded or still live?
- [ ] Approve the 12-file inventory scope above
- [ ] After approval: Step 2 — build visible_output_inventory.txt
- [ ] After inventory approval: Step 3 — lexical audit
- [ ] After audit approval: Step 4 — targeted patches only
