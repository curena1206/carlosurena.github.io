// app.js
(() => {
  function initApp() {
    const model = window.PPD_MODEL;
    if (!model) {
      console.error("[PPD] window.PPD_MODEL is not available yet. Check that model.js is loading.");
      return false;
    }

    const { pillars, rules, recommendations, subScoreMap } = model;

    const els = {
      pillarsContainer: document.getElementById("pillarsContainer"),
      btnStart: document.getElementById("btnStart"),
      btnReset: document.getElementById("btnReset"),
      btnCompute: document.getElementById("btnCompute"),
      btnCopy: document.getElementById("btnCopy"),
      progressText: document.getElementById("progressText"),
      answeredText: document.getElementById("answeredText"),
      progressFill: document.getElementById("progressFill"),

      resultsEmpty: document.getElementById("resultsEmpty"),
      resultsContainer: document.getElementById("resultsContainer"),
      overallScore: document.getElementById("overallScore"),
      maturityLabel: document.getElementById("maturityLabel"),
      badgeMonetization: document.getElementById("badgeMonetization"),
      badgeMargin: document.getElementById("badgeMargin"),
      badgeReadiness: document.getElementById("badgeReadiness"),
      heatmap: document.getElementById("heatmap"),
      diagnosisList: document.getElementById("diagnosisList"),
      prioritiesList: document.getElementById("prioritiesList"),
      plan3090: document.getElementById("plan3090"),
    };

    // If the container is missing, don't crash silently.
    if (!els.pillarsContainer) {
      console.error("[PPD] pillarsContainer not found. Check index.html element IDs.");
      return true; // model exists; DOM mismatch is the issue
    }

    const state = {
      answers: {},
      lastResult: null,
    };

    function totalQuestions() {
      return pillars.reduce((sum, p) => sum + p.questions.length, 0);
    }

    function answeredCount() {
      return Object.keys(state.answers).length;
    }

    function pctComplete() {
      const total = totalQuestions();
      const answered = answeredCount();
      return total === 0 ? 0 : Math.round((answered / total) * 100);
    }

    function setProgress() {
      const pct = pctComplete();
      if (els.progressText) els.progressText.textContent = `${pct}% complete`;
      if (els.answeredText) els.answeredText.textContent = `${answeredCount()} answered`;
      if (els.progressFill) els.progressFill.style.width = `${pct}%`;
      if (els.btnCopy) els.btnCopy.disabled = !state.lastResult;
    }

    function maturityLabel(score100) {
      if (score100 >= 85) return "Enterprise-grade franchise";
      if (score100 >= 70) return "Growth-ready, monetization gaps";
      if (score100 >= 55) return "Volume-rich, margin-fragile";
      return "Structurally under-engineered";
    }

    function heatColor(score5) {
      if (score5 >= 4.0) return "hm-green";
      if (score5 >= 2.5) return "hm-yellow";
      return "hm-red";
    }

    function clamp(n, min, max) {
      return Math.max(min, Math.min(max, n));
    }

    function avg(arr) {
      if (!arr.length) return 0;
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

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
              <span class="dot">•</span>
              <span>${pillar.subtitle}</span>
            </div>
          </div>
          <div class="chev">▾</div>
        `;

        header.addEventListener("click", () => {
          wrap.classList.toggle("open");
        });

        const body = document.createElement("div");
        body.className = "pillar-body";

        pillar.questions.forEach((q) => {
          const qEl = document.createElement("div");
          qEl.className = "q";

          const optionsHtml = q.options
            .map((opt, i) => {
              const inputId = `${q.id}_${i}`;
              const checked = state.answers[q.id] === opt.score ? "checked" : "";
              return `
                <label class="option" for="${inputId}">
                  <input type="radio" name="${q.id}" id="${inputId}" value="${opt.score}" ${checked} />
                  <div>
                    <div class="option-label">${opt.label}</div>
                    <div class="option-sub">${opt.sub}</div>
                  </div>
                </label>
              `;
            })
            .join("");

          qEl.innerHTML = `
            <div class="q-title">${q.id}. ${q.title}</div>
            <div class="q-desc">${q.desc}</div>
            <div class="q-options">${optionsHtml}</div>
          `;

          qEl.querySelectorAll(`input[name="${q.id}"]`).forEach((radio) => {
            radio.addEventListener("change", (e) => {
              const val = Number(e.target.value);
              state.answers[q.id] = val;
              state.lastResult = null;
              if (els.btnCopy) els.btnCopy.disabled = true;
              setProgress();
            });
          });

          body.appendChild(qEl);
        });

        wrap.appendChild(header);
        wrap.appendChild(body);

        if (idx === 0) wrap.classList.add("open");
        els.pillarsContainer.appendChild(wrap);
      });

      setProgress();
    }

    function computePillarScores() {
      const out = {};
      pillars.forEach((p) => {
        const scores = [];
        p.questions.forEach((q) => {
          if (typeof state.answers[q.id] === "number") scores.push(state.answers[q.id]);
        });

        const score5 = avg(scores);
        out[p.id] = {
          score5,
          score100: score5 * 20,
          answered: scores.length,
          total: p.questions.length,
        };
      });
      return out;
    }

    function computeOverall(pillarScores) {
      let weighted = 0;
      pillars.forEach((p) => {
        const s = pillarScores[p.id].score5;
        weighted += (s / 5) * (p.weight * 100);
      });
      return clamp(Math.round(weighted), 0, 100);
    }

    function computeSubScores(pillarScores) {
      const sub = {};
      Object.keys(subScoreMap).forEach((k) => {
        const pillarIds = subScoreMap[k];
        const scores = pillarIds.map((pid) => (pillarScores[pid].score5 / 5) * 100);
        sub[k] = Math.round(avg(scores));
      });
      return sub;
    }

    function answersMapForRules() {
      const a = {};
      pillars.forEach((p) =>
        p.questions.forEach((q) => {
          a[q.id] = typeof state.answers[q.id] === "number" ? state.answers[q.id] : 0;
        })
      );
      return a;
    }

    function runRules(a) {
      const triggered = [];

      rules.forEach((r) => {
        try {
          if (r.when(a)) triggered.push(r);
        } catch (_) {}
      });

      if (triggered.length === 0) {
        triggered.push({
          id: "baseline_mixed",
          tier: 2,
          diagnosis:
            "Baseline portfolio profile is mixed; focus on the lowest-scoring pillar and establish KPI cadence.",
          recs: ["R19", "R20", "R8"],
        });
      }

      // Tier first. Within Tier 2, elevate monetization gap.
      triggered.sort((x, y) => {
        const tx = x.tier || 99;
        const ty = y.tier || 99;
        if (tx !== ty) return tx - ty;

        if (x.id === "monetization_capture_gap") return -1;
        if (y.id === "monetization_capture_gap") return 1;

        return 0;
      });

      // Diagnoses: top 3 unique
      const diag = [];
      for (const r of triggered) {
        if (diag.length >= 3) break;
        if (r.diagnosis && !diag.includes(r.diagnosis)) diag.push(r.diagnosis);
      }

      // Recommendations: balanced round-robin across triggered rules (max 5 unique)
      const recIds = [];
      let round = 0;

      while (recIds.length < 5) {
        let addedInRound = false;

        for (const r of triggered) {
          if (!r.recs || round >= r.recs.length) continue;
          const rec = r.recs[round];
          if (rec && !recIds.includes(rec)) {
            recIds.push(rec);
            addedInRound = true;
            if (recIds.length >= 5) break;
          }
        }

        if (!addedInRound) break;
        round++;
      }

      return { diag, recIds };
    }

    function renderHeatmap(pillarScores) {
      if (!els.heatmap) return;
      els.heatmap.innerHTML = "";
      pillars.forEach((p) => {
        const s = pillarScores[p.id].score5;
        const row = document.createElement("div");
        row.className = `hm-row ${heatColor(s)}`;

        row.innerHTML = `
          <div class="hm-left">
            <div class="hm-title">${p.name}</div>
            <div class="hm-sub">${Math.round(p.weight * 100)}% weight</div>
          </div>
          <div class="hm-score">${s.toFixed(1)} / 5.0</div>
        `;
        els.heatmap.appendChild(row);
      });
    }

    function renderDiagnosis(diag) {
      if (!els.diagnosisList) return;
      els.diagnosisList.innerHTML = "";
      diag.forEach((d) => {
        const li = document.createElement("li");
        li.textContent = d;
        els.diagnosisList.appendChild(li);
      });
    }

    function renderPriorities(recIds) {
      if (!els.prioritiesList) return;
      els.prioritiesList.innerHTML = "";
      recIds.forEach((id) => {
        const r = recommendations[id];
        if (!r) return;

        const box = document.createElement("div");
        box.className = "priority";
        box.innerHTML = `
          <div class="priority-title">${r.title}</div>
          <div class="priority-meta">Owner: ${r.owner} • KPI: ${r.metric}</div>
          <div class="priority-grid">
            <div class="kv"><div class="k">Why</div><div>${r.why}</div></div>
          </div>
        `;
        els.prioritiesList.appendChild(box);
      });
    }

    function render3090(recIds) {
      if (!els.plan3090) return;

      const w0 = recIds.slice(0, 2).map((id) => recommendations[id]?.title).filter(Boolean);
      const w1 = recIds.slice(2, 4).map((id) => recommendations[id]?.title).filter(Boolean);
      const w2 = recIds.slice(4, 5).map((id) => recommendations[id]?.title).filter(Boolean);

      function col(title, items) {
        const ul = items.length
          ? `<ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul>`
          : `<div class="micro">No items selected.</div>`;
        return `
          <div class="plan-col">
            <div class="plan-title">${title}</div>
            ${ul}
          </div>
        `;
      }

      els.plan3090.innerHTML = `
        ${col("Weeks 0–2: Stabilize & measure", w0)}
        ${col("Weeks 3–6: Fix leakage & align levers", w1)}
        ${col("Weeks 7–12: Scale the winners", w2)}
      `;
    }

    function renderResults(result) {
      if (els.resultsEmpty) els.resultsEmpty.classList.add("hidden");
      if (els.resultsContainer) els.resultsContainer.classList.remove("hidden");

      if (els.overallScore) els.overallScore.textContent = `${result.overall}`;
      if (els.maturityLabel) els.maturityLabel.textContent = maturityLabel(result.overall);

      if (els.badgeMonetization) els.badgeMonetization.textContent = `Monetization: ${result.sub.monetization}/100`;
      if (els.badgeMargin) els.badgeMargin.textContent = `Margin durability: ${result.sub.margin}/100`;
      if (els.badgeReadiness) els.badgeReadiness.textContent = `Strategic readiness: ${result.sub.readiness}/100`;

      renderHeatmap(result.pillarScores);
      renderDiagnosis(result.rules.diag);
      renderPriorities(result.rules.recIds);
      render3090(result.rules.recIds);
    }

    function computeAndShow() {
      const total = totalQuestions();
      const answered = answeredCount();
      if (answered < Math.min(10, total)) {
        alert("Add a few more answers before computing results (at least 10).");
        return;
      }

      const pillarScores = computePillarScores();
      const overall = computeOverall(pillarScores);
      const sub = computeSubScores(pillarScores);
      const a = answersMapForRules();
      const ruleOutput = runRules(a);

      const result = { pillarScores, overall, sub, rules: ruleOutput };
      state.lastResult = result;
      if (els.btnCopy) els.btnCopy.disabled = false;

      renderResults(result);
      const resultsEl = document.getElementById("results");
      if (resultsEl) resultsEl.scrollIntoView({ behavior: "smooth" });
    }

    function resetAll() {
      state.answers = {};
      state.lastResult = null;
      if (els.btnCopy) els.btnCopy.disabled = true;
      renderPillars();

      if (els.resultsEmpty) els.resultsEmpty.classList.remove("hidden");
      if (els.resultsContainer) els.resultsContainer.classList.add("hidden");
      const toolEl = document.getElementById("tool");
      if (toolEl) toolEl.scrollIntoView({ behavior: "smooth" });
    }

    function buildExecutiveSummary() {
      if (!state.lastResult) return "";
      const r = state.lastResult;

      const byWeak = pillars
        .map((p) => ({ name: p.name, score: r.pillarScores[p.id].score5 }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 2);

      const priorities = r.rules.recIds.map((id) => recommendations[id]?.title).filter(Boolean);

      return [
        `Payments Portfolio Diagnostic — Executive Summary`,
        ``,
        `Overall score: ${r.overall}/100 (${maturityLabel(r.overall)})`,
        `Sub-scores: Monetization ${r.sub.monetization}/100 • Margin durability ${r.sub.margin}/100 • Strategic readiness ${r.sub.readiness}/100`,
        ``,
        `Primary diagnosis:`,
        ...r.rules.diag.map((d) => `- ${d}`),
        ``,
        `Lowest pillars (focus areas):`,
        ...byWeak.map((x) => `- ${x.name}: ${x.score.toFixed(1)}/5.0`),
        ``,
        `Recommended 90-day priorities:`,
        ...priorities.map((p) => `- ${p}`),
        ``,
        `Note: V1 is scoped to commercial banking payments (ACH, wires, RTP/FedNow, cross-border, FX-enabled flows, liquidity overlays).`,
      ].join("\n");
    }

    async function copySummary() {
      const text = buildExecutiveSummary();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        alert("Executive summary copied to clipboard.");
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        alert("Executive summary copied (fallback).");
      }
    }

    if (els.btnStart) {
      els.btnStart.addEventListener("click", () => {
        const toolEl = document.getElementById("tool");
        if (toolEl) toolEl.scrollIntoView({ behavior: "smooth" });
      });
    }
    if (els.btnReset) els.btnReset.addEventListener("click", resetAll);
    if (els.btnCompute) els.btnCompute.addEventListener("click", computeAndShow);
    if (els.btnCopy) els.btnCopy.addEventListener("click", copySummary);

    renderPillars();
    return true;
  }

  // Wait for DOM, then wait for model (handles script-order issues)
  function boot(retries = 40) {
    const ok = initApp();
    if (ok) return;

    if (retries <= 0) {
      console.error("[PPD] Failed to initialize after retries. Likely model.js not loading or path mismatch.");
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
