import { useState, useCallback } from "react";
import { kmpSearch } from "../algorithms.js";

const SAMPLES = [
  {
    label: "English prose",
    text: "the quick brown fox jumps over the lazy dog. the dog barked at the fox and the fox ran away quickly.",
    pattern: "the",
  },
  {
    label: "DNA sequence",
    text: "ATCGATCGATCGAAGCTTGCATGCCTGCAGGTCGACATCGATCGATCG",
    pattern: "ATCG",
  },
  {
    label: "Graph edge list",
    text: "A B 5\nA C 2\nB D 4\nC D 7\nC E 3\nD E 1\nD F 6\nE F 5",
    pattern: "D",
  },
];

/** Highlights all match positions inside the text string */
function Highlighted({ text, matches, patLen }) {
  if (!matches.length) return <span style={{ color: "var(--muted)" }}>{text}</span>;
  const sorted = [...new Set(matches)].sort((a, b) => a - b);
  const parts = [];
  let last = 0;
  for (const i of sorted) {
    if (i < last) continue;
    parts.push(<span key={`pre-${i}`}>{text.slice(last, i)}</span>);
    parts.push(
      <mark key={`m-${i}`}>{text.slice(i, i + patLen)}</mark>
    );
    last = i + patLen;
  }
  parts.push(<span key="tail">{text.slice(last)}</span>);
  return <>{parts}</>;
}

export default function PatternMatchPanel() {
  const [text, setText] = useState(SAMPLES[0].text);
  const [pattern, setPattern] = useState(SAMPLES[0].pattern);
  const [result, setResult] = useState(null);

  const loadSample = (idx) => {
    setText(SAMPLES[idx].text);
    setPattern(SAMPLES[idx].pattern);
    setResult(null);
  };

  const run = useCallback(() => {
    if (!pattern) return;
    const t0 = performance.now();
    const res = kmpSearch(text, pattern);
    const ms = performance.now() - t0;
    setResult({ ...res, ms });
  }, [text, pattern]);

  return (
    <section className="panel feat-panel">
      <h2><span className="num">A</span>Pattern Matching — KMP</h2>
      <p className="hint">
        Knuth-Morris-Pratt searches for a pattern in O(n + m) time using a
        precomputed <em>failure table</em> to avoid redundant comparisons.
      </p>

      {/* Sample loader */}
      <div className="row" style={{ marginBottom: 12 }}>
        {SAMPLES.map((s, i) => (
          <button key={i} onClick={() => loadSample(i)} className="sample-btn">
            {s.label}
          </button>
        ))}
      </div>

      <label className="lbl" htmlFor="pm-text">Text (corpus)</label>
      <textarea
        id="pm-text"
        rows={4}
        value={text}
        onChange={(e) => { setText(e.target.value); setResult(null); }}
        spellCheck={false}
      />

      <label className="lbl" htmlFor="pm-pat">Pattern</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          id="pm-pat"
          type="text"
          value={pattern}
          onChange={(e) => { setPattern(e.target.value); setResult(null); }}
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
        <button onClick={run} className="btn-accent">Search (KMP)</button>
      </div>

      {result && (
        <>
          {/* Stats row */}
          <div className="stat-row" style={{ marginTop: 16 }}>
            <div className="stat-box">
              <span className="stat-label">Matches found</span>
              <span className="stat-val amber">{result.matches.length}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Comparisons</span>
              <span className="stat-val">{result.comparisons.toLocaleString()}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Time</span>
              <span className="stat-val cyan">{result.ms.toFixed(3)} ms</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Text length</span>
              <span className="stat-val">{text.length} chars</span>
            </div>
          </div>

          {/* Match positions */}
          {result.matches.length > 0 && (
            <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 8 }}>
              Positions:{" "}
              <span style={{ color: "var(--amber)" }}>
                {result.matches.slice(0, 20).join(", ")}
                {result.matches.length > 20 ? ` … (+${result.matches.length - 20} more)` : ""}
              </span>
            </p>
          )}

          {/* Highlighted text */}
          <h3>Highlighted matches</h3>
          <pre className="stream">
            <Highlighted text={text} matches={result.matches} patLen={pattern.length} />
          </pre>

          {/* Failure table */}
          <details style={{ marginTop: 14 }}>
            <summary>KMP Failure Table (preprocessing step)</summary>
            <p className="hint" style={{ marginTop: 8 }}>
              failure[i] = length of longest proper prefix of <code>pattern[0..i]</code> that is also a suffix.
              This allows KMP to skip characters instead of backtracking.
            </p>
            <div className="fail-table">
              {[...pattern].map((c, i) => (
                <div key={i} className="fail-cell">
                  <span className="fail-idx">{i}</span>
                  <span className="fail-char">{c === " " ? "⎵" : c}</span>
                  <span className="fail-val">{result.failTable[i]}</span>
                </div>
              ))}
            </div>
          </details>

          {result.matches.length === 0 && (
            <p className="err" style={{ marginTop: 12 }}>
              No occurrences of "{pattern}" found.
            </p>
          )}
        </>
      )}
    </section>
  );
}
