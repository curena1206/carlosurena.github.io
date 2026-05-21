// app.js — Payments Portfolio Diagnostic
// Phase 2: Pre-loaded scenarios + auto-compute + rule trigger transparency

(() => {
  // ── Scenario definitions ──────────────────────────────────────────────────
  // Each scenario pre-fills all 42 question answers.
  // Scores are calibrated to fire specific rules engine tiers meaningfully.

  const SCENARIOS = [
    {
      id: "inherited",
      label: "Day 1 — Inherited Underperforming Franchise",
      description: "Volume looks acceptable on paper. Dig in and you find margin compression, no P&L owner, pricing driven by sales, and an ops team managing exceptions manually with no measurement discipline.",
      tag: "Stabilize first",
      tagColor: "tag-red",
      answers: {
        // Revenue Architecture — weak mix, poor capture, some FX but no corridor
        RA1: 1, RA2: 1, RA3: 0, RA4: 1, RA5: 1, RA6: 2, RA7: 1,
        // Growth Engine — legacy relationships, low embed, no specialists
        GE1: 1, GE2: 1, GE3: 1, GE4: 1, GE5: 1, GE6: 1, GE7: 1,
        // Margin & Cost — high exceptions, no repair cost visibility, no unit cost
        MC1: 2, MC2: 1, MC3: 0, MC4: 0, MC5: 1, MC6: 1, MC7: 1,
        // Multi-Rail — limited RTP, ISO in flight, no routing strategy
        MR1: 2, MR2: 2, MR3: 1, MR4: 2, MR5: 1, MR6: 1, MR7: 1,
        // Balance & Liquidity — not linked, no overlay, pricing ignores balances
        BL1: 1, BL2: 1, BL3: 1, BL4: 1, BL5: 1, BL6: 1, BL7: 1,
        // Governance — no P&L owner, sales-driven pricing, no KPIs, ad-hoc cadence
        GO1: 1, GO2: 1, GO3: 1, GO4: 1, GO5: 1, GO6: 1, GO7: 1,
      }
    },
    {
      id: "growth_lag",
      label: "Growth-Stage Franchise with Monetization Lag",
      description: "Pipeline is working and volumes are growing. But revenue isn't keeping up — pricing is inconsistent, FX is ad-hoc, and the balance sheet contribution isn't reflected anywhere in how the book is priced.",
      tag: "Monetization gap",
      tagColor: "tag-yellow",
      answers: {
        // Revenue Architecture — some segmentation and FX, monetization capture lagging
        RA1: 2, RA2: 3, RA3: 3, RA4: 3, RA5: 2, RA6: 3, RA7: 2,
        // Growth Engine — strong GTM, good pipeline, decent embed
        GE1: 4, GE2: 3, GE3: 3, GE4: 3, GE5: 4, GE6: 4, GE7: 4,
        // Margin & Cost — moderate exceptions, partial cost visibility
        MC1: 3, MC2: 3, MC3: 2, MC4: 2, MC5: 3, MC6: 2, MC7: 3,
        // Multi-Rail — some RTP, ISO in progress, corridor undefined
        MR1: 3, MR2: 3, MR3: 2, MR4: 2, MR5: 3, MR6: 3, MR7: 3,
        // Balance & Liquidity — balances tracked but not systematically priced
        BL1: 3, BL2: 3, BL3: 2, BL4: 2, BL5: 2, BL6: 3, BL7: 3,
        // Governance — cadence established, pricing governance partial
        GO1: 3, GO2: 2, GO3: 3, GO4: 3, GO5: 3, GO6: 3, GO7: 3,
      }
    },
    {
      id: "mature_stress",
      label: "Mature Franchise — Readiness & Margin Stress Test",
      description: "A well-governed, well-run franchise facing rate cycle pressure and real-time rail gaps. Revenue mix is too dependent on balance income, RTP send is limited, and routing isn't optimized. Strong foundation — specific gaps.",
      tag: "Optimize & future-proof",
      tagColor: "tag-blue",
      answers: {
        // Revenue Architecture — diversified mix, balance-heavy, FX embedded
        RA1: 4, RA2: 4, RA3: 4, RA4: 3, RA5: 4, RA6: 4, RA7: 4,
        // Growth Engine — mature, repeatable, deeply embedded
        GE1: 4, GE2: 4, GE3: 4, GE4: 4, GE5: 4, GE6: 4, GE7: 4,
        // Margin & Cost — strong but some leakage at edges
        MC1: 4, MC2: 4, MC3: 4, MC4: 3, MC5: 4, MC6: 4, MC7: 3,
        // Multi-Rail — limited RTP send, ISO implemented, some routing optimization
        MR1: 2, MR2: 4, MR3: 3, MR4: 4, MR5: 4, MR6: 4, MR7: 4,
        // Balance & Liquidity — high penetration, rate sensitivity blind spot
        BL1: 4, BL2: 4, BL3: 4, BL4: 4, BL5: 1, BL6: 4, BL7: 4,
        // Governance — strong operating model throughout
        GO1: 4, GO2: 4, GO3: 4, GO4: 4, GO5: 4, GO6: 4, GO7: 4,
      }
    }
  ];

  function initApp() {
    const model = window.PPD_MODEL;
    if (!model) {
      console.error("[PPD] window.PPD_MODEL not available. Check model.js is loading.");
      return false;
    }

    const { pillars, rules, recommendations, subScoreMap, pillarFloorGuard } = model;

    const els = {
      pillarsContainer:  document.getElementById("pillarsContainer"),
      scenarioContainer: document.getElementById("scenarioContainer"),
      scenarioLabel:     document.getElementById("scenarioLabel"),
      btnStart:          document.getElementById("btnStart"),
      btnReset:          document.getElementById("btnReset"),
      btnResetResults:   document.getElementById("btnResetResults"),
      btnCopy2:          document.getElementById("btnCopy2"),
      btnCompute:        document.getElementById("btnCompute"),
      btnCopy:           document.getElementById("btnCopy"),
      progressText:      document.getElementById("progressText"),
      answeredText:      document.getElementById("answeredText"),
      progressFill:      document.getElementById("progressFill"),
      resultsEmpty:      document.getElementById("resultsEmpty"),
      resultsContainer:  document.getElementById("resultsContainer"),
      overallScore:      document.getElementById("overallScore"),
      maturityLabel:     document.getElementById("maturityLabel"),
      badgeMonetization: document.getElementById("badgeMonetization"),
      badgeMargin:       document.getElementById("badgeMargin"),
      badgeReadiness:    document.getElementById("badgeReadiness"),
      heatmap:           document.getElementById("heatmap"),
      pillarNarratives:  document.getElementById("pillarNarratives"),
      diagnosisList:     document.getElementById("diagnosisList"),
      prioritiesList:    document.getElementById("prioritiesList"),
      plan3090:          document.getElementById("plan3090"),
      stabilityBadge:    document.getElementById("stabilityBadge"),
      dependencyRiskList:document.getElementById("dependencyRiskList"),
      btnDownloadReport: document.getElementById("btnDownloadReport"),
      btnEmailCopy:      document.getElementById("btnEmailCopy"),
    };

    if (!els.pillarsContainer) {
      console.error("[PPD] pillarsContainer not found.");
      return true;
    }

    const state = {
      answers:        {},
      lastResult:     null,
      activeScenario: null,
    };

    // ── Utilities ─────────────────────────────────────────────────────────

    function totalQuestions() {
      return pillars.reduce((sum, p) => sum + p.questions.length, 0);
    }
    function answeredCount() { return Object.keys(state.answers).length; }
    function pctComplete() {
      const total = totalQuestions();
      return total === 0 ? 0 : Math.round((answeredCount() / total) * 100);
    }
    function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
    function avg(arr) {
      if (!arr.length) return 0;
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    }
    function maturityLabel(score100) {
      if (score100 >= 75) return "Mature franchise — optimize and defend";
      if (score100 >= 58) return "Established franchise — monetization gaps present";
      if (score100 >= 42) return "Volume present, margin discipline missing";
      return "Franchise needs stabilization before growth";
    }

    function pillarBand(score5) {
      if (score5 < 2.0) return "critical";
      if (score5 < 3.0) return "weak";
      if (score5 < 4.0) return "developing";
      if (score5 < 5.0) return "strong";
      return "exceptional";
    }

    const PILLAR_NARRATIVES = {
      revenue_arch: {
        critical:    "Revenue is driven by a single lever with no segmentation discipline — pricing, mix, and rail economics are not managed as a system.",
        weak:        "Some revenue levers exist but pricing segmentation is inconsistent and monetization capture is lagging volume growth.",
        developing:  "Revenue mix is reasonable but rail-level economics and pricing segmentation are not yet fully operationalized.",
        strong:      "Revenue architecture is disciplined — mix is diversified, pricing is segmented, and monetization capture is tracking ahead of volume.",
        exceptional: "Fully optimized revenue architecture with intentional mix targets, value-based segmentation, and consistent monetization capture."
      },
      growth_engine: {
        critical:    "Growth is relationship-dependent with no repeatable engine, low workflow embed, and a pipeline dominated by price-driven deals.",
        weak:        "GTM motions exist but are inconsistent — pipeline quality is mixed and workflow embedding has not yet created durable switching costs.",
        developing:  "A structured GTM engine is emerging with improving embed depth, but conversion discipline and differentiation clarity are still developing.",
        strong:      "Growth is repeatable and defensible — workflow embedding is creating switching costs and the pipeline converts on value, not just price.",
        exceptional: "Multiple diversified GTM engines with deep workflow integration, predictable conversion, and quantified client outcome differentiation."
      },
      margin_cost: {
        critical:    "Margin is under severe pressure — exception rates are high, repair costs are untracked, and pricing leakage is occurring without visibility.",
        weak:        "Exception and repair volume is a meaningful margin drag, unit cost discipline is limited, and override controls are inconsistently applied.",
        developing:  "Margin structure is adequate but leakage control and unit cost visibility are not yet fully embedded in operating decisions.",
        strong:      "Margin is well-managed with controlled exception rates, unit cost visibility informing pricing, and override discipline enforced.",
        exceptional: "High-margin franchise with documented lever playbook, near-zero exception rates, and pricing decisions fully anchored in unit economics."
      },
      multi_rail: {
        critical:    "Rail strategy is absent — real-time send capability is limited, routing is static, and data quality is creating repair and rejection risk.",
        weak:        "Some rail infrastructure is in place but RTP send, ISO leverage, and routing optimization are not yet generating commercial value.",
        developing:  "Rail readiness is progressing — ISO migration underway, some routing optimization — but real-time use cases are not yet monetized.",
        strong:      "Multi-rail strategy is commercially active — RTP send is scaled, ISO data is improving STP, and routing is managed as an economics lever.",
        exceptional: "Rail strategy is a competitive differentiator — real-time use cases are packaged and monetized, routing is dynamically optimized, ISO data drives automation."
      },
      balance_liquidity: {
        critical:    "Balance contribution is invisible — payments-to-balance linkage is absent, pricing ignores NII, and rate-cycle exposure is unquantified.",
        weak:        "Balances are present but not systematically linked to pricing or GTM decisions — franchise ROE is being systematically understated.",
        developing:  "Balance contribution is tracked for priority clients but not yet embedded in pricing discipline or rate-cycle management across the book.",
        strong:      "Balance-adjusted pricing is standard practice, operating balance penetration is managed, and rate-cycle sensitivity is measured and owned.",
        exceptional: "Fully integrated treasury and payments franchise — balance economics drive pricing, overlays optimize ROE, and rate exposure is managed by client cohort."
      },
      governance: {
        critical:    "The franchise lacks a functioning operating system — P&L ownership is diffuse, pricing is sales-driven, and KPIs are undefined or unused.",
        weak:        "Governance structures exist but lack enforcement — pricing controls are inconsistent, KPI cadence is fragmented, and accountability is unclear.",
        developing:  "Operating model is establishing itself — P&L ownership is clear and a KPI cadence is forming, but pricing governance and execution discipline are still developing.",
        strong:      "Strong operating model with clear P&L authority, enforced pricing governance, and a monthly KPI review driving decisions.",
        exceptional: "Best-in-class operating system — pricing is governed with elasticity data, every KPI drives resource allocation, and the operating cadence is a competitive advantage."
      }
    };
    function heatColor(score5) {
      if (score5 >= 4.0) return "hm-green";
      if (score5 >= 2.5) return "hm-yellow";
      return "hm-red";
    }

    // ── Progress ──────────────────────────────────────────────────────────

    function setProgress() {
      const pct = pctComplete();
      if (els.progressText) els.progressText.textContent = `${pct}% complete`;
      if (els.answeredText) els.answeredText.textContent = `${answeredCount()} answered`;
      if (els.progressFill) els.progressFill.style.width = `${pct}%`;
      if (els.btnCopy) els.btnCopy.disabled = !state.lastResult;
      if (els.btnCopy2) els.btnCopy2.disabled = !state.lastResult;
    }

    // ── Scenario UI ───────────────────────────────────────────────────────

    // ── Scenario UI (illustrative — no answer prefill) ────────────────────
    function renderScenarios() {
      if (!els.scenarioContainer) return;
      els.scenarioContainer.innerHTML = "";

      const ILLUSTRATIVE = [
        {
          id:      "inherited",
          tag:     "STABILIZE FIRST",
          label:   "Inherited Underperforming Franchise",
          bullets: ["Margin compression visible", "Weak ownership structure", "High manual repair activity"]
        },
        {
          id:      "growth_lag",
          tag:     "MONETIZATION GAP",
          label:   "Growth Franchise with Monetization Lag",
          bullets: ["Volumes growing rapidly", "Revenue not keeping pace", "Weak pricing economics"]
        },
        {
          id:      "mature_stress",
          tag:     "OPTIMIZE & FUTURE-PROOF",
          label:   "Mature Franchise Stress Test",
          bullets: ["Strong operating foundation", "Emerging real-time gaps", "Concentrated revenue pressure"]
        }
      ];

      const intro = document.createElement("div");
      intro.className = "scenario-intro";
      intro.innerHTML = `<div class="scenario-intro-text"><strong>Explore Illustrative Portfolio Examples</strong></div>`;
      els.scenarioContainer.appendChild(intro);

      const grid = document.createElement("div");
      grid.className = "scenario-grid scenario-grid-compact";

      ILLUSTRATIVE.forEach((s) => {
        const card = document.createElement("div");
        card.className = "scenario-card scenario-card-compact";
        card.innerHTML = `
          <div class="scenario-card-tag">${s.tag}</div>
          <div class="scenario-title-compact">${s.label}</div>
          <ul class="scenario-bullets-stacked">${s.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
          <button class="btn btn-scenario-sm" data-id="${s.id}">Run Demo →</button>
        `;
        card.querySelector("button").addEventListener("click", () => {
          if (window.CUA) window.CUA.pfiExamplePDFClicked(s.label);
          loadScenario(s.id);
          setTimeout(() => {
            computeAndShow(true);
            document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        });
        grid.appendChild(card);
      });

      els.scenarioContainer.appendChild(grid);

      const bridge = document.createElement("p");
      bridge.className = "scenario-bridge";
      bridge.textContent = "Or continue below and answer using your own operating environment.";
      els.scenarioContainer.appendChild(bridge);
    }

    function loadScenario(scenarioId) {
      const scenario = SCENARIOS.find((s) => s.id === scenarioId);
      if (!scenario) return;

      state.answers = { ...scenario.answers };
      state.activeScenario = scenarioId;
      state.lastResult = null;

      renderPillars();
      renderScenarios();

      if (els.scenarioLabel) {
        els.scenarioLabel.textContent = `Viewing: ${scenario.label}`;
        els.scenarioLabel.classList.remove("hidden");
      }

      computeAndShow(true);
    }

    // ── Pillar rendering ──────────────────────────────────────────────────

    function renderPillars() {
      els.pillarsContainer.innerHTML = "";

      pillars.forEach((pillar, idx) => {
        const wrap = document.createElement("div");
        wrap.className = "pillar";
        wrap.dataset.pillarId = pillar.id;

        const header = document.createElement("div");
        header.className = "pillar-header";
        header.innerHTML = `
          <div>
            <div class="pillar-title">${pillar.name}</div>
            <div class="pillar-meta">
              <span>${Math.round(pillar.weight * 100)}% weight</span>
              <span class="dot">·</span>
              <span>${pillar.subtitle}</span>
            </div>
          </div>
          <div class="chev">▾</div>
        `;

        header.addEventListener("click", () => wrap.classList.toggle("open"));

        const body = document.createElement("div");
        body.className = "pillar-body";

        pillar.questions.forEach((q) => {
          const qEl = document.createElement("div");
          qEl.className = "q";

          const optionsHtml = q.options.map((opt, i) => {
            const inputId = `${q.id}_${i}`;
            const optValue = opt.score === null ? "null" : opt.score;
            const isChecked = state.answers[q.id] === opt.score;
            return `
              <label class="option ${isChecked ? "option-selected" : ""}" for="${inputId}">
                <input type="radio" name="${q.id}" id="${inputId}"
                  value="${optValue}" ${isChecked ? "checked" : ""} />
                <div>
                  <div class="option-label">${opt.label}</div>
                  <div class="option-sub">${opt.sub}</div>
                </div>
              </label>
            `;
          }).join("");

          qEl.innerHTML = `
            <div class="q-title">${q.id}. ${q.title}</div>
            <div class="q-desc">${q.desc}</div>
            <div class="q-options">${optionsHtml}</div>
          `;

          qEl.querySelectorAll(`input[name="${q.id}"]`).forEach((radio) => {
            radio.addEventListener("change", (e) => {
              const raw = e.target.value;
              const val = raw === "null" ? null : Number(raw);
              state.answers[q.id] = val;
              // ── Analytics ────────────────────────────────────────────────
              if (window.CUA) {
                const _ac = answeredCount();
                if (_ac === 1) window.CUA.pfiStarted();
                if (_ac === 10) window.CUA.trackEvent("pfi_question_10_reached");
                if (_ac === 20) window.CUA.trackEvent("pfi_question_20_reached");
              }
              // ─────────────────────────────────────────────────────────────
              state.lastResult = null;
              state.activeScenario = null;
              if (els.btnCopy) els.btnCopy.disabled = true;
              if (els.btnCopy2) els.btnCopy2.disabled = true;
              if (els.scenarioLabel) els.scenarioLabel.classList.add("hidden");
              qEl.querySelectorAll(".option").forEach((l) => l.classList.remove("option-selected"));
              e.target.closest(".option")?.classList.add("option-selected");
              setProgress();
            });
          });

          body.appendChild(qEl);
        });

        wrap.appendChild(header);
        wrap.appendChild(body);

        // First pillar open by default; all open when scenario loaded
        if (idx === 0 || state.activeScenario) wrap.classList.add("open");

        els.pillarsContainer.appendChild(wrap);
      });

      setProgress();
    }

    // ── Scoring ───────────────────────────────────────────────────────────

    function computePillarScores() {
      const out = {};
      pillars.forEach((p) => {
        const scores = [];
        p.questions.forEach((q) => {
          const ans = state.answers[q.id];
          if (typeof ans === "number" && ans !== null) scores.push(ans);
        });
        const score5 = avg(scores);
        out[p.id] = { score5, score100: score5 * 20, answered: scores.length, total: p.questions.length };
      });
      return out;
    }

    function computeOverall(pillarScores) {
      let weighted = 0;
      pillars.forEach((p) => {
        weighted += (pillarScores[p.id].score5 / 5) * (p.weight * 100);
      });
      let composite = Math.round(weighted);
      if (pillarFloorGuard) {
        const { threshold, penalty } = pillarFloorGuard;
        let totalPenalty = 0;
        pillars.forEach((p) => {
          const { score5, answered } = pillarScores[p.id];
          if (answered >= 3 && score5 < threshold) totalPenalty += penalty;
        });
        composite -= Math.min(totalPenalty, 30);
      }
      return clamp(composite, 8, 100);
    }

    function computeSubScores(pillarScores) {
      const sub = {};
      Object.keys(subScoreMap).forEach((k) => {
        const scores = subScoreMap[k].map((pid) => (pillarScores[pid].score5 / 5) * 100);
        sub[k] = Math.round(avg(scores));
      });
      return sub;
    }

    function answersMapForRules() {
      const a = {};
      pillars.forEach((p) =>
        p.questions.forEach((q) => {
          const ans = state.answers[q.id];
          a[q.id] = ans === undefined ? 0 : ans;
        })
      );
      return a;
    }

    // ── Rules engine ──────────────────────────────────────────────────────

    function runRules(a) {
      const triggered = [];
      rules.forEach((r) => {
        try { if (r.when(a)) triggered.push(r); } catch (_) {}
      });

      if (triggered.length === 0) {
        triggered.push({
          id: "baseline_mixed",
          tier: 2,
          diagnosis: "Baseline portfolio profile is mixed. Focus on the lowest-scoring pillar and establish KPI cadence as the first operating priority.",
          recs: ["R19", "R20", "R8"],
        });
      }

      triggered.sort((x, y) => {
        const tx = x.tier || 99, ty = y.tier || 99;
        if (tx !== ty) return tx - ty;
        if (x.id === "monetization_capture_gap") return -1;
        if (y.id === "monetization_capture_gap") return 1;
        return 0;
      });

      const diag = [], diagSources = [];
      for (const r of triggered) {
        if (diag.length >= 3) break;
        if (r.diagnosis && !diag.includes(r.diagnosis)) {
          diag.push(r.diagnosis);
          diagSources.push({ ruleId: r.id, tier: r.tier });
        }
      }

      const recIds = [];
      let round = 0;
      while (recIds.length < 5) {
        let added = false;
        for (const r of triggered) {
          if (!r.recs || round >= r.recs.length) continue;
          const rec = r.recs[round];
          if (rec && !recIds.includes(rec)) {
            recIds.push(rec);
            added = true;
            if (recIds.length >= 5) break;
          }
        }
        if (!added) break;
        round++;
      }

      return { diag, diagSources, recIds, triggeredIds: triggered.map(r => r.id) };
    }

    // ── Render: heatmap ───────────────────────────────────────────────────

    function renderHeatmap(pillarScores) {
      if (!els.heatmap) return;
      els.heatmap.innerHTML = "";
      pillars.forEach((p) => {
        const s = pillarScores[p.id].score5;
        const row = document.createElement("div");
        row.className = `hm-row ${heatColor(s)}`;
        const floorFlag = pillarFloorGuard &&
          pillarScores[p.id].answered >= 3 && s < pillarFloorGuard.threshold
          ? `<span class="hm-floor-flag" title="Collapsed pillar — floor penalty applied">⚠</span>`
          : "";
        row.innerHTML = `
          <div class="hm-left">
            <div class="hm-title">${p.name}${floorFlag}</div>
            <div class="hm-sub">${Math.round(p.weight * 100)}% weight</div>
          </div>
          <div class="hm-score">${s.toFixed(1)} / 5.0</div>
        `;
        els.heatmap.appendChild(row);
      });
    }

    // ── Render: pillar narratives ─────────────────────────────────────────

    function renderPillarNarratives(pillarScores, overall) {
      if (!els.pillarNarratives) return;
      const sc = pfiGetScenario(overall);
      els.pillarNarratives.innerHTML = "";
      pillars.forEach((p) => {
        const narrative = sc.pillar_commentary[p.id];
        if (!narrative) return;
        const row = document.createElement("div");
        row.className = "pn-row";
        row.innerHTML = `
          <div class="pn-header">
            <span class="pn-name">${p.name}</span>
            <span class="pn-badge pn-critical">${sc.label}</span>
          </div>
          <div class="pn-text">${narrative}</div>
        `;
        els.pillarNarratives.appendChild(row);
      });
    }

    // ── Render: structural profile (stability + dependency risk) ──────────
    function renderStructuralProfile(result) {
      const rules = result.rules;

      // Structural stability — derived from min tier of triggered rules
      if (els.stabilityBadge) {
        const sources = rules.diagSources || [];
        const allIds  = rules.triggeredIds || [];
        // tier 1 rules always appear in diagSources if triggered
        const hasTier1 = sources.some(s => s.tier === 1);
        const hasTier2 = sources.some(s => s.tier === 2) || allIds.some(id => ["monetization_capture_gap","pricing_leakage_controls_weak","exceptions_material_not_crisis","unit_cost_immature","cadence_weak_not_absent","balances_not_monetized","fx_without_corridor","fx_spread_leakage","rtp_readiness_gap"].includes(id));
        const hasTier3 = !hasTier1 && !hasTier2 && allIds.length > 0;

        let label, cls;
        if (hasTier1)      { label = "Structural Concern Detected"; cls = "stability-critical"; }
        else if (hasTier2) { label = "Attention Areas Present";     cls = "stability-warning";  }
        else if (hasTier3) { label = "Patterns Worth Monitoring";   cls = "stability-monitor";  }
        else               { label = "No Structural Concerns";      cls = "stability-ok";       }

        els.stabilityBadge.innerHTML = `<span class="stability-badge ${cls}">${label}</span>`;

        // Surface to analytics
        result._stabilityLabel = label;
      }

      // Dependency risk patterns
      if (els.dependencyRiskList) {
        const DEP_MAP = {
          float_dependency_risk:       "Balance income dependency — rate-cycle sensitivity may not be measured",
          concentration_risk_extreme:  "Revenue concentration — top client relationship sensitivity elevated",
          rate_cycle_exposure_mature:  "Rate-cycle exposure — sensitivity not fully evaluated at segment level",
          fx_without_corridor:         "FX monetization gap — spread discipline not fully operationalized",
          rtp_readiness_gap:           "Real-time rail gap — RTP capability limiting commercial use cases",
        };
        const triggered = (rules.triggeredIds || []).filter(id => DEP_MAP[id]);
        result._dependencyPatterns = triggered;

        if (triggered.length > 0) {
          els.dependencyRiskList.innerHTML =
            `<ul class="dep-risk-list">${triggered.map(id => `<li>${DEP_MAP[id]}</li>`).join("")}</ul>`;
        } else {
          els.dependencyRiskList.innerHTML = `<div class="dep-risk-none">No dependency risk patterns detected</div>`;
        }
      }
    }

    // ── Render: management observations (rules engine output) ─────────────
    function renderObservations(result) {
      if (!els.diagnosisList) return;
      const diag = result.rules.diag || [];
      els.diagnosisList.innerHTML = "";
      if (diag.length === 0) {
        const li = document.createElement("li");
        li.className = "diagnosis-item";
        li.innerHTML = `<div class="diag-text">No significant structural observations at current score level.</div>`;
        els.diagnosisList.appendChild(li);
        return;
      }
      diag.forEach((d, i) => {
        const li = document.createElement("li");
        li.className = "diagnosis-item";
        li.innerHTML = `<span class="diag-tier tier-neutral">Observation ${i + 1}</span><div class="diag-text">${d}</div>`;
        els.diagnosisList.appendChild(li);
      });
    }

    // ── Render: diagnosis (used by PDF via pfiGetScenario — kept intact) ──
    function renderDiagnosis(overall) {
      if (!els.diagnosisList) return; // no-op; renderObservations handles display
    }

    // ── Render: priorities ────────────────────────────────────────────────

    function renderPriorities(overall) {
      if (!els.prioritiesList) return;
      const sc = pfiGetScenario(overall);
      els.prioritiesList.innerHTML = "";
      sc.priorities.slice(0, 3).forEach((pri, idx) => {
        const box = document.createElement("div");
        box.className = "priority";
        box.innerHTML = `
          <div class="priority-num">${idx + 1}</div>
          <div class="priority-body">
            <div class="priority-title">${pri.title}</div>
            <div class="priority-meta">Owner: ${pri.owner} · KPI: ${pri.kpi}</div>
            <div class="priority-why">${pri.why}</div>
          </div>
        `;
        els.prioritiesList.appendChild(box);
      });
    }

    // ── Render: 30/60/90 plan ─────────────────────────────────────────────

    function render3090(overall) {
      if (!els.plan3090) return;
      const sc = pfiGetScenario(overall);

      function col(phase) {
        const ul = phase.items.length
          ? `<ul>${phase.items.map((x) => `<li>${x}</li>`).join("")}</ul>`
          : `<div class="micro">No items.</div>`;
        return `
          <div class="plan-col">
            <div class="plan-phase">${phase.period}</div>
            <div class="plan-title">${phase.title}</div>
            ${ul}
          </div>
        `;
      }

      els.plan3090.innerHTML = sc.execution.map(col).join("");
    }

    // ── Render: results ───────────────────────────────────────────────────

    // ── Sub-score badge renderer ───────────────────────────────────────────
    const SUB_LABELS = {
      discipline: "Operating Discipline",
      resilience: "Portfolio Resilience",
      readiness:  "Strategic Readiness"
    };
    const SUB_STATUS = {
      discipline: [ "Foundational Gaps Detected", "Developing Practices",   "Structured Approach",    "Mature Operating Model"    ],
      resilience: [ "High Structural Fragility",  "Moderate Vulnerability", "Developing Resilience",  "Resilient Portfolio"       ],
      readiness:  [ "Early Capability Stage",     "Foundational Capability","Emerging Readiness",     "Strategically Positioned"  ]
    };
    const DOT_LABELS = ["Low", "Developing", "Moderate", "Strong", "Optimized"];

    function renderSubBadge(dimension, score) {
      const s      = parseInt(score, 10) || 0;
      const tier   = s <= 25 ? 0 : s <= 50 ? 1 : s <= 75 ? 2 : 3;
      const dots   = Math.ceil(s / 20);
      const filled = Math.min(Math.max(dots, 1), 5);
      const dotStr = Array.from({length: 5}, (_, i) => i < filled ? "●" : "○").join("");
      const dlabel = DOT_LABELS[filled - 1];
      return `
        <div class="badge-sub-label">${SUB_LABELS[dimension]}</div>
        <div class="badge-sub-status">${SUB_STATUS[dimension][tier]}</div>
        <div class="badge-sub-dots"><span class="badge-dots-str">${dotStr}</span><span class="badge-dots-label">${dlabel}</span></div>
      `;
    }

    function renderResults(result) {
      if (els.resultsEmpty) els.resultsEmpty.classList.add("hidden");
      if (els.resultsContainer) els.resultsContainer.classList.remove("hidden");

      if (els.overallScore) els.overallScore.textContent = result.overall;
      if (els.maturityLabel) els.maturityLabel.textContent = maturityLabel(result.overall);
      if (els.badgeMonetization) els.badgeMonetization.innerHTML = renderSubBadge("discipline", result.sub.monetization);
      if (els.badgeMargin)       els.badgeMargin.innerHTML       = renderSubBadge("resilience", result.sub.margin);
      if (els.badgeReadiness)    els.badgeReadiness.innerHTML    = renderSubBadge("readiness",  result.sub.readiness);

      renderStructuralProfile(result);
      renderHeatmap(result.pillarScores);
      renderObservations(result);
      renderPriorities(result.overall);
      // pillarNarratives and plan3090 intentionally omitted from screen display
      // PDF uses pfiGetScenario() directly — not DOM elements
    }

    // ── Compute & show ────────────────────────────────────────────────────

    function computeAndShow(fromScenario = false) {
      if (!fromScenario && answeredCount() < Math.min(10, totalQuestions())) {
        alert("Add a few more answers before computing results (at least 10).");
        return;
      }

      const pillarScores = computePillarScores();
      const overall      = computeOverall(pillarScores);
      const sub          = computeSubScores(pillarScores);
      const a            = answersMapForRules();
      const ruleOutput   = runRules(a);

      const result = { pillarScores, overall, sub, rules: ruleOutput };
      state.lastResult = result;
      if (els.btnCopy) els.btnCopy.disabled = false;
      if (els.btnCopy2) els.btnCopy2.disabled = false;
      const _sb = document.getElementById("btnShareLink"); if (_sb) _sb.disabled = false;

      renderResults(result);
      // ── Analytics ──────────────────────────────────────────────────────────
      if (window.CUA) {
        const _sc = pfiGetScenario(overall);
        window.CUA.pfiCompleted(overall, _sc ? _sc.label : "", {
          structural_stability_label: result._stabilityLabel || "",
          dependency_patterns:        (result._dependencyPatterns || []).join("|")
        });
      }
      // ───────────────────────────────────────────────────────────────────────
      if (els.btnDownloadReport) els.btnDownloadReport.disabled = false;
      if (els.btnEmailCopy)      els.btnEmailCopy.disabled      = false;
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }

    // ── Reset ─────────────────────────────────────────────────────────────

    function resetAll() {
      state.answers = {};
      state.lastResult = null;
      state.activeScenario = null;
      if (els.btnCopy) els.btnCopy.disabled = true;
      if (els.btnCopy2) els.btnCopy2.disabled = true;
      if (els.scenarioLabel) els.scenarioLabel.classList.add("hidden");
      renderScenarios();
      renderPillars();
      if (els.resultsEmpty) els.resultsEmpty.classList.remove("hidden");
      if (els.resultsContainer) els.resultsContainer.classList.add("hidden");
      document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" });
    }

    // ── Executive summary ─────────────────────────────────────────────────

    function buildExecutiveSummary() {
      if (!state.lastResult) return "";
      const r = state.lastResult;

      const byWeak = pillars
        .map((p) => ({ name: p.name, score: r.pillarScores[p.id].score5 }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 2);

      const priorities = r.rules.recIds.map((id) => recommendations[id]?.title).filter(Boolean);

      const collapsedPillars = pillars
        .filter((p) =>
          pillarFloorGuard &&
          r.pillarScores[p.id].answered >= 3 &&
          r.pillarScores[p.id].score5 < pillarFloorGuard.threshold
        ).map((p) => p.name);

      const floorNote = collapsedPillars.length
        ? [``, `Collapsed pillars (floor penalty applied):`, ...collapsedPillars.map((n) => `- ${n}`)]
        : [];

      const scenarioNote = state.activeScenario
        ? [``, `Scenario: ${SCENARIOS.find((s) => s.id === state.activeScenario)?.label || ""}`]
        : [];

      return [
        `Payments Franchise Index (PFI) — Executive Summary`,
        `Built by Carlos Urena · linkedin.com/in/carlosurena · Built from 20 years of payments portfolio management across global banks`,
        ...scenarioNote,
        ``,
        `PFI Score: ${r.overall}/100 (${maturityLabel(r.overall)})`,
        `Monetization: ${r.sub.monetization}/100 · Margin durability: ${r.sub.margin}/100 · Strategic readiness: ${r.sub.readiness}/100`,
        ...floorNote,
        ``,
        `Primary diagnosis:`,
        ...r.rules.diag.map((d) => `- ${d}`),
        ``,
        `Lowest pillars:`,
        ...byWeak.map((x) => `- ${x.name}: ${x.score.toFixed(1)}/5.0`),
        ``,
        `Recommended 90-day priorities:`,
        ...priorities.map((p, i) => `${i + 1}. ${p}`),
        ``,
        `Payments Franchise Index (PFI) — V1 · Commercial banking payments`,
        `USD clearing · Wires · ACH · Cross-border · FX-enabled flows · RTP/FedNow · Liquidity overlays`,
        ``,
        `This is a structured decision aid designed to surface likely constraints — not a definitive assessment.`,
      ].join("\n");
    }

    async function copySummary() {
      const text = buildExecutiveSummary();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        alert("Executive summary copied to clipboard.");
      } catch (_) {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        alert("Executive summary copied.");
      }
    }

// ─────────────────────────────────────────────────────────────────────────────
// PFI_EXPORT.js  —  Drop-in replacement for exportPDF() in app.js
//
// HOW TO INTEGRATE:
//   1. Delete the existing exportPDF() function from app.js (search "function exportPDF")
//   2. Paste this entire file's content in its place
//   3. The function signature is identical — it reads state.lastResult and state.activeScenario
//      from the existing app.js closure, so no other changes are needed.
//
// DEPENDENCIES: jsPDF (already loaded via CDN in index.html)
// ─────────────────────────────────────────────────────────────────────────────

// ── SCENARIO DATA ─────────────────────────────────────────────────────────────
// All language is keyed by score band. Pillar scores still come from the
// 42-question computation — only the narrative language is band-driven.

const PFI_SCENARIOS = [
  {
    range: [0, 25],
    label: "STRUCTURAL FAILURE",
    scenario_name: "Day 1 \u2014 Inherited Underperforming Franchise",
    benchmark_insight:
      "At this level, payments franchises typically experience margin compression driven by repair costs, " +
      "pricing leakage, and weak or absent portfolio governance. Stabilization programs focus first on pricing " +
      "discipline and operational control before growth initiatives gain traction.",
    pillar_commentary: {
      revenue_arch:
        "Revenue depends on a single economic lever. Pricing, mix, and rail economics are not managed as a " +
        "system. Fee schedules are not segmented by client value or corridor profitability.",
      growth_engine:
        "Growth is relationship-driven with no repeatable acquisition engine. Workflow embed is low and the " +
        "pipeline is dominated by price-driven deals that compress margin at entry.",
      margin_cost:
        "Margin is under severe pressure. Exception rates are high, repair costs are not systematically " +
        "tracked, and pricing leakage is occurring without visibility. Unit economics by rail are unknown.",
      multi_rail:
        "Rail strategy is absent. Real-time send capability is limited, routing is static, and data quality " +
        "is creating repair and rejection risk across corridors.",
      balance_liquidity:
        "Balance contribution is invisible. Payments-to-balance linkage is absent, pricing ignores NII, " +
        "and rate-cycle exposure is unquantified. Float economics are not captured.",
      governance:
        "The franchise lacks a functioning operating model. P&L ownership is diffuse, pricing is " +
        "sales-driven, and KPIs are undefined or unused. Cross-functional governance forums are absent.",
    },
    exec_diagnosis:
      "The franchise lacks a functioning payments operating model. Pricing governance, margin visibility, " +
      "and portfolio management mechanisms are absent or ineffective. All six pillars score at or near " +
      "minimum \u2014 this is a stabilization mandate, not an optimization exercise.",
    structural_issues: [
      "Exception and repair costs are compressing margin at a rate that threatens the P&L. " +
        "Manual intervention requires a dedicated program with named ownership and a repair rate target.",
      "The franchise is operating without a functioning management system. KPIs are undefined or unused " +
        "and cross-functional governance forums are absent. Strategy cannot execute in this environment.",
      "Pricing governance has broken down. Sales-driven discounting, absent override controls, and poor " +
        "cost visibility are creating systematic margin leakage invisible to leadership.",
    ],
    key_issues: [
      "Repair costs compressing margin at a rate that threatens the P&L",
      "Pricing governance broken down \u2014 sales-driven discounting, absent override controls",
      "No portfolio performance operating rhythm \u2014 KPIs undefined or unused",
    ],
    immediate_focus:
      "Restore pricing governance and operational discipline before pursuing growth. Without a functioning " +
      "operating model, growth amplifies margin leakage rather than strengthening the franchise.",
    priorities: [
      {
        title: "Launch Exception Reduction Program",
        owner: "Ops + Product + Tech",
        kpi:   "Repair rate, STP %, cost per repair, trend vs. target",
        why:   "Repairs are often the largest untracked driver of margin compression in commercial payments. " +
               "A dedicated program with named ownership and cadenced review creates accountability that normal ops cannot.",
      },
      {
        title: "Implement Monthly Portfolio Performance Review",
        owner: "Portfolio Owner",
        kpi:   "Pillar KPIs trending, actions opened and closed per cycle",
        why:   "Creates the operating rhythm needed to continuously improve franchise performance. " +
               "Without a recurring management forum, structural issues remain invisible until they become crises.",
      },
      {
        title: "Establish Pricing Council with Documented Authority Tiers",
        owner: "Exec Sponsor + Pricing Lead",
        kpi:   "Override rate, approval cycle time, margin integrity trend",
        why:   "Governance is often the fastest first fix for systematic pricing leakage. A council with clear " +
               "authority tiers stops ad-hoc discounting and creates an auditable pricing record.",
      },
      {
        title: "Establish Rail-Level Price Floors and Enforce Override Controls",
        owner: "Pricing + Sales Leadership",
        kpi:   "Override rate, margin leakage by deal, governance cycle time",
        why:   "Stops silent margin erosion from inconsistent deal-by-deal discounting. Price floors anchored " +
               "to unit cost data remove subjectivity from sales negotiation.",
      },
      {
        title: "Build Unit Cost Model by Rail and Segment",
        owner: "Finance + Product",
        kpi:   "Unit cost by rail, segment price floors, contribution margin",
        why:   "Provides the cost anchor needed for disciplined pricing and roadmap tradeoff decisions. " +
               "Without this, pricing governance has no economic foundation.",
      },
    ],
    execution: [
      {
        period: "Days 1\u201330",
        title:  "Stabilize & Measure",
        items:  [
          "Launch Exception Reduction Program with repair KPI ownership and cadence",
          "Implement monthly Portfolio Performance Review across rails, segments, and repairs",
        ],
      },
      {
        period: "Days 31\u201360",
        title:  "Fix Leakage & Align Levers",
        items:  [
          "Establish Pricing Council with documented authority tiers and cadence",
          "Establish rail-level price floors and enforce override controls",
        ],
      },
      {
        period: "Days 61\u201390",
        title:  "Scale & Institutionalize",
        items:  [
          "Build unit cost model by rail and segment \u2014 embed in pricing governance",
          "Publish portfolio scorecard and make franchise KPIs visible to leadership",
        ],
      },
    ],
    strategic_takeaway:
      "Without pricing governance and operational discipline, growth will amplify margin leakage rather " +
      "than strengthen the payments franchise. Stabilization must come before expansion.",
  },

  // ── SCENARIO 2: FRAGILE FRANCHISE ─────────────────────────────────────────
  {
    range: [26, 50],
    label: "FRAGILE FRANCHISE",
    scenario_name: "Fragile but Functioning \u2014 Governance Gaps Present",
    benchmark_insight:
      "At this level, the payments franchise has basic operating capability but lacks the governance " +
      "structures and margin discipline to sustain performance. Revenue is generated but leaks through " +
      "inconsistent pricing and underperforming corridors. The risk is institutionalizing weak practices " +
      "rather than achieving structural improvement.",
    pillar_commentary: {
      revenue_arch:
        "Revenue architecture exists but is not optimized. Pricing is partially segmented, but rail mix " +
        "management and corridor economics are inconsistently applied.",
      growth_engine:
        "Growth relies heavily on relationship coverage. Workflow embedding is low and deal quality is " +
        "inconsistent \u2014 some margin-accretive, many margin-dilutive.",
      margin_cost:
        "Exception rates are elevated and repair costs are partially tracked but not actively managed. " +
        "Pricing overrides occur without systematic governance.",
      multi_rail:
        "Multi-rail capability exists but routing logic is not optimized. Real-time rails are available " +
        "but underutilized. Data quality issues persist.",
      balance_liquidity:
        "Balance linkage to payments is tracked but not priced. NII contribution is acknowledged but not " +
        "integrated into deal economics.",
      governance:
        "Management cadence is irregular. KPIs exist but are not consistently reviewed. Pricing authority " +
        "tiers are informal and inconsistently applied.",
    },
    exec_diagnosis:
      "The payments franchise is generating revenue but has not built the operating infrastructure to " +
      "protect and grow margin systematically. Governance gaps are creating gradual but compounding " +
      "margin erosion that compounds over time without visible trigger events.",
    structural_issues: [
      "Pricing override culture is established and normalized. Without formal governance, discounting " +
        "behavior is self-reinforcing and margin erosion continues at pace.",
      "Portfolio management is reactive rather than proactive. The absence of a structured review " +
        "cadence means underperforming corridors and rails persist unaddressed.",
      "Balance sheet contribution remains disconnected from payments pricing. The franchise is leaving " +
        "NII value on the table in every rate-sensitive deal.",
    ],
    key_issues: [
      "Pricing override culture normalized \u2014 margin erosion is systematic and self-reinforcing",
      "Portfolio management is reactive \u2014 no structured review cadence in place",
      "Balance sheet contribution disconnected from payments pricing decisions",
    ],
    immediate_focus:
      "Formalize pricing governance and launch a portfolio review cadence. The payments franchise is " +
      "generating revenue but losing margin systematically. Governance is the fix.",
    priorities: [
      {
        title: "Formalize Pricing Governance with Override Controls",
        owner: "Exec Sponsor + Pricing Lead",
        kpi:   "Override rate, approval cycle time, margin integrity trend",
        why:   "The most urgent lever. Formalizing pricing authority and creating an audit trail stops the " +
               "silent erosion of margin that is already underway.",
      },
      {
        title: "Launch Portfolio Performance Review Cadence",
        owner: "Portfolio Owner",
        kpi:   "Pillar KPIs trending, actions opened and closed per cycle",
        why:   "Without a regular management forum, underperforming assets go unaddressed. A monthly cadence " +
               "creates the feedback loop needed for structural improvement.",
      },
      {
        title: "Build Rail Routing Optimization Program",
        owner: "Product + Tech",
        kpi:   "STP rate by rail, cost per transaction, real-time utilization %",
        why:   "Multi-rail capability is available but underused. Routing optimization directly reduces unit " +
               "cost and positions the franchise for volume growth.",
      },
      {
        title: "Integrate NII into Deal Pricing Model",
        owner: "Finance + Relationship Management",
        kpi:   "NII contribution per deal, balance linkage rate",
        why:   "Balance economics are being excluded from pricing decisions. Integrating NII creates a fuller " +
               "picture of deal profitability and improves pricing discipline.",
      },
      {
        title: "Establish Corridor Profitability Scorecard",
        owner: "Finance + Product",
        kpi:   "Corridor margin, volume trend, cost stack by corridor",
        why:   "Without corridor-level visibility, resource allocation and pricing decisions lack an economic " +
               "anchor. The scorecard becomes the basis for all portfolio decisions.",
      },
    ],
    execution: [
      {
        period: "Days 1\u201330",
        title:  "Stabilize Pricing Controls",
        items:  [
          "Implement pricing override approval process",
          "Launch portfolio performance review cadence",
        ],
      },
      {
        period: "Days 31\u201360",
        title:  "Optimize Operations",
        items:  [
          "Begin rail routing optimization program",
          "Integrate NII into deal pricing model",
        ],
      },
      {
        period: "Days 61\u201390",
        title:  "Build Portfolio Intelligence",
        items:  [
          "Launch corridor profitability scorecard",
          "Link scorecard to resource allocation and pricing decisions",
        ],
      },
    ],
    strategic_takeaway:
      "A fragile payments franchise can sustain itself for longer than it should \u2014 which is the danger. " +
      "The margin erosion is slow and invisible until it is not. The window to correct governance gaps " +
      "is now, before the P&L absorbs the full cost.",
  },

  // ── SCENARIO 3: OPERATIONALLY STABLE ──────────────────────────────────────
  {
    range: [51, 70],
    label: "OPERATIONALLY STABLE",
    scenario_name: "Stable Platform \u2014 Ready for Commercial Acceleration",
    benchmark_insight:
      "At this level, the payments franchise has functioning operational controls and a credible revenue " +
      "base. The platform is stable but not yet optimized for growth. The opportunity is to convert " +
      "operational stability into sustained commercial momentum through improved pricing discipline, " +
      "corridor expansion, and balance sheet integration.",
    pillar_commentary: {
      revenue_arch:
        "Revenue architecture is functional. Pricing is segmented at a basic level, but mix management " +
        "and corridor economics could be more precisely calibrated to margin targets.",
      growth_engine:
        "Growth engine is active but relies on existing relationships. Workflow embed is improving but " +
        "has not yet created durable switching cost. Pipeline quality is mixed.",
      margin_cost:
        "Margins are stable and repair costs are tracked. Exception rates are under control. Pricing " +
        "overrides occur but are monitored. Unit economics are partially understood.",
      multi_rail:
        "Multi-rail capability is deployed. Routing is functional but not dynamically optimized. " +
        "Real-time rails are live and utilization is growing.",
      balance_liquidity:
        "Balance linkage to payments is operational. NII contribution is tracked and included in some " +
        "pricing models. Float optimization is an emerging capability.",
      governance:
        "Governance structures are in place. Management cadence is regular. KPIs are defined and " +
        "reviewed. Pricing authority is documented but enforcement is inconsistent.",
    },
    exec_diagnosis:
      "The payments franchise is operationally sound and commercially active. The next phase requires " +
      "converting operational stability into a differentiated, high-margin payments franchise. " +
      "The priority shifts from repair to acceleration.",
    structural_issues: [
      "Pricing precision remains an opportunity. Basic segmentation exists but corridor-level and " +
        "client-level price optimization has not been systematically pursued.",
      "Workflow embedding is growing but has not yet created switching cost at scale. Deeper product " +
        "integration is the next source of durable revenue.",
      "Balance sheet economics are tracked but not fully leveraged. More aggressive NII integration " +
        "into relationship pricing would improve total returns.",
    ],
    key_issues: [
      "Pricing precision not yet optimized at corridor and client level",
      "Workflow embedding growing but switching cost not yet established at scale",
      "Balance sheet economics tracked but not fully integrated into relationship pricing",
    ],
    immediate_focus:
      "Shift from operational management to commercial acceleration. The platform is ready. " +
      "The priority now is corridor optimization, client deepening, and margin improvement.",
    priorities: [
      {
        title: "Launch Corridor Profitability Optimization Program",
        owner: "Product + Finance",
        kpi:   "Margin by corridor, pricing realization rate, volume mix shift",
        why:   "Stable operations create the platform for targeted corridor optimization. Systematic analysis " +
               "of corridor economics will reveal pricing and volume opportunities invisible at the aggregate level.",
      },
      {
        title: "Deepen Workflow Integration Across Top-20 Clients",
        owner: "Relationship Management + Product",
        kpi:   "Workflow embed rate, product depth per client, churn rate",
        why:   "Workflow integration is the most durable source of revenue protection. Deepening it across the " +
               "top client base creates switching cost and improves revenue predictability.",
      },
      {
        title: "Implement Dynamic Rail Routing",
        owner: "Tech + Product",
        kpi:   "Cost per transaction by rail, STP rate, routing decision time",
        why:   "Dynamic routing reduces unit cost and improves client experience simultaneously. At this stage " +
               "of scale, routing optimization has measurable P&L impact.",
      },
      {
        title: "Build Client-Level Profitability Model",
        owner: "Finance + Relationship Management",
        kpi:   "Client margin, NII contribution, total relationship return",
        why:   "Client-level economics inform pricing, coverage, and investment decisions. Without it, the " +
               "franchise cannot allocate resources to the relationships with the highest total return.",
      },
      {
        title: "Formalize Growth Playbook for New Corridor Entry",
        owner: "Strategy + Product",
        kpi:   "Corridor pipeline, time-to-revenue, cost of entry",
        why:   "Stable franchises that do not systematically pursue corridor expansion cede ground to more " +
               "aggressive competitors. A repeatable entry playbook reduces the cost and risk of growth.",
      },
    ],
    execution: [
      {
        period: "Days 1\u201330",
        title:  "Accelerate Commercial Levers",
        items:  [
          "Launch corridor profitability optimization program",
          "Begin client-level profitability model build",
        ],
      },
      {
        period: "Days 31\u201360",
        title:  "Deepen Integration",
        items:  [
          "Begin workflow integration program for top-20 clients",
          "Implement dynamic rail routing",
        ],
      },
      {
        period: "Days 61\u201390",
        title:  "Scale Growth Engine",
        items:  [
          "Formalize new corridor entry playbook",
          "Deploy growth engine across pipeline with repeatable model",
        ],
      },
    ],
    strategic_takeaway:
      "Operational stability is a platform, not a destination. The payments franchise that stays stable " +
      "too long loses ground to competitors who move from stability to growth faster. The 90-day priority " +
      "is converting operating capability into commercial momentum.",
  },

  // ── SCENARIO 4: STRATEGICALLY ALIGNED ────────────────────────────────────
  {
    range: [71, 85],
    label: "STRATEGICALLY ALIGNED",
    scenario_name: "High-Performance Franchise \u2014 Optimizing for Scale",
    benchmark_insight:
      "At this level, the payments franchise has strong commercial and operational foundations. Strategy, " +
      "governance, and execution are aligned. The focus shifts to scaling what is working, eliminating " +
      "remaining friction points, and building the next generation of capabilities that will defend the " +
      "franchise against competitive pressure.",
    pillar_commentary: {
      revenue_arch:
        "Revenue architecture is well-developed. Pricing is segmented and corridor economics are actively " +
        "managed. Mix management is systematic and rail economics are integrated into decisions.",
      growth_engine:
        "Growth engine is structured and repeatable. Workflow embed is high across the top client base. " +
        "Pipeline is well-qualified and margin-accretive deals dominate.",
      margin_cost:
        "Margins are strong and actively managed. Exception rates are low. Repair costs are minimal and " +
        "tracked. Pricing governance is enforced. Unit economics are well-understood.",
      multi_rail:
        "Multi-rail strategy is sophisticated. Routing is dynamically optimized. Real-time capability is " +
        "fully deployed. Data quality is high across corridors.",
      balance_liquidity:
        "Balance sheet is fully integrated into the payments franchise. NII is priced into relationships " +
        "systematically. Float optimization is active and rate-cycle exposure is managed.",
      governance:
        "Operating model is mature. Management cadence is rigorous and fully embedded. KPIs are " +
        "comprehensive and consistently reviewed. Pricing governance is enforced with full authority structure.",
    },
    exec_diagnosis:
      "The payments franchise is operating at a high level across all dimensions. The strategic challenge " +
      "at this stage is defending the advantage, scaling efficiently, and continuing to raise the " +
      "performance ceiling before competitive pressure forces a reactive response.",
    structural_issues: [
      "At this performance level, the risks are complacency and complexity. High-performing franchises " +
        "often over-invest in sustaining existing programs rather than building next-generation capabilities.",
      "Talent concentration risk is a structural vulnerability in aligned franchises. Performance depends " +
        "on specific individuals, which creates succession and transition risk.",
      "External competitive dynamics require ongoing monitoring. A strategically aligned payments franchise " +
        "can lose ground quickly if it does not anticipate rail disruption or pricing pressure from new entrants.",
    ],
    key_issues: [
      "Complacency risk \u2014 over-investment in existing programs vs. next-generation capabilities",
      "Talent concentration creates succession and transition risk",
      "Competitive disruption requires proactive monitoring and response capability",
    ],
    immediate_focus:
      "Protect the advantage and extend the lead. The franchise is performing well. The risk now is " +
      "competitive disruption and internal complacency. Focus shifts to next-generation capability " +
      "and portfolio optimization.",
    priorities: [
      {
        title: "Build Next-Generation Corridor Strategy",
        owner: "Strategy + Product",
        kpi:   "Corridor pipeline, market share by corridor, pricing premium",
        why:   "Strategically aligned franchises must actively expand their addressable market. Next-generation " +
               "corridor strategy ensures the franchise is growing its competitive position, not just defending it.",
      },
      {
        title: "Institutionalize Talent and Knowledge Transfer Programs",
        owner: "HR + Senior Leadership",
        kpi:   "Succession depth, knowledge documentation rate, retention",
        why:   "Performance concentration is the hidden vulnerability of high-performing franchises. " +
               "Institutionalizing knowledge and building succession depth de-risks the business.",
      },
      {
        title: "Launch Innovation Pipeline for Emerging Payment Flows",
        owner: "Product + Tech",
        kpi:   "Innovation pipeline size, time-to-pilot, revenue from new flows",
        why:   "Rail and technology disruption is accelerating. A structured innovation pipeline ensures the " +
               "franchise participates in new payment flows before competitors establish a lead.",
      },
      {
        title: "Develop Competitive Intelligence Capability",
        owner: "Strategy",
        kpi:   "Competitor move response time, pricing benchmark accuracy",
        why:   "At high performance levels, competitive dynamics become the primary external threat. Systematic " +
               "intelligence capability enables faster and better-informed strategic responses.",
      },
      {
        title: "Optimize Total Returns Across the Client Portfolio",
        owner: "Finance + Relationship Management",
        kpi:   "Total relationship return, NII + fee mix, client tenure",
        why:   "Portfolio optimization at this level is about maximizing total return, not just fee revenue. " +
               "Systematic review of NII and fee economics improves resource allocation significantly.",
      },
    ],
    execution: [
      {
        period: "Days 1\u201330",
        title:  "Defend and Extend",
        items:  [
          "Launch next-generation corridor strategy process",
          "Begin competitive intelligence capability build",
        ],
      },
      {
        period: "Days 31\u201360",
        title:  "Build Future Capability",
        items:  [
          "Launch innovation pipeline for emerging payment flows",
          "Institutionalize talent and knowledge transfer programs",
        ],
      },
      {
        period: "Days 61\u201390",
        title:  "Optimize Returns",
        items:  [
          "Complete total returns optimization across client portfolio",
          "Deploy expanded corridor strategy with market entry plan",
        ],
      },
    ],
    strategic_takeaway:
      "Strategic alignment is a competitive advantage \u2014 but only if it is actively leveraged. " +
      "The payments franchise that rests on current performance cedes ground to competitors building " +
      "the next generation of capability. The 90-day priority is staying ahead.",
  },

  // ── SCENARIO 5: BEST-IN-CLASS ─────────────────────────────────────────────
  {
    range: [86, 100],
    label: "BEST-IN-CLASS",
    scenario_name: "Best-in-Class Franchise \u2014 Industry-Leading Execution",
    benchmark_insight:
      "At this level, the payments franchise is operating at or near the top of its peer group across " +
      "all six pillars. Revenue architecture, margin discipline, governance, and growth engine quality " +
      "are all mature and mutually reinforcing. The challenge at this level is sustaining excellence, " +
      "managing complexity, and continuing to raise the performance standard.",
    pillar_commentary: {
      revenue_arch:
        "Revenue architecture is sophisticated and fully integrated. Pricing is dynamically optimized " +
        "by segment, corridor, and rail. Mix management is active and margin-accretive.",
      growth_engine:
        "Growth engine is industry-leading. Workflow embed is deep across the client base. Pipeline is " +
        "systematically managed and consistently margin-accretive. Client acquisition cost is low.",
      margin_cost:
        "Margins are best-in-class and systematically protected. Exception rates are minimal. Unit " +
        "economics are fully understood at the rail, corridor, and client level.",
      multi_rail:
        "Multi-rail capability is fully optimized. Dynamic routing, real-time capability, and data " +
        "quality are all operating at peak performance. Rail strategy is a competitive differentiator.",
      balance_liquidity:
        "Balance sheet integration is complete and fully optimized. NII is systematically priced. Float " +
        "economics are actively managed. Rate-cycle positioning is proactive.",
      governance:
        "Governance is industry-leading. Operating cadence is rigorous and fully embedded. KPIs are " +
        "comprehensive, real-time, and inform decision-making at every level.",
    },
    exec_diagnosis:
      "The payments franchise is executing at the highest level across all dimensions. The challenge at " +
      "this stage is sustaining performance across organizational change, market cycles, and competitive " +
      "disruption. Best-in-class franchises become competitive targets \u2014 the priority is building " +
      "the resilience and adaptability to remain at the top.",
    structural_issues: [
      "Sustaining best-in-class performance requires continuous investment in capability refresh. " +
        "Franchises at this level risk falling behind by optimizing existing programs rather than building the next generation.",
      "Organizational complexity grows with performance. Best-in-class franchises often develop " +
        "coordination overhead and decision latency that erodes the agility that drove their success.",
      "Market leadership creates pricing pressure from competitors and clients. Systematic defense of " +
        "pricing power requires ongoing investment in differentiation and switching cost.",
    ],
    key_issues: [
      "Capability refresh risk \u2014 optimizing existing programs instead of building next-generation",
      "Organizational complexity creating decision latency and coordination overhead",
      "Market leadership under pressure \u2014 pricing power requires active defense",
    ],
    immediate_focus:
      "Sustain the standard and build next-generation capability. Best-in-class performance is the " +
      "starting point, not the destination. The franchise that stops building loses its lead faster than it gained it.",
    priorities: [
      {
        title: "Build Franchise Resilience and Succession Program",
        owner: "Senior Leadership + HR",
        kpi:   "Succession depth, knowledge retention, leadership pipeline",
        why:   "Best-in-class performance creates dependency on specific talent and programs. Systematic " +
               "resilience-building ensures the franchise performs across leadership transitions and market cycles.",
      },
      {
        title: "Deploy Next-Generation Analytics and Intelligence Platform",
        owner: "Tech + Finance + Product",
        kpi:   "Decision velocity, analytics coverage, real-time KPI availability",
        why:   "Industry-leading franchises increasingly differentiate through data and analytics capability. " +
               "A next-generation platform sustains the decision-making advantage that drives performance.",
      },
      {
        title: "Lead Industry Standards in Payments Governance",
        owner: "Senior Leadership + Compliance",
        kpi:   "Industry participation, standards influence, regulatory positioning",
        why:   "Best-in-class franchises shape the industry they lead. Active participation in standards and " +
               "governance positions the franchise as the reference point and creates regulatory advantage.",
      },
      {
        title: "Expand Addressable Market Through New Payment Flow Entry",
        owner: "Strategy + Product",
        kpi:   "New flow revenue, time-to-market, market share in new categories",
        why:   "Market leadership in existing flows must be complemented by systematic expansion into emerging " +
               "payment categories. Best-in-class franchises grow their addressable market continuously.",
      },
      {
        title: "Deepen Client Ecosystem Integration",
        owner: "Relationship Management + Product",
        kpi:   "Ecosystem depth, API integration rate, switching cost index",
        why:   "The deepest competitive moat at this level is ecosystem integration. Making the franchise the " +
               "operating infrastructure of client workflows creates durable, compounding competitive advantage.",
      },
    ],
    execution: [
      {
        period: "Days 1\u201330",
        title:  "Sustain and Extend",
        items:  [
          "Launch franchise resilience and succession program",
          "Begin next-generation analytics platform build",
        ],
      },
      {
        period: "Days 31\u201360",
        title:  "Lead the Industry",
        items:  [
          "Establish industry standards participation program",
          "Expand addressable market through new payment flow entry",
        ],
      },
      {
        period: "Days 61\u201390",
        title:  "Deepen the Moat",
        items:  [
          "Deepen client ecosystem integration across top-50 relationships",
          "Deploy expanded analytics platform with real-time PFI KPI capability",
        ],
      },
    ],
    strategic_takeaway:
      "Best-in-class franchises are built over years and lost in a matter of quarters. The priority at " +
      "this level is not optimization \u2014 it is resilience, adaptability, and the continuous build of " +
      "next-generation capability that ensures the franchise remains the standard against which others are measured.",
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

function pfiGetScenario(score) {
  for (var i = 0; i < PFI_SCENARIOS.length; i++) {
    if (score >= PFI_SCENARIOS[i].range[0] && score <= PFI_SCENARIOS[i].range[1]) {
      return PFI_SCENARIOS[i];
    }
  }
  return PFI_SCENARIOS[0];
}

// Pillar id → commentary key mapping (matches app.js pillar ids)
var PFI_PILLAR_COMMENTARY_KEY = {
  revenue_arch:      "revenue_arch",
  growth_engine:     "growth_engine",
  margin_cost:       "margin_cost",
  multi_rail:        "multi_rail",
  balance_liquidity: "balance_liquidity",
  governance:        "governance",
};

// ── MAIN exportPDF FUNCTION ───────────────────────────────────────────────────

function exportPDF() {
  if (!state.lastResult) return;
  if (!window.jspdf) { alert("PDF library not loaded. Please refresh and try again."); return; }

  // ── Analytics ────────────────────────────────────────────────────────────
  if (window.CUA) {
    var _r  = state.lastResult;
    var _sc = pfiGetScenario(_r.overall);
    window.CUA.trackEvent("pfi_pdf_download_clicked", {
      pfi_score:          _r.overall,
      pfi_score_band:     window.CUA.scoreBand(_r.overall),
      structural_pattern: window.CUA.slugify(_sc ? _sc.label : "")
    });
  }
  // ─────────────────────────────────────────────────────────────────────────

  var r  = state.lastResult;
  var sc = pfiGetScenario(r.overall);

  var { jsPDF } = window.jspdf;
  var doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

  var PW = 215.9, PH = 279.4;
  var ML = 14, MR = 14;
  var CW = PW - ML - MR;

  // ── Palette (matches Python PDF exactly) ─────────────────────────────────
  var NAVY     = [13,  27,  42 ];
  var GOLD     = [201, 168, 76 ];
  var BURGUNDY = [123, 45,  66 ];
  var WHITE    = [255, 255, 255];
  var GDARK    = [44,  62,  80 ];
  var GMID     = [127, 140, 141];
  var GLIT     = [236, 240, 241];
  var GRULE    = [213, 216, 220];
  var SCORE_R  = [192, 57,  43 ];  // data viz only
  var SOFT     = [249, 250, 251];

  // Classification scale colors — two values per tier:
  // ink = swatch color (readable on white), labelDark = lighter stop (readable on navy)
  var SCALE_COLORS = [
    { lo:0,  hi:25,  ink:[139,32,32],   labelDark:[220,110,110], label:"Structural Failure"   },
    { lo:26, hi:50,  ink:[184,92,26],   labelDark:[230,165,100], label:"Fragile Franchise"    },
    { lo:51, hi:70,  ink:[138,115,24],  labelDark:[215,195,90],  label:"Operationally Stable" },
    { lo:71, hi:85,  ink:[30,107,60],   labelDark:[90,195,135],  label:"Strategically Aligned"},
    { lo:86, hi:100, ink:[20,82,48],    labelDark:[70,175,115],  label:"Best-in-Class"        },
  ];

  function activeScaleColor() {
    for (var i = 0; i < SCALE_COLORS.length; i++) {
      if (r.overall >= SCALE_COLORS[i].lo && r.overall <= SCALE_COLORS[i].hi)
        return SCALE_COLORS[i].ink;
    }
    return BURGUNDY;
  }

  var pillarModel = window.PPD_MODEL.pillars;

  // ── Shared drawing helpers ────────────────────────────────────────────────

  function setFont(style, size, color) {
    var parts = (style || "normal").split("-");
    var weight = parts[0] || "normal";
    var variant = parts[1] || "normal";
    doc.setFont("helvetica", weight === "bold" ? "bold" : "normal");
    if (size) doc.setFontSize(size);
    if (color) doc.setTextColor.apply(doc, color);
  }

  function fillRect(x, y, w, h, color, radius) {
    doc.setFillColor.apply(doc, color);
    if (radius) doc.roundedRect(x, y, w, h, radius, radius, "F");
    else        doc.rect(x, y, w, h, "F");
  }

  function strokeRect(x, y, w, h, color, lw, radius) {
    doc.setDrawColor.apply(doc, color);
    doc.setLineWidth(lw || 0.3);
    if (radius) doc.roundedRect(x, y, w, h, radius, radius, "S");
    else        doc.rect(x, y, w, h, "S");
  }

  function hRule(x, y, w, color, lw) {
    doc.setDrawColor.apply(doc, color || GRULE);
    doc.setLineWidth(lw || 0.3);
    doc.line(x, y, x + w, y);
  }

  function sectionHead(label, y) {
    setFont("bold", 7.5, NAVY);
    doc.text(label, ML, y);
    y += 1.5;
    hRule(ML, y, CW, GOLD, 1.0);
    return y + 3.5;
  }

  function textBlock(text, x, y, maxW, size, color, style) {
    setFont(style || "normal", size || 8, color || GDARK);
    var lines = doc.splitTextToSize(text, maxW);
    doc.text(lines, x, y);
    return lines.length * (size || 8) * 0.4 + 1;
  }

  // ── Header / Footer ───────────────────────────────────────────────────────

  function drawHeader(pageNum, firstPage) {
    fillRect(0, 0, PW, 14, NAVY);
    if (firstPage) {
      setFont("bold", 9, WHITE);
      doc.text("PAYMENTS FRANCHISE INDEX (PFI)", ML, 6.5);
      setFont("normal", 6.5, GOLD);
      doc.text("Operator-Grade Diagnostic", ML, 11.5);
    } else {
      setFont("bold", 7.5, WHITE);
      doc.text("PAYMENTS FRANCHISE INDEX (PFI)", ML, 6.5);
      setFont("normal", 6, [160, 175, 195]);
      doc.text("PFI Diagnostic Report", ML, 11.5);
    }
    // Page number — always shown on all pages
    setFont("normal", 7, GOLD);
    doc.text("Page " + pageNum + " of 4", PW - MR, 8.5, { align: "right" });
  }

  function drawFooter(pageNum, totalPages) {
    fillRect(0, PH - 10, PW, 10, NAVY);
    setFont("bold", 6, GOLD);
    doc.text("Payments Franchise Index (PFI) Diagnostic", ML, PH - 3.5);
    setFont("normal", 6, [143, 163, 177]);
    doc.text("carlosurena.com", PW - MR, PH - 3.5, { align: "right" });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — EXECUTIVE SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  drawHeader(1, true);
  drawFooter(1, 4);

  var y = 18;

  // ── Scenario + Score cards ────────────────────────────────────────────────
  var halfW = CW / 2 - 2;
  var cardH = 18;

  // Scenario card (left) — full name on one line at reduced font size
  fillRect(ML, y, halfW, cardH, GLIT, 2);
  setFont("bold", 5.5, GMID);
  doc.text("SCENARIO", ML + 3, y + 5);
  setFont("bold", 7, NAVY);
  // Always render full scenario name on one line — font sized to fit
  doc.text(sc.scenario_name, ML + 3, y + 12);

  // Score card (right) — score + /100 + label all comfortably visible
  var sx = ML + halfW + 4;
  var activeBand = SCALE_COLORS.find(function(b){ return r.overall >= b.lo && r.overall <= b.hi; }) || SCALE_COLORS[0];
  fillRect(sx, y, halfW, cardH, NAVY, 2);
  setFont("bold", 5.5, GOLD);
  doc.text("PFI SCORE", sx + 3, y + 5);
  setFont("bold", 18, WHITE);
  doc.text(String(r.overall), sx + 3, y + 13);
  setFont("normal", 10, [180, 190, 210]);
  doc.text("/ 100", sx + 3 + String(r.overall).length * 5, y + 13);
  // Use labelDark — lighter stop of same color ramp, readable on navy background
  setFont("bold", 8, activeBand.labelDark);
  doc.text(sc.label, sx + 3, y + 16.5);

  y += cardH + 5;
  hRule(ML, y, CW, GOLD, 1.2);
  y += 4;

  // ── Benchmark Insight ─────────────────────────────────────────────────────
  y = sectionHead("BENCHMARK INSIGHT", y);
  setFont("normal", 7.5, GDARK);   // font BEFORE split
  var biLines = doc.splitTextToSize(sc.benchmark_insight, CW);
  doc.text(biLines, ML, y);
  y += biLines.length * 3.4 + 5;

  // ── PFI Classification Scale ──────────────────────────────────────────────
  y = sectionHead("PFI CLASSIFICATION SCALE", y);
  y += 1.0;  // small gap after gold rule
  var scaleRowH = 6.0;
  SCALE_COLORS.forEach(function(band) {
    var isActive = r.overall >= band.lo && r.overall <= band.hi;
    var rowMid = y + scaleRowH / 2;
    var textBaseline = rowMid + 1.5;          // text baseline
    var capTop = textBaseline + 1.94;          // top of 8pt capitals (cap_height ≈ 1.94mm)
    var descender = 0.5;                       // below baseline

    // Box/badge spans cap_top+pad above to baseline-descender-pad below
    var boxPad = 1.1;                          // mm padding above and below text
    var boxTop = capTop + boxPad;
    var boxBot = textBaseline - descender - boxPad;
    var badgeH = boxTop - boxBot;
    var boxY = boxBot;                         // jsPDF y is top edge

    // Highlight box — fully encloses text
    if (isActive) {
      fillRect(ML - 1, boxY, CW + 2, badgeH, [245, 238, 238], 1.5);
    }
    // Color square — top edge at capTop
    doc.setFillColor.apply(doc, band.ink);
    doc.rect(ML, capTop - 2.8, 2.8, 2.8, "F");
    // Label text
    doc.setFont("helvetica", "normal");  // same weight all rows
    doc.setFontSize(8);
    doc.setTextColor.apply(doc, NAVY);  // always navy, no active distinction
    doc.text(band.label, ML + 4.5, textBaseline);
    // Range text
    setFont("normal", 7, GMID);
    doc.text(band.lo + " \u2013 " + band.hi, ML + 38, textBaseline);
    // YOUR SCORE badge — color matches the active tier
    if (isActive) {
      fillRect(ML + 52, boxY, 26, badgeH, band.ink, 1.5);
      setFont("bold", 5.5, WHITE);
      var badgeMid = boxY + badgeH / 2;
      doc.text("YOUR SCORE", ML + 65, badgeMid + 1.0, { align: "center" });
    }
    y += scaleRowH;
  });
  y += 4;

  // ── Pillar Heatmap ────────────────────────────────────────────────────────
  y = sectionHead("PILLAR HEATMAP", y);
  y += 1; // padding below rule so first bar clears it

  var nameColW = 46;
  var wtColW   = 8;
  var barX     = ML + nameColW + wtColW + 6;   // extra gap after %
  var barMaxW  = CW - nameColW - wtColW - 18;
  var barH     = 3.6;
  var hmRowH   = 5.8;

  pillarModel.forEach(function(p) {
    var ps = r.pillarScores[p.id].score5;
    var midY = y + hmRowH / 2;

    setFont("normal", 7.5, GDARK);
    doc.text(p.name, ML, midY + 1.5);
    setFont("normal", 6.5, GMID);
    doc.text(Math.round(p.weight * 100) + "%", ML + nameColW + 4, midY + 1.5);

    // bar track
    fillRect(barX, midY - barH / 2, barMaxW, barH, [232, 234, 236], 1.5);
    // bar fill
    var fillW = Math.max((ps / 5) * barMaxW, 1.5);
    doc.setFillColor.apply(doc, SCORE_R);
    doc.roundedRect(barX, midY - barH / 2, fillW, barH, 1.5, 1.5, "F");

    // score label
    var scoreStr = ps.toFixed(1) + "/5";
    setFont("bold", 6.5, GDARK);
    doc.text(scoreStr, barX + barMaxW + 2, midY + 1.5);

    y += hmRowH;
  });
  y += 4;

  // ── Key Structural Issues ─────────────────────────────────────────────────
  y = sectionHead("KEY STRUCTURAL ISSUES", y);
  sc.key_issues.forEach(function(issue) {
    setFont("normal", 7.5, GDARK);   // font BEFORE split
    var issueLines = doc.splitTextToSize(issue, CW - 5);
    // dot aligned to first line
    doc.setFillColor.apply(doc, BURGUNDY);
    doc.circle(ML + 1.5, y + 3 - 2.0, 1.2, "F");
    doc.text(issueLines, ML + 4.5, y + 3);
    y += issueLines.length * 3.5 + 2;
  });
  y += 2;

  // ── Immediate Focus ───────────────────────────────────────────────────────
  setFont("normal", 7.5, WHITE);   // font BEFORE split
  var focusLines = doc.splitTextToSize(sc.immediate_focus, CW - 6);
  var focusH = focusLines.length * 3.8 + 10;
  fillRect(ML, y, CW, focusH, NAVY, 2);
  fillRect(ML, y, 2, focusH, GOLD);
  setFont("bold", 6.5, GOLD);
  doc.text("IMMEDIATE FOCUS", ML + 4, y + 5.5);
  setFont("normal", 7.5, WHITE);
  doc.text(focusLines, ML + 4, y + 10);

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — WHAT DROVE YOUR SCORE + EXECUTIVE DIAGNOSIS
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader(2, false);
  drawFooter(2, 4);
  y = 18;

  y = sectionHead("WHAT DROVE YOUR SCORE", y);

  // 6 pillar cards — 2 column grid, FIXED height per card (brief requirement)
  var cardColW  = CW / 2 - 1.5;
  var cardGap   = 3;
  var colX      = [ML, ML + cardColW + cardGap];
  var colY      = [y, y];
  var cardHdrH  = 6;
  var pCardH    = 36;   // fixed height — all 6 cards identical (increased for 7.5pt body text)

  pillarModel.forEach(function(p, idx) {
    var cx = colX[idx % 2];
    var cy = colY[idx % 2];
    var commentary = sc.pillar_commentary[p.id] || "";
    var ps = r.pillarScores[p.id] ? r.pillarScores[p.id].score5 : 0;

    // Dynamic rating based on actual pillar score
    var rating;
    if      (ps < 2.0) rating = { label: "CRITICAL",   color: SCORE_R           };
    else if (ps < 3.0) rating = { label: "DEVELOPING",  color: [184, 92,  26]   };
    else if (ps < 4.0) rating = { label: "PROGRESSING", color: [138, 115, 24]   };
    else if (ps < 5.0) rating = { label: "STRONG",      color: [30,  107, 60]   };
    else               rating = { label: "OPTIMIZED",   color: [20,  82,  48]   };

    // Card background — fixed dimensions, accent bar uses rating color
    fillRect(cx, cy, cardColW, pCardH, [253, 254, 254], 2);
    strokeRect(cx, cy, cardColW, pCardH, GRULE, 0.3, 2);
    fillRect(cx, cy, 2.5, pCardH, rating.color);

    // Header row
    var hdrMid = cy + cardHdrH / 2;
    setFont("normal", 5.8, GMID);
    doc.text("Weight: " + Math.round(p.weight * 100) + "%", cx + 4, hdrMid + 1);
    // Dynamic rating pill
    var pillW = rating.label.length > 8 ? 20 : 15;
    fillRect(cx + cardColW - pillW - 1, hdrMid - 2, pillW, 4, rating.color, 1.5);
    setFont("bold", 5, WHITE);
    doc.text(rating.label, cx + cardColW - pillW/2 - 1, hdrMid + 0.8, { align: "center" });
    hRule(cx + 3, cy + cardHdrH, cardColW - 5, GRULE, 0.3);

    // Pillar name
    setFont("bold", 7.5, NAVY);
    doc.text(p.name, cx + 4, cy + cardHdrH + 5);

    // Commentary — font set BEFORE split, text clipped to card bottom
    setFont("normal", 7.5, GDARK);
    var cLines = doc.splitTextToSize(commentary, cardColW - 8);
    var maxLines = Math.floor((pCardH - cardHdrH - 10) / 3.9);  // 7.5pt leading, 36mm card
    doc.text(cLines.slice(0, maxLines), cx + 4, cy + cardHdrH + 9.5);

    colY[idx % 2] += pCardH + 2;
  });

  y = Math.max(colY[0], colY[1]) + 4;
  hRule(ML, y, CW, GRULE, 0.3);
  y += 4;

  // Executive Diagnosis
  setFont("bold", 10, NAVY);
  doc.text("Executive Diagnosis", ML, y);
  y += 5;

  setFont("normal", 7.5, GDARK);   // set font BEFORE measuring so splitTextToSize uses correct metrics
  var edLines = doc.splitTextToSize(sc.exec_diagnosis, CW);
  doc.text(edLines, ML, y);
  y += edLines.length * 3.6 + 5;

  // Structural issues — label dynamically matches scenario band
  var diagLabels = {
    "STRUCTURAL FAILURE":   { prefix: "STRUCTURAL ISSUE", color: SCORE_R         },
    "FRAGILE FRANCHISE":    { prefix: "PRIORITY AREA",    color: [184, 92,  26]  },
    "OPERATIONALLY STABLE": { prefix: "IMPROVEMENT AREA", color: [138, 115, 24]  },
    "STRATEGICALLY ALIGNED":{ prefix: "OPTIMIZATION AREA",color: [30,  107, 60]  },
    "BEST-IN-CLASS":        { prefix: "WATCH AREA",       color: [20,  82,  48]  },
  };
  var diagMeta = diagLabels[sc.label] || diagLabels["STRUCTURAL FAILURE"];
  var tagH = 4.5;
  sc.structural_issues.forEach(function(text, i) {
    var label = diagMeta.prefix + " " + (i + 1);
    var tagW = label.length > 16 ? 32 : 27;
    setFont("normal", 7.5, GDARK);   // set font before measuring
    var iLines = doc.splitTextToSize(text, CW - tagW - 5);
    var rowH = Math.max(iLines.length * 3.5, tagH) + 3;

    // pill
    fillRect(ML, y + rowH / 2 - tagH / 2, tagW, tagH, diagMeta.color, 1.5);
    setFont("bold", 5, WHITE);
    doc.text(label, ML + tagW / 2, y + rowH / 2 + 0.8, { align: "center" });

    // text
    setFont("normal", 7.5, GDARK);
    doc.text(iLines, ML + tagW + 3, y + (rowH - iLines.length * 3.5) / 2 + 3);

    y += rowH + 2;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — 90-DAY PRIORITIES
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader(3, false);
  drawFooter(3, 4);
  y = 18;

  y = sectionHead("90-DAY PRIORITIES", y);

  var usableH  = PH - 10 - y - 8;   // 8mm bottom margin — clear gap above footer
  var pGap     = 2;
  var pCardHt  = (usableH - pGap * 4) / 5;
  var badgeW   = 11;
  var labelX   = ML + badgeW + 4;
  var labelW   = CW - badgeW - 4;
  var LABELCOL = 12;            // fixed label column width (OWNER / KPI / WHY)
  var VALCOL_X = labelX + LABELCOL + 3; // value column always starts here
  var valW     = labelW - LABELCOL - 3 - 8;  // 8mm right margin — prevents bleed to card edge

  sc.priorities.forEach(function(pri, idx) {
    // Card
    fillRect(ML, y, CW, pCardHt, [253, 254, 254], 2);
    strokeRect(ML, y, CW, pCardHt, GRULE, 0.3, 2);

    // Navy left badge strip
    fillRect(ML, y, badgeW, pCardHt, NAVY, 2);
    doc.rect(ML + badgeW - 3, y, 3, pCardHt, "F");  // square right edge

    // Number centred in badge
    setFont("bold", 14, GOLD);
    doc.text(String(idx + 1), ML + badgeW / 2, y + pCardHt / 2 + 4, { align: "center" });

    // Title zone (top 28% of card)
    var titleZoneH = pCardHt * 0.28;
    setFont("bold", 7.5, NAVY);
    var titleLines = doc.splitTextToSize(pri.title, labelW - 2);
    doc.text(titleLines[0], labelX, y + titleZoneH / 2 + 2);
    if (titleLines.length > 1) doc.text(titleLines[1], labelX, y + titleZoneH / 2 + 5.5);
    hRule(labelX, y + titleZoneH, labelW, GRULE, 0.3);

    // Body — 3 equal rows: OWNER / KPI / WHY
    var bodyTop = y + titleZoneH + 1;
    var bodyBot = y + pCardHt - 1;
    var bodyH   = bodyBot - bodyTop;
    var rowH3   = bodyH / 3;

    var rows3 = [
      { label: "OWNER", value: pri.owner, color: NAVY    },
      { label: "KPI",   value: pri.kpi,   color: NAVY    },
      { label: "WHY",   value: pri.why,   color: GDARK   },
    ];

    rows3.forEach(function(row, ri) {
      var rowTop = bodyTop + ri * rowH3;
      var rowMid = rowTop + rowH3 / 2;

      // divider below rows 0 and 1
      if (ri < 2) hRule(labelX, rowTop + rowH3, labelW, [234, 236, 238], 0.2);

      // label — always at fixed x, centred in row
      setFont("bold", 5.5, GOLD);
      doc.text(row.label, labelX, rowMid + 1.5);

      // value — set font BEFORE wrap measurement so metrics are correct
      setFont("normal", 7.5, row.color);
      var vLines = doc.splitTextToSize(row.value, valW);
      var textBlockH = vLines.length * 2.8;
      var textStartY = rowMid - textBlockH / 2 + 2.5;
      doc.text(vLines, VALCOL_X, textStartY);
    });

    y += pCardHt + pGap;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 4 — EXECUTION PLAN + STRATEGIC TAKEAWAY + CONTACT
  // ═══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawHeader(4, false);
  drawFooter(4, 4);
  y = 18;

  y = sectionHead("SUGGESTED 30 / 60 / 90 EXECUTION PLAN", y);

  // Three execution phase cards
  var phaseColW = (CW - 4) / 3;
  var phaseHdrH = 14;
  var phaseBodyH = 34;
  var phaseTotalH = phaseHdrH + phaseBodyH;
  var phaseColors = [NAVY, [26, 82, 118], [21, 67, 96]];

  sc.execution.forEach(function(phase, pi) {
    var px = ML + pi * (phaseColW + 2);

    // Card bg
    fillRect(px, y, phaseColW, phaseTotalH, [253, 254, 254], 3);
    strokeRect(px, y, phaseColW, phaseTotalH, GRULE, 0.3, 3);

    // Header band
    fillRect(px, y, phaseColW, phaseHdrH, phaseColors[pi], 3);
    doc.rect(px, y + phaseHdrH - 3, phaseColW, 3, "F"); // square bottom corners

    setFont("bold", 6.5, GOLD);
    doc.text(phase.period, px + 3, y + 6);
    setFont("bold", 8, WHITE);
    doc.text(phase.title, px + 3, y + 11.5);

    // Bullets
    var by = y + phaseHdrH + 5;
    phase.items.forEach(function(item) {
      // set font before measuring so wrap uses correct metrics
      setFont("normal", 7.5, GDARK);
      var iLines = doc.splitTextToSize(item, phaseColW - 8);
      // dot centre = first line baseline minus ~half cap height (6.5pt * 0.35 ≈ 2.3)
      var firstBaseline = by + 2.5;
      doc.setFillColor.apply(doc, GOLD);
      doc.circle(px + 3, firstBaseline - 0.2, 1.2, "F");  // lowered to align with first text line
      doc.text(iLines, px + 6, firstBaseline);
      by += iLines.length * 3 + 3;
    });
  });

  y += phaseTotalH + 8;

  // Timeline note
  setFont("normal", 6.5, GMID);
  doc.text("Execution sequence \u2014 stabilize before you scale", PW / 2, y, { align: "center" });
  y += 3;
  hRule(ML, y, CW, GRULE, 0.3);
  y += 5;

  // Strategic Takeaway — dynamic height so long text never clips
  setFont("normal", 7.5, WHITE);   // font BEFORE split
  var stLines = doc.splitTextToSize(sc.strategic_takeaway, CW - 8);
  var stH = stLines.length * 4.2 + 16;  // 4.2mm per line + label + padding
  fillRect(ML, y, CW, stH, NAVY, 3);
  fillRect(ML, y, 2.5, stH, GOLD);
  setFont("bold", 6, GOLD);
  doc.text("STRATEGIC TAKEAWAY", ML + 5, y + 6);
  setFont("normal", 7.5, WHITE);
  doc.text(stLines, ML + 5, y + 11);
  y += stH + 5;

  // PPD Engagement Note
  var noteText =
    "Payments Franchise Index (PFI) Diagnostic Engagement — " +
    "This model expands into a structured review using your actual transaction data, pricing records, " +
    "and corridor economics \u2014 producing a Corridor Profitability Map, Portfolio Scorecard, " +
    "and Infrastructure Cost Stack.";
  setFont("normal", 7.5, GDARK);   // font BEFORE split
  var noteLines = doc.splitTextToSize(noteText, CW - 8);
  var noteH = noteLines.length * 3.5 + 10;
  fillRect(ML, y, CW, noteH, [244, 246, 248], 2);
  fillRect(ML, y, 2.5, noteH, GOLD);
  setFont("normal", 7.5, GDARK);
  doc.text(noteLines, ML + 5, y + 6);
  y += noteH + 5;

  // Contact
  hRule(ML, y, CW, GRULE, 0.3);
  y += 5;

  setFont("bold", 9, NAVY);
  doc.text("Questions About Your Results", ML, y);
  y += 5;

  setFont("bold", 8, GDARK);
  doc.text("Carlos Ure\u00f1a", ML, y);
  y += 4;
  setFont("normal", 7.5, GMID);
  doc.text("Payments Strategy & Commercialization", ML, y);
  y += 4;
  setFont("bold", 7.5, GOLD);
  doc.text("urena.m.carlos@gmail.com", ML, y);
  setFont("normal", 7.5, GMID);
  doc.text("  \u00b7  carlosurena.com", ML + 40, y);

  // ── Save ──────────────────────────────────────────────────────────────────
  doc.save("Payments-Franchise-Index-PFI-Diagnostic.pdf");
}


    // ── Event listeners ───────────────────────────────────────────────────

    els.btnStart?.addEventListener("click", () => {
      document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" });
    });
    els.btnReset?.addEventListener("click", resetAll);
    els.btnResetResults?.addEventListener("click", resetAll);
    els.btnCopy2?.addEventListener("click", exportPDF);
    els.btnCompute?.addEventListener("click", () => computeAndShow(false));
    els.btnCopy?.addEventListener("click", exportPDF);
    els.btnDownloadReport?.addEventListener("click", exportPDF);

    // Email me a copy — copies shareable link, tracks event
    els.btnEmailCopy?.addEventListener("click", () => {
      if (!state.lastResult) return;
      const url = buildShareURL();
      const confirm = document.getElementById("emailConfirm");
      navigator.clipboard.writeText(url).then(() => {
        if (confirm) { confirm.style.display = "inline"; setTimeout(() => { confirm.style.display = "none"; }, 3000); }
      }).catch(() => { prompt("Copy this link to share via email:", url); });
      if (window.CUA) window.CUA.trackEvent("pfi_email_copy_requested", {
        pfi_score: state.lastResult.overall,
        pfi_score_band: window.CUA.scoreBand(state.lastResult.overall)
      });
    });

    // ── Share link ────────────────────────────────────────────────────────

    const Q_ORDER = ["RA1","RA2","RA3","RA4","RA5","RA6","RA7",
                     "GE1","GE2","GE3","GE4","GE5","GE6","GE7",
                     "MC1","MC2","MC3","MC4","MC5","MC6","MC7",
                     "MR1","MR2","MR3","MR4","MR5","MR6","MR7",
                     "BL1","BL2","BL3","BL4","BL5","BL6","BL7",
                     "GO1","GO2","GO3","GO4","GO5","GO6","GO7"];

    function encodeAnswers(answers) {
      const raw = Q_ORDER.map((id) => {
        const v = answers[id];
        return (v !== undefined && v !== null) ? String(Math.round(v)) : "-";
      }).join("");
      return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    }

    function decodeAnswers(param) {
      try {
        const padded = param.replace(/-/g, "+").replace(/_/g, "/");
        const pad = padded.length % 4 ? padded + "=".repeat(4 - padded.length % 4) : padded;
        const raw = atob(pad);
        if (raw.length !== 42) return null;
        const answers = {};
        Q_ORDER.forEach((id, i) => {
          if (raw[i] !== "-") answers[id] = parseInt(raw[i], 10);
        });
        return answers;
      } catch(e) { return null; }
    }

    function buildShareURL() {
      const param = encodeAnswers(state.answers);
      const url = window.location.origin + window.location.pathname + "?r=" + param + "#results";
      return url;
    }

    const btnShare = document.getElementById("btnShareLink");
    if (btnShare) {
      btnShare.addEventListener("click", () => {
        const url = buildShareURL();
        navigator.clipboard.writeText(url).then(() => {
          const orig = btnShare.textContent;
          btnShare.textContent = "Link copied!";
          setTimeout(() => { btnShare.textContent = orig; }, 2000);
        }).catch(() => {
          prompt("Copy this link:", url);
        });
      });
    }

    // ── Init ──────────────────────────────────────────────────────────────

    renderScenarios();
    renderPillars();

    // Auto-load from URL param — inside initApp so state is in scope
    (function() {
      const urlParam = new URLSearchParams(window.location.search).get("r");
      if (!urlParam) return;
      try {
        const padded = urlParam.replace(/-/g, "+").replace(/_/g, "/");
        const pad = padded.length % 4 ? padded + "=".repeat(4 - padded.length % 4) : padded;
        const raw = atob(pad);
        if (raw.length !== 42) return;
        const Q_ORDER_SHARE = ["RA1","RA2","RA3","RA4","RA5","RA6","RA7",
                               "GE1","GE2","GE3","GE4","GE5","GE6","GE7",
                               "MC1","MC2","MC3","MC4","MC5","MC6","MC7",
                               "MR1","MR2","MR3","MR4","MR5","MR6","MR7",
                               "BL1","BL2","BL3","BL4","BL5","BL6","BL7",
                               "GO1","GO2","GO3","GO4","GO5","GO6","GO7"];
        const decoded = {};
        Q_ORDER_SHARE.forEach((id, i) => {
          if (raw[i] !== "-") decoded[id] = parseInt(raw[i], 10);
        });
        if (Object.keys(decoded).length < 10) return;
        state.answers = decoded;
        renderPillars();
        setTimeout(() => {
          computeAndShow(true);
        }, 500);
      } catch(e) { console.warn("[PPD] Share URL decode failed", e); }
    })();

    return true;
  }

  function boot(retries = 40) {
    const ok = initApp();
    if (ok) return;
    if (retries <= 0) {
      console.error("[PPD] Failed to initialize after retries.");
      return;
    }
    setTimeout(() => boot(retries - 1), 50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => boot());
  } else {
    boot();
  }
})();
