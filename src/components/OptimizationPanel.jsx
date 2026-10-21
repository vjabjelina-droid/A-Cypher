import { useState, useCallback } from "react";
import { geneticBlockOptimizer } from "../algorithms.js";

const DEFAULT_TEXT =
  "the quick brown fox jumps over the lazy dog. " +
  "Pack my box with five dozen liquor jugs. " +
  "How vexingly quick daft zebras jump!";

export default function OptimizationPanel() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [generations, setGenerations] = useState(30);
  const [popSize, setPopSize] = useState(16);
  const [maxBlock, setMaxBlock] = useState(50);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const run = useCallback(() => {
    setRunning(true);
    // Run in next tick so UI updates first
    setTimeout(() => {
      const res = geneticBlockOptimizer(text, maxBlock, generations, popSize);
      setResult(res);
      setRunning(false);
    }, 10);
  }, [text, maxBlock, generations, popSize]);

  const maxFit = result
    ? Math.max(...result.history.map((h) => h.bestFit), 0.001)
    : 1;

  return (
    <section className="panel feat-panel">
      <h2><span className="num">C</span>Optimization — Genetic Algorithm</h2>
      <p className="hint">
        A genetic algorithm evolves a population of <strong>Huffman block sizes</strong> to
        find the setting that yields the best compression ratio. Each chromosome is a
        single integer (block size); fitness = 1 − compression ratio.
      </p>

      <label className="lbl" htmlFor="ga-text">Input text</label>
      <textarea
        id="ga-text"
        rows={3}
        value={text}
        onChange={(e) => { setText(e.target.value); setResult(null); }}
        spellCheck={false}
      />

      {/* GA parameters */}
      <div className="row" style={{ marginTop: 10, gap: 18 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>Generations</span>
          <input
            type="number" min={5} max={100} value={generations}
            onChange={(e) => setGenerations(+e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>Population</span>
          <input
            type="number" min={4} max={60} value={popSize}
            onChange={(e) => setPopSize(+e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>Max block size</span>
          <input
            type="number" min={2} max={200} value={maxBlock}
            onChange={(e) => setMaxBlock(+e.target.value)}
            style={inputStyle}
          />
        </label>
        <button onClick={run} disabled={running} className="btn-accent" style={{ alignSelf: "flex-end" }}>
          {running ? "Evolving…" : "▶ Run GA"}
        </button>
      </div>

      {running && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, color: "var(--muted)", fontSize: "0.82rem" }}>
          <div className="ga-spinner" />
          Running {generations} generations × {popSize} individuals…
        </div>
      )}

      {result && (
        <>
          {/* Winner */}
          <div className="ga-winner" style={{ marginTop: 16 }}>
            <div className="ga-winner-label">🧬 Best Block Size Found</div>
            <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "var(--cyan)", margin: "8px 0" }}>
              {result.bestBlockSize}
            </div>
            <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
              characters per block → compression ratio{" "}
              <span style={{ color: "var(--amber)", fontWeight: 700 }}>
                {(result.bestRatio * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Fitness chart */}
          <h3 style={{ margin: "18px 0 8px" }}>Best Fitness per Generation</h3>
          <p className="hint">Higher bar = better compression found by that generation.</p>
          <div className="fitness-chart">
            {result.history.map((h, i) => {
              const pct = (h.bestFit / maxFit) * 100;
              return (
                <div
                  key={i}
                  className="fitness-bar-wrap"
                  title={`Gen ${h.gen}: blockSize=${h.bestBlockSize}, ratio=${(h.bestRatio * 100).toFixed(1)}%`}
                >
                  <div className="fitness-bar" style={{ height: `${pct}%` }} />
                  {i % Math.max(1, Math.floor(generations / 8)) === 0 && (
                    <span className="fitness-label">{h.gen}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* GA explanation */}
          <details style={{ marginTop: 14 }}>
            <summary>How the GA works</summary>
            <div style={{ marginTop: 10, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.7 }}>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li><strong style={{ color: "var(--text)" }}>Initialization</strong> — {popSize} random block sizes in [1, {maxBlock}]</li>
                <li><strong style={{ color: "var(--text)" }}>Fitness</strong> — run Huffman on each block and compute total ratio; lower ratio = higher fitness</li>
                <li><strong style={{ color: "var(--text)" }}>Elitism</strong> — top 2 individuals survive unchanged</li>
                <li><strong style={{ color: "var(--text)" }}>Tournament selection</strong> — best of 3 random candidates wins</li>
                <li><strong style={{ color: "var(--text)" }}>Arithmetic crossover</strong> — child = α·A + (1−α)·B</li>
                <li><strong style={{ color: "var(--text)" }}>Gaussian mutation</strong> — 20% chance of random perturbation</li>
                <li>Repeat for {generations} generations</li>
              </ol>
            </div>
          </details>
        </>
      )}
    </section>
  );
}

const inputStyle = {
  width: 80,
  background: "var(--bg)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  borderRadius: 4,
  padding: "5px 8px",
  font: "inherit",
};
