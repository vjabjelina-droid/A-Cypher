import { useState, useCallback } from "react";
import { randomizedQuickSort } from "../algorithms.js";

const PRESETS = [
  { label: "10 numbers", arr: [64, 34, 25, 12, 22, 11, 90] },
  { label: "20 numbers", arr: Array.from({ length: 20 }, () => Math.floor(Math.random() * 1000)) },
  { label: "50 numbers", arr: Array.from({ length: 50 }, () => Math.floor(Math.random() * 10000)) },
];

export default function ParallelRandomPanel() {
  const [input, setInput] = useState(PRESETS[0].arr.join(", "));
  const [result, setResult] = useState(null);

  const run = useCallback(() => {
    const arr = input
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n));
    if (arr.length < 2) return;

    // Run randomized and track a "deterministic" (always-first-pivot) count for comparison
    const t0 = performance.now();
    const res = randomizedQuickSort(arr);
    const ms = performance.now() - t0;

    // Theoretical expected comparisons for reference: n * log2(n) * 1.39
    const n = arr.length;
    const theoretical = Math.round(n * Math.log2(n) * 1.39);

    setResult({ ...res, ms, n, theoretical, original: arr });
  }, [input]);

  return (
    <section className="panel feat-panel">
      <h2><span className="num">D</span>Randomized Algorithm — QuickSort</h2>
      <p className="hint">
        Randomized QuickSort picks a <strong>random pivot</strong> at each recursive step.
        This prevents adversarial inputs from triggering the O(n²) worst case and
        guarantees <em>expected</em> O(n log n) performance regardless of input order.
      </p>

      {/* Why randomized? */}
      <div className="info-box" style={{ marginBottom: 16 }}>
        <strong style={{ color: "var(--cyan)" }}>Key insight:</strong>{" "}
        <span style={{ color: "var(--muted)" }}>
          With a fixed pivot (e.g., always the last element), a sorted array causes O(n²) comparisons.
          A random pivot reduces this probability to less than 1/n! — making worst case practically impossible.
        </span>
      </div>

      {/* Preset buttons */}
      <div className="row" style={{ marginBottom: 10 }}>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => { setInput(p.arr.join(", ")); setResult(null); }}
            className="sample-btn"
          >
            {p.label}
          </button>
        ))}
      </div>

      <label className="lbl" htmlFor="qs-input">Numbers to sort (comma or space separated)</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          id="qs-input"
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setResult(null); }}
          style={{
            flex: 1,
            background: "var(--bg)",
            color: "var(--text)",
            border: "1px solid var(--line)",
            borderRadius: 4,
            padding: "8px",
            font: "inherit",
          }}
        />
        <button onClick={run} className="btn-accent">Sort</button>
      </div>

      {result && (
        <>
          {/* Stats */}
          <div className="stat-row" style={{ marginTop: 16 }}>
            <div className="stat-box">
              <span className="stat-label">n (elements)</span>
              <span className="stat-val">{result.n}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Comparisons</span>
              <span className="stat-val amber">{result.comparisons.toLocaleString()}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Expected O(n log n)</span>
              <span className="stat-val muted">≈ {result.theoretical.toLocaleString()}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Time</span>
              <span className="stat-val cyan">{result.ms.toFixed(4)} ms</span>
            </div>
          </div>

          {/* Visual array bars */}
          <h3 style={{ marginTop: 16 }}>Input array</h3>
          <ArrayBars arr={result.original} color="var(--muted)" />

          <h3 style={{ marginTop: 12 }}>Sorted result</h3>
          <ArrayBars arr={result.sorted} color="var(--cyan)" />

          {/* Sorted numbers */}
          <pre className="stream" style={{ marginTop: 8, maxHeight: 80 }}>
            <span style={{ color: "var(--cyan)" }}>{result.sorted.join("  ")}</span>
          </pre>

          {/* Complexity explanation */}
          <details style={{ marginTop: 14 }}>
            <summary>Complexity analysis</summary>
            <div style={{ marginTop: 10, fontSize: "0.82rem", lineHeight: 1.8, color: "var(--muted)" }}>
              <table style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", color: "var(--muted)", fontWeight: 400 }}>Case</th>
                    <th style={{ textAlign: "left" }}>Time</th>
                    <th style={{ textAlign: "left" }}>Space</th>
                    <th style={{ textAlign: "left" }}>When</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: "var(--green)" }}>Best</td>
                    <td className="nz">O(n log n)</td>
                    <td>O(log n)</td>
                    <td>Pivot always splits evenly</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--amber)" }}>Average (expected)</td>
                    <td className="nz">O(n log n)</td>
                    <td>O(log n)</td>
                    <td>Random pivot — guaranteed</td>
                  </tr>
                  <tr>
                    <td style={{ color: "var(--red)" }}>Worst</td>
                    <td style={{ color: "var(--red)" }}>O(n²)</td>
                    <td style={{ color: "var(--red)" }}>O(n)</td>
                    <td>Probability &lt; 1/n! with random pivot</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}

/** Mini bar chart of an array */
function ArrayBars({ arr, color }) {
  const max = Math.max(...arr, 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 2,
        height: 60,
        background: "var(--bg)",
        border: "1px solid var(--line)",
        borderRadius: 4,
        padding: "6px 6px 0",
        overflow: "hidden",
      }}
    >
      {arr.map((v, i) => (
        <div
          key={i}
          title={v}
          style={{
            flex: 1,
            minWidth: 2,
            height: `${(v / max) * 100}%`,
            background: color,
            borderRadius: "2px 2px 0 0",
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}
