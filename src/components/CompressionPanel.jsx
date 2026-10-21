import { useState, useCallback } from "react";
import { huffmanCompress } from "../algorithms.js";

const SAMPLES = [
  "the quick brown fox jumps over the lazy dog.",
  "aaaaabbbbbccccdddeeefffff",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.",
];

function RatioBar({ ratio }) {
  const pct = Math.min(ratio * 100, 100);
  const color =
    ratio < 0.6 ? "var(--green)" : ratio < 0.9 ? "var(--amber)" : "var(--red)";
  return (
    <div style={{ margin: "10px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 4 }}>
        <span style={{ color: "var(--muted)" }}>Compression ratio</span>
        <span style={{ color, fontWeight: 700 }}>
          {(ratio * 100).toFixed(1)}% of original
        </span>
      </div>
      <div style={{ background: "var(--line)", borderRadius: 4, height: 12, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            height: "100%",
            borderRadius: 4,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function CompressionPanel() {
  const [text, setText] = useState(SAMPLES[0]);
  const [result, setResult] = useState(null);

  const run = useCallback(() => {
    const t0 = performance.now();
    const res = huffmanCompress(text);
    const ms = performance.now() - t0;
    setResult({ ...res, ms });
  }, [text]);

  return (
    <section className="panel feat-panel">
      <h2><span className="num">B</span>Text Compression — Huffman Coding</h2>
      <p className="hint">
        Huffman coding assigns shorter binary codes to frequent characters and
        longer codes to rare ones, producing an optimal prefix-free encoding
        in O(n log n) time.
      </p>

      {/* Sample buttons */}
      <div className="row" style={{ marginBottom: 10 }}>
        {SAMPLES.map((s, i) => (
          <button key={i} onClick={() => { setText(s); setResult(null); }} className="sample-btn">
            Sample {i + 1}
          </button>
        ))}
      </div>

      <label className="lbl" htmlFor="comp-text">Input text</label>
      <textarea
        id="comp-text"
        rows={4}
        value={text}
        onChange={(e) => { setText(e.target.value); setResult(null); }}
        spellCheck={false}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
          Original: {text.length} chars = {text.length * 8} bits
        </span>
        <button onClick={run} className="btn-accent">Compress</button>
      </div>

      {result && (
        <>
          {/* Size stats */}
          <div className="stat-row" style={{ marginTop: 16 }}>
            <div className="stat-box">
              <span className="stat-label">Original size</span>
              <span className="stat-val">{result.originalBits} bits</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Compressed size</span>
              <span className="stat-val amber">{result.compressedBits} bits</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Saved</span>
              <span className="stat-val green">
                {result.originalBits - result.compressedBits} bits
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Build time</span>
              <span className="stat-val cyan">{result.ms.toFixed(3)} ms</span>
            </div>
          </div>

          <RatioBar ratio={result.ratio} />

          {/* Code table */}
          <h3>Huffman Code Table</h3>
          <p className="hint">
            Frequent characters get short codes; rare characters get long codes.
          </p>
          <div className="keygrid">
            {Object.entries(result.table)
              .sort((a, b) => a[1].length - b[1].length || (result.freq[b[0]] - result.freq[a[0]]))
              .map(([ch, code]) => (
                <div key={ch} title={`freq: ${result.freq[ch]}`}>
                  <b>{ch === "\n" ? "↵" : ch === " " ? "⎵" : ch}</b>
                  <i style={{ fontSize: "0.65rem", color: "var(--violet)" }}>{code}</i>
                  <span style={{ display: "block", color: "var(--muted)", fontSize: "0.6rem" }}>
                    ×{result.freq[ch]}
                  </span>
                </div>
              ))}
          </div>

          {/* Encoded output preview */}
          <details style={{ marginTop: 14 }}>
            <summary>Encoded bitstream (first 256 bits)</summary>
            <pre className="stream" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              {result.encoded.match(/.{1,8}/g)?.slice(0, 32).join(" ")}
              {result.encoded.length > 256 ? " …" : ""}
            </pre>
          </details>
        </>
      )}
    </section>
  );
}
