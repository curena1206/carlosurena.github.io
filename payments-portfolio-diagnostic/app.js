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
        // Revenue Architecture — growth present but capture lagging, FX weak
        RA1: 2, RA2: 2, RA3: 2, RA4: 2, RA5: 1, RA6: 2, RA7: 2,
        // Growth Engine — strong GTM, good pipeline, decent embed
        GE1: 4, GE2: 3, GE3: 3, GE4: 3, GE5: 4, GE6: 4, GE7: 3,
        // Margin & Cost — moderate exceptions, partial cost visibility
        MC1: 3, MC2: 3, MC3: 2, MC4: 2, MC5: 3, MC6: 2, MC7: 2,
        // Multi-Rail — some RTP, ISO in progress, corridor undefined
        MR1: 3, MR2: 2, MR3: 2, MR4: 2, MR5: 3, MR6: 3, MR7: 3,
        // Balance & Liquidity — balances exist but not monetized or priced
        BL1: 2, BL2: 2, BL3: 2, BL4: 1, BL5: 2, BL6: 3, BL7: 2,
        // Governance — some cadence, pricing partially controlled
        GO1: 3, GO2: 2, GO3: 2, GO4: 3, GO5: 3, GO6: 3, GO7: 3,
      }
    },
    {
      id: "mature_stress",
      label: "Mature Franchise — Readiness & Margin Stress Test",
      description: "A well-governed, well-run franchise facing rate cycle pressure and real-time rail gaps. Revenue mix is too dependent on balance income, RTP send is limited, and routing isn't optimized. Strong foundation — specific gaps.",
      tag: "Optimize & future-proof",
      tagColor: "tag-blue",
      answers: {
        // Revenue Architecture — strong mix but balance-heavy, FX embedded
        RA1: 2, RA2: 4, RA3: 4, RA4: 3, RA5: 4, RA6: 4, RA7: 4,
        // Growth Engine — mature, repeatable, deeply embedded
        GE1: 4, GE2: 4, GE3: 4, GE4: 4, GE5: 4, GE6: 4, GE7: 4,
        // Margin & Cost — strong but some leakage at edges
        MC1: 4, MC2: 4, MC3: 4, MC4: 3, MC5: 4, MC6: 4, MC7: 3,
        // Multi-Rail — limited RTP send, ISO implemented, routing partial
        MR1: 2, MR2: 4, MR3: 2, MR4: 4, MR5: 4, MR6: 4, MR7: 4,
        // Balance & Liquidity — high penetration, rate sensitivity not managed
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
      if (score100 >= 85) return "Enterprise-grade franchise";
      if (score100 >= 70) return "Growth-ready, monetization gaps";
      if (score100 >= 52) return "Volume-rich, margin-fragile";
      return "Structurally under-engineered — stabilize before scaling";
    }
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
        pillars.forEach((p) => {
          const { score5, answered } = pillarScores[p.id];
          if (answered >= 3 && score5 < threshold) composite -= penalty;
        });
      }
      return clamp(composite, 0, 100);
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
        `Payments Portfolio Diagnostic — Executive Summary`,
        `Built by Carlos Urena · linkedin.com/in/carlosurena`,
        ...scenarioNote,
        ``,
        `Overall score: ${r.overall}/100 (${maturityLabel(r.overall)})`,
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
        `Framework: V1 · Commercial banking payments`,
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

    // ── Event listeners ───────────────────────────────────────────────────

    els.btnStart?.addEventListener("click", () => {
      document.getElementById("tool")?.scrollIntoView({ behavior: "smooth" });
    });
    els.btnReset?.addEventListener("click", resetAll);
    els.btnCompute?.addEventListener("click", () => computeAndShow(false));
    els.btnCopy?.addEventListener("click", copySummary);

    // ── Init ──────────────────────────────────────────────────────────────

    renderScenarios();
    renderPillars();
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
