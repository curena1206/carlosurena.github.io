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

    function renderScenarios() {
      if (!els.scenarioContainer) return;
      els.scenarioContainer.innerHTML = "";

      const intro = document.createElement("div");
      intro.className = "scenario-intro";
      intro.innerHTML = `
        <div class="scenario-intro-text">
          <strong>Start with a scenario</strong> — or answer the questions fresh below.
          Each scenario pre-fills all 42 questions and computes results instantly,
          reflecting real portfolio situations encountered in practice.
        </div>
      `;
      els.scenarioContainer.appendChild(intro);

      const grid = document.createElement("div");
      grid.className = "scenario-grid";

      SCENARIOS.forEach((s) => {
        const card = document.createElement("div");
        card.className = `scenario-card ${state.activeScenario === s.id ? "scenario-active" : ""}`;

        card.innerHTML = `
          <div class="scenario-tag ${s.tagColor}">${s.tag}</div>
          <div class="scenario-title">${s.label}</div>
          <div class="scenario-desc">${s.description}</div>
          <button class="btn btn-scenario" data-scenario="${s.id}">
            Load scenario →
          </button>
        `;

        card.querySelector(".btn-scenario").addEventListener("click", () => {
          loadScenario(s.id);
        });

        grid.appendChild(card);
      });

      els.scenarioContainer.appendChild(grid);
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
        // Cap total penalty at 30 — prevents catastrophic scores zeroing out
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

      return { diag, diagSources, recIds };
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

    function renderPillarNarratives(pillarScores) {
      if (!els.pillarNarratives) return;
      els.pillarNarratives.innerHTML = "";
      pillars.forEach((p) => {
        const s = pillarScores[p.id].score5;
        const band = pillarBand(s);
        const narrative = PILLAR_NARRATIVES[p.id] && PILLAR_NARRATIVES[p.id][band];
        if (!narrative) return;

        const bandLabels = {
          critical:    "Critical",
          weak:        "Developing",
          developing:  "Progressing",
          strong:      "Strong",
          exceptional: "Optimized"
        };
        const bandClasses = {
          critical:    "pn-critical",
          weak:        "pn-weak",
          developing:  "pn-developing",
          strong:      "pn-strong",
          exceptional: "pn-exceptional"
        };

        const row = document.createElement("div");
        row.className = "pn-row";
        row.innerHTML = `
          <div class="pn-header">
            <span class="pn-name">${p.name}</span>
            <span class="pn-badge ${bandClasses[band]}">${bandLabels[band]}</span>
          </div>
          <div class="pn-text">${narrative}</div>
        `;
        els.pillarNarratives.appendChild(row);
      });
    }

    // ── Render: diagnosis with tier transparency ───────────────────────────

    const TIER_META = {
      1: { label: "Structural failure", cls: "tier-1" },
      2: { label: "Monetization gap",   cls: "tier-2" },
      3: { label: "Portfolio risk",      cls: "tier-3" },
    };

    function renderDiagnosis(diag, diagSources) {
      if (!els.diagnosisList) return;
      els.diagnosisList.innerHTML = "";
      diag.forEach((d, i) => {
        const src = diagSources[i];
        const meta = src ? TIER_META[src.tier] : null;
        const li = document.createElement("li");
        li.className = "diagnosis-item";
        li.innerHTML = `
          ${meta ? `<span class="diag-tier ${meta.cls}">${meta.label}</span>` : ""}
          <div class="diag-text">${d}</div>
        `;
        els.diagnosisList.appendChild(li);
      });
    }

    // ── Render: priorities ────────────────────────────────────────────────

    function renderPriorities(recIds) {
      if (!els.prioritiesList) return;
      els.prioritiesList.innerHTML = "";
      recIds.forEach((id, idx) => {
        const r = recommendations[id];
        if (!r) return;
        const box = document.createElement("div");
        box.className = "priority";
        box.innerHTML = `
          <div class="priority-num">${idx + 1}</div>
          <div class="priority-body">
            <div class="priority-title">${r.title}</div>
            <div class="priority-meta">Owner: ${r.owner} · KPI: ${r.metric}</div>
            <div class="priority-why">${r.why}</div>
          </div>
        `;
        els.prioritiesList.appendChild(box);
      });
    }

    // ── Render: 30/60/90 plan ─────────────────────────────────────────────

    function render3090(recIds) {
      if (!els.plan3090) return;
      const w0 = recIds.slice(0, 2).map((id) => recommendations[id]?.title).filter(Boolean);
      const w1 = recIds.slice(2, 4).map((id) => recommendations[id]?.title).filter(Boolean);
      const w2 = recIds.slice(4).map((id) => recommendations[id]?.title).filter(Boolean);

      function col(phase, title, items) {
        const ul = items.length
          ? `<ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul>`
          : `<div class="micro">No items.</div>`;
        return `
          <div class="plan-col">
            <div class="plan-phase">${phase}</div>
            <div class="plan-title">${title}</div>
            ${ul}
          </div>
        `;
      }

      els.plan3090.innerHTML = `
        ${col("Weeks 1–2", "Stabilize & measure", w0)}
        ${col("Weeks 3–6", "Fix leakage & align levers", w1)}
        ${col("Weeks 7–12", "Scale the winners", w2)}
      `;
    }

    // ── Render: results ───────────────────────────────────────────────────

    function renderResults(result) {
      if (els.resultsEmpty) els.resultsEmpty.classList.add("hidden");
      if (els.resultsContainer) els.resultsContainer.classList.remove("hidden");

      if (els.overallScore) els.overallScore.textContent = result.overall;
      if (els.maturityLabel) els.maturityLabel.textContent = maturityLabel(result.overall);
      if (els.badgeMonetization) els.badgeMonetization.textContent = `Monetization: ${result.sub.monetization}/100`;
      if (els.badgeMargin) els.badgeMargin.textContent = `Margin durability: ${result.sub.margin}/100`;
      if (els.badgeReadiness) els.badgeReadiness.textContent = `Strategic readiness: ${result.sub.readiness}/100`;

      renderHeatmap(result.pillarScores);
      renderPillarNarratives(result.pillarScores);
      renderDiagnosis(result.rules.diag, result.rules.diagSources);
      renderPriorities(result.rules.recIds);
      render3090(result.rules.recIds);
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

    function exportPDF() {
      if (!state.lastResult) return;
      const r = state.lastResult;
      if (!window.jspdf) { alert("PDF library not loaded. Please refresh and try again."); return; }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

      const PAGE_W  = 215.9;
      const PAGE_H  = 279.4;
      const ML = 16, MR = 16;
      const CW = PAGE_W - ML - MR;

      const NAVY       = [15,  31,  61 ];
      const GOLD       = [183, 136, 44 ];
      const GOLD_LIGHT = [245, 236, 215];
      const SLATE      = [74,  85,  104];
      const SLATE_2    = [113, 128, 150];
      const WHITE      = [255, 255, 255];
      const SOFT       = [247, 249, 252];
      const LINE       = [226, 232, 240];
      const GREEN      = [22,  101, 52 ];
      const GREEN_BG   = [240, 253, 244];
      const YELLOW     = [146, 64,  14 ];
      const YELLOW_BG  = [255, 251, 235];
      const RED        = [155, 28,  28 ];
      const RED_BG     = [255, 245, 245];
      const GREY_BG    = [241, 245, 249];

      const TIER_META = {
        1: { label: "STRUCTURAL FAILURE", bg: RED_BG,    ink: RED    },
        2: { label: "MONETIZATION GAP",   bg: YELLOW_BG, ink: YELLOW },
        3: { label: "PORTFOLIO RISK",      bg: GREY_BG,   ink: SLATE  },
      };

      const bandLabelsPDF = {
        critical: "CRITICAL", weak: "DEVELOPING", developing: "PROGRESSING",
        strong: "STRONG", exceptional: "OPTIMIZED"
      };
      const bandColorsPDF = {
        critical:    { bg: RED_BG,          ink: RED              },
        weak:        { bg: YELLOW_BG,        ink: YELLOW           },
        developing:  { bg: [224,242,254],    ink: [12,74,110]      },
        strong:      { bg: GREEN_BG,         ink: GREEN            },
        exceptional: { bg: [243,232,255],    ink: [88,28,135]      }
      };

      // PFI Score band classification
      function pfiBand(score) {
        if (score <= 25) return { label: "STRUCTURAL FAILURE",   ink: RED,    bg: RED_BG    };
        if (score <= 50) return { label: "FRAGILE FRANCHISE",    ink: YELLOW, bg: YELLOW_BG };
        if (score <= 70) return { label: "OPERATIONALLY STABLE", ink: [12,74,110], bg: [224,242,254] };
        if (score <= 85) return { label: "STRATEGICALLY ALIGNED",ink: GREEN,  bg: GREEN_BG  };
        return                   { label: "BEST-IN-CLASS",        ink: [88,28,135], bg: [243,232,255] };
      }

      // Benchmark insight by band
      function benchmarkInsight(score) {
        if (score <= 25) return "At this level, payments franchises typically experience margin compression driven by repair costs, pricing leakage, and absent portfolio governance. Stabilization programs focus first on pricing discipline and operational control before growth initiatives can gain traction.";
        if (score <= 50) return "The franchise generates revenue but the economics are fragile. Margin durability depends heavily on a single revenue lever or a small client set. Pricing governance and corridor-level visibility are the highest-leverage improvement areas.";
        if (score <= 70) return "Core mechanics are functioning, but pricing discipline, corridor strategy, or rail economics are not yet fully aligned. The franchise is stable but leaving margin on the table through structural gaps that grow with volume.";
        if (score <= 85) return "Governance and monetization discipline are strong. Remaining gains typically come from corridor optimization, rail strategy, and deepening balance sheet linkage across the client base.";
        return "The franchise operates with strong economic discipline across pricing, infrastructure, and portfolio management. Focus shifts to defending margin integrity and extracting the final layer of portfolio optimization.";
      }

      const activeScenario = SCENARIOS.find((s) => s.id === state.activeScenario);
      const pillarModel = window.PPD_MODEL.pillars;
      const totalPages = 4;

      function drawHeader() {
        doc.setFillColor(...NAVY);
        doc.rect(0, 0, PAGE_W, 20, "F");
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.5);
        doc.line(0, 20, PAGE_W, 20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(...WHITE);
        doc.text("Payments Franchise Index", ML, 8.5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(180, 190, 210);
        doc.text("Operator-grade diagnostic  ·  carlosurena.com", ML, 15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...WHITE);
        doc.text("Carlos Urena", PAGE_W - MR, 8.5, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(180, 190, 210);
        doc.text("Payments Strategy & Commercialization", PAGE_W - MR, 15, { align: "right" });
      }

      function drawFooter(pageNum) {
        doc.setFillColor(...NAVY);
        doc.rect(0, PAGE_H - 10, PAGE_W, 10, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        doc.setTextColor(...WHITE);
        doc.text("Carlos Urena  ·  urena.m.carlos@gmail.com  ·  carlosurena.com", ML, PAGE_H - 3.5);
        doc.setTextColor(150, 165, 195);
        doc.text("No data stored  ·  Runs in browser", PAGE_W - MR, PAGE_H - 3.5, { align: "right" });
        doc.setTextColor(180, 195, 220);
        doc.text("Page " + pageNum + " of " + totalPages, PAGE_W / 2, PAGE_H - 3.5, { align: "center" });
      }

      function sectionLabel(label, y) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...GOLD);
        doc.text(label, ML, y);
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.2);
        doc.line(ML + 34, y - 1, ML + CW, y - 1);
        return y + 5;
      }

      // ── PAGE 1: Executive Summary Dashboard ──────────────────────────────
      drawHeader();
      drawFooter(1);
      let y = 25;

      // Page title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...NAVY);
      doc.text("Diagnostic Report", ML, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...SLATE);
      doc.text("Payments Franchise Index  ·  Executive Summary", ML, y + 6);
      y += 13;

      // Scenario label
      if (activeScenario) {
        doc.setFillColor(...GOLD_LIGHT);
        doc.rect(ML, y, CW, 7, "F");
        doc.setFillColor(...GOLD);
        doc.rect(ML, y, 2.5, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6);
        doc.setTextColor(...GOLD);
        doc.text("SCENARIO", ML + 5, y + 4.8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 55, 10);
        doc.text(activeScenario.label, ML + 27, y + 4.8);
        y += 10;
      }

      // Score + classification block
      var band = pfiBand(r.overall);
      doc.setFillColor(...SOFT);
      doc.rect(ML, y, CW, 26, "F");
      doc.setFillColor(...GOLD);
      doc.rect(ML, y, 3, 26, "F");

      // Big score
      doc.setFont("helvetica", "bold");
      doc.setFontSize(38);
      doc.setTextColor(...NAVY);
      doc.text(String(r.overall), ML + 9, y + 19);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(...SLATE);
      doc.text("/100", ML + 30, y + 19);

      // Vertical divider
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.3);
      doc.line(ML + 52, y + 3, ML + 52, y + 23);

      // Classification badge
      doc.setFillColor.apply(doc, band.bg);
      doc.roundedRect(ML + 56, y + 3, 50, 7, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor.apply(doc, band.ink);
      doc.text(band.label, ML + 81, y + 8, { align: "center" });

      // Sub-scores — clean 3-column layout
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...SLATE);
      doc.text("Monetization", ML + 56, y + 16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...NAVY);
      doc.text(r.sub.monetization + "/100", ML + 56, y + 21);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...SLATE);
      doc.text("Margin durability", ML + 90, y + 16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...NAVY);
      doc.text(r.sub.margin + "/100", ML + 90, y + 21);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...SLATE);
      doc.text("Strategic readiness", ML + 128, y + 16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...NAVY);
      doc.text(r.sub.readiness + "/100", ML + 128, y + 21);

      y += 30;

      // Benchmark insight
      doc.setFillColor(245, 248, 252);
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.4);
      var insight = benchmarkInsight(r.overall);
      var insightLines = doc.splitTextToSize(insight, CW - 10);
      var insightH = insightLines.length * 3.8 + 8;
      doc.rect(ML, y, CW, insightH, "F");
      doc.rect(ML, y, 3, insightH, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(...GOLD);
      doc.text("BENCHMARK INSIGHT", ML + 6, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...SLATE);
      doc.text(insightLines, ML + 6, y + 9);
      y += insightH + 6;

      // Pillar heatmap with visual bars
      y = sectionLabel("PILLAR HEATMAP", y);
      const BAR_H = 8;
      const MAX_BAR_W = 50;

      pillarModel.forEach(function(p) {
        var s = r.pillarScores[p.id].score5;
        var bg, ink;
        if (s >= 4.0)      { bg = GREEN_BG;  ink = GREEN;  }
        else if (s >= 2.5) { bg = YELLOW_BG; ink = YELLOW; }
        else               { bg = RED_BG;    ink = RED;    }

        // Row background
        doc.setFillColor.apply(doc, bg);
        doc.rect(ML, y, CW, BAR_H, "F");

        // Pillar name
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor.apply(doc, NAVY);
        doc.text(p.name, ML + 3, y + 5.5);

        // Weight
        doc.setFontSize(6);
        doc.setTextColor.apply(doc, SLATE_2);
        doc.text(Math.round(p.weight * 100) + "%", ML + 92, y + 5.5);

        // Visual bar
        var barW = (s / 5) * MAX_BAR_W;
        doc.setFillColor(220, 225, 235);
        doc.rect(ML + 100, y + 2, MAX_BAR_W, 4, "F");
        doc.setFillColor.apply(doc, ink);
        if (barW > 0) doc.rect(ML + 100, y + 2, barW, 4, "F");

        // Score badge
        doc.setFillColor.apply(doc, ink);
        doc.roundedRect(ML + CW - 18, y + 1.5, 18, 5, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor.apply(doc, WHITE);
        doc.text(s.toFixed(1) + "/5", ML + CW - 9, y + 5.5, { align: "center" });

        y += BAR_H + 1;
      });

      y += 5;

      // Key structural issues — top 2 diagnosis items
      y = sectionLabel("KEY STRUCTURAL ISSUES", y);
      r.rules.diag.slice(0, 2).forEach(function(d, i) {
        var src = r.rules.diagSources ? r.rules.diagSources[i] : null;
        var meta = src ? TIER_META[src.tier] : null;
        var dlines = doc.splitTextToSize(d, CW - 8);
        var blockH = dlines.length * 3.6 + 7;

        doc.setFillColor(250, 251, 253);
        doc.rect(ML, y, CW, blockH, "F");
        if (meta) {
          doc.setFillColor.apply(doc, meta.ink);
          doc.rect(ML, y, 3, blockH, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.8);
        doc.setTextColor(55, 65, 81);
        doc.text(dlines, ML + 6, y + 5);
        y += blockH + 2;
      });

      y += 4;

      // Immediate focus CTA
      doc.setFillColor(...NAVY);
      doc.rect(ML, y, CW, 14, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...GOLD);
      doc.text("IMMEDIATE FOCUS", ML + 4, y + 5.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...WHITE);
      var focusText = r.overall <= 25
        ? "Restore pricing governance and operational discipline before pursuing growth. Growth amplifies margin leakage when the operating model is not ready."
        : r.overall <= 50
        ? "Stabilize margin through pricing governance and exception reduction. Monetization improvements depend on fixing structural cost and leakage first."
        : r.overall <= 70
        ? "Close the gap between revenue growth and volume growth. Pricing segmentation and corridor economics are the highest-leverage levers available."
        : "Optimize corridor economics and deepen balance sheet linkage. The operating foundation is strong — focus on extracting the remaining portfolio value.";
      var focusLines = doc.splitTextToSize(focusText, CW - 8);
      doc.text(focusLines, ML + 4, y + 10.5);
      y += 18;

      // ── PAGE 2: What Drove Your Score + Executive Diagnosis ──────────────
      doc.addPage();
      drawHeader();
      drawFooter(2);
      y = 26;

      y = sectionLabel("WHAT DROVE YOUR SCORE", y);

      pillarModel.forEach(function(p) {
        var s = r.pillarScores[p.id].score5;
        var band2 = s < 2.0 ? "critical" : s < 3.0 ? "weak" : s < 4.0 ? "developing" : s < 5.0 ? "strong" : "exceptional";
        var narrative = PILLAR_NARRATIVES[p.id] && PILLAR_NARRATIVES[p.id][band2];
        if (!narrative) return;

        var bc = bandColorsPDF[band2];
        var narLines = doc.splitTextToSize(narrative, CW - 36);
        var ROW_H = 5 + narLines.length * 3.6 + 4;

        doc.setFillColor(250, 251, 252);
        doc.rect(ML, y, CW, ROW_H, "F");
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.12);
        doc.line(ML, y + ROW_H, ML + CW, y + ROW_H);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...NAVY);
        doc.text(p.name, ML + 2, y + 5);

        doc.setFillColor.apply(doc, bc.bg);
        doc.roundedRect(ML + CW - 26, y + 1.5, 26, 4, 1, 1, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5);
        doc.setTextColor.apply(doc, bc.ink);
        doc.text(bandLabelsPDF[band2], ML + CW - 13, y + 4.5, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.8);
        doc.setTextColor(55, 65, 81);
        doc.text(narLines, ML + 2, y + 8.5);

        y += ROW_H + 1;
      });

      y += 5;

      // Executive Diagnosis
      y = sectionLabel("EXECUTIVE DIAGNOSIS", y);

      r.rules.diag.forEach(function(d, i) {
        var src  = r.rules.diagSources ? r.rules.diagSources[i] : null;
        var meta = src ? TIER_META[src.tier] : null;
        var dlines = doc.splitTextToSize((i + 1) + ".  " + d, CW - 6);
        var diagH = dlines.length * 3.8 + (meta ? 12 : 6);

        doc.setFillColor(250, 251, 252);
        doc.rect(ML, y, CW, diagH, "F");
        if (meta) {
          doc.setFillColor.apply(doc, meta.ink);
          doc.rect(ML, y, 3, diagH, "F");
        }

        var iy2 = y + 5;
        if (meta) {
          doc.setFillColor.apply(doc, meta.bg);
          doc.roundedRect(ML + 6, y + 2, 32, 4.5, 1, 1, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(5.5);
          doc.setTextColor.apply(doc, meta.ink);
          doc.text(meta.label, ML + 22, y + 5.2, { align: "center" });
          iy2 = y + 9;
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor.apply(doc, NAVY);
        doc.text(dlines, ML + 6, iy2);
        y += diagH + 3;
      });

      // ── PAGE 3: 90-Day Priorities ─────────────────────────────────────────
      doc.addPage();
      drawHeader();
      drawFooter(3);
      y = 26;

      y = sectionLabel("90-DAY PRIORITIES", y);

      r.rules.recIds.forEach(function(id, idx) {
        var rec = window.PPD_MODEL.recommendations[id];
        if (!rec) return;

        doc.setFontSize(8.5);
        var titleLines = doc.splitTextToSize(rec.title, CW - 20);
        doc.setFontSize(7);
        var ownerLines = doc.splitTextToSize("Owner: " + rec.owner, CW - 20);
        var kpiLines   = doc.splitTextToSize("KPI: " + rec.metric, CW - 20);
        var whyLines   = doc.splitTextToSize(rec.why, CW - 20);

        var ROW_H = 7
          + titleLines.length * 4.8
          + ownerLines.length * 3.8
          + kpiLines.length * 3.8
          + whyLines.length * 3.5
          + 6;

        doc.setFillColor(idx % 2 === 0 ? 247 : 255, idx % 2 === 0 ? 249 : 255, idx % 2 === 0 ? 252 : 255);
        doc.rect(ML, y, CW, ROW_H, "F");

        doc.setFillColor.apply(doc, GOLD);
        doc.rect(ML, y, 3, ROW_H, "F");

        // Number badge
        var badgeY = y + 4;
        doc.setFillColor.apply(doc, GOLD_LIGHT);
        doc.roundedRect(ML + 5, badgeY, 9, 9, 1.5, 1.5, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor.apply(doc, GOLD);
        doc.text(String(idx + 1), ML + 9.5, badgeY + 6.5, { align: "center" });

        var iy = y + 6;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor.apply(doc, NAVY);
        doc.text(titleLines, ML + 18, iy);
        iy += titleLines.length * 4.8 + 2;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor.apply(doc, SLATE);
        doc.text(ownerLines, ML + 18, iy);
        iy += ownerLines.length * 3.8 + 1;

        doc.setTextColor.apply(doc, SLATE_2);
        doc.text(kpiLines, ML + 18, iy);
        iy += kpiLines.length * 3.8 + 1;

        doc.setFont("helvetica", "italic");
        doc.setFontSize(6.5);
        doc.setTextColor(140, 155, 170);
        doc.text(whyLines, ML + 18, iy);

        y += ROW_H + 3;
      });

      // ── PAGE 4: Strategic Takeaway + Contact ─────────────────────────────
      doc.addPage();
      drawHeader();
      drawFooter(4);
      y = 26;

      // 30/60/90 plan
      y = sectionLabel("SUGGESTED 30 / 60 / 90-DAY EXECUTION PLAN", y);

      var phases = [
        { phase: "Days 1–30", title: "Stabilize & Measure", ids: r.rules.recIds.slice(0, 2) },
        { phase: "Days 31–60", title: "Fix Leakage & Align Levers", ids: r.rules.recIds.slice(2, 4) },
        { phase: "Days 61–90", title: "Scale the Winners", ids: r.rules.recIds.slice(4) }
      ];

      var colW = (CW - 8) / 3;
      var phaseX = [ML, ML + colW + 4, ML + (colW + 4) * 2];
      var phaseStartY = y;
      var maxPhaseH = 0;

      phases.forEach(function(ph, pi) {
        var px = phaseX[pi];
        var items = ph.ids.map(function(id) { return window.PPD_MODEL.recommendations[id]; }).filter(Boolean);
        var allText = items.map(function(r2) { return "• " + r2.title; }).join("
");
        var itemLines = [];
        items.forEach(function(r2) {
          var lines = doc.splitTextToSize("• " + r2.title, colW - 4);
          itemLines = itemLines.concat(lines);
        });
        var colH = 10 + itemLines.length * 3.6 + 6;
        maxPhaseH = Math.max(maxPhaseH, colH);

        doc.setFillColor(...NAVY);
        doc.rect(px, phaseStartY, colW, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...GOLD);
        doc.text(ph.phase, px + 3, phaseStartY + 5.5);

        doc.setFillColor(...SOFT);
        doc.rect(px, phaseStartY + 8, colW, colH - 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(...NAVY);
        doc.text(ph.title, px + 3, phaseStartY + 14);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...SLATE);
        doc.text(itemLines, px + 3, phaseStartY + 19);
      });

      y = phaseStartY + maxPhaseH + 14;

      // Strategic takeaway
      y = sectionLabel("STRATEGIC TAKEAWAY", y);

      var takeaway = r.overall <= 25
        ? "The immediate priority is restoring pricing governance and operational discipline. Without these controls in place, growth will amplify margin leakage rather than strengthen the franchise. Stabilization must come before expansion."
        : r.overall <= 50
        ? "The franchise has the volume to be profitable, but the commercial infrastructure to monetize it is incomplete. The priority is building pricing governance, corridor visibility, and portfolio management discipline — the systems that turn volume into durable margin."
        : r.overall <= 70
        ? "The franchise is operationally functional but leaving margin on the table through pricing exceptions, corridor gaps, and unoptimized rail economics. Closing these gaps does not require structural change — it requires governance and measurement discipline."
        : "The franchise has strong economic foundations. The remaining opportunity is in corridor-level optimization, balance sheet linkage, and ensuring the operating model can sustain performance as volume and complexity grow.";

      var takeLines = doc.splitTextToSize(takeaway, CW - 8);
      var takeH = takeLines.length * 3.8 + 10;
      doc.setFillColor(...NAVY);
      doc.rect(ML, y, CW, takeH, "F");
      doc.setFillColor(...GOLD);
      doc.rect(ML, y, 3, takeH, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...WHITE);
      doc.text(takeLines, ML + 7, y + 7);
      y += takeH + 10;

      // Contact block
      y = sectionLabel("QUESTIONS ABOUT YOUR RESULTS", y);

      doc.setFillColor(...SOFT);
      doc.rect(ML, y, CW, 28, "F");
      doc.setFillColor(...GOLD);
      doc.rect(ML, y, 3, 28, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...NAVY);
      doc.text("Carlos Urena", ML + 8, y + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE);
      doc.text("Payments Strategy & Commercialization", ML + 8, y + 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...GOLD);
      doc.text("urena.m.carlos@gmail.com", ML + 8, y + 20);
      doc.text("carlosurena.com", ML + 8, y + 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...SLATE_2);
      var contactNote = "The Payments Franchise Diagnostic engagement expands this model into a structured review using your actual transaction data, pricing records, and corridor economics — producing a Corridor Profitability Map, Portfolio Scorecard, and Infrastructure Cost Stack.";
      var contactLines = doc.splitTextToSize(contactNote, CW / 2 - 4);
      doc.text(contactLines, ML + CW / 2 + 4, y + 6);

      // Save
      doc.save("Payments-Franchise-Index-Diagnostic.pdf");
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
