import { complexityTable } from "../algorithms.js";

const catColor = {
  "Graph Search":     "var(--amber)",
  "Pattern Matching": "var(--cyan)",
  "Compression":      "var(--violet)",
  "Optimization":     "var(--rose)",
  "Randomized":       "var(--green)",
};

export default function PerformancePanel() {
  return (
    <section className="panel feat-panel">
      <h2><span className="num">E</span>Performance Analysis</h2>
      <p className="hint">
        Time and space complexity of the five algorithms used in this system.
      </p>

      <div className="scroll" style={{ marginTop: 12 }}>
        <table className="complexity-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Category</th>
              <th>Best Case</th>
              <th>Average Case</th>
              <th>Worst Case</th>
              <th>Space</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {complexityTable.map((row) => (
              <tr key={row.name}>
                <td style={{ color: "var(--text)", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {row.name}
                </td>
                <td>
                  <span
                    className="cat-pill"
                    style={{
                      background: catColor[row.category] + "22",
                      color: catColor[row.category],
                    }}
                  >
                    {row.category}
                  </span>
                </td>
                <td style={{ color: "var(--green)" }}>{row.timeBest}</td>
                <td className="nz">{row.timeAvg}</td>
                <td style={{ color: "var(--red)" }}>{row.timeWorst}</td>
                <td style={{ color: "var(--amber)" }}>{row.space}</td>
                <td style={{ color: "var(--muted)", fontSize: "0.78rem", maxWidth: 260 }}>
                  {row.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-algorithm deep dives */}
      <div style={{ marginTop: 28 }}>
        {[
          {
            name: "KMP String Search",
            color: "var(--cyan)",
            points: [
              "Preprocessing: builds failure table in O(m) time and O(m) space.",
              "Search: scans text left-to-right exactly once — O(n) character comparisons.",
              "Total: O(n + m). Never backtracks in the text string.",
              "Space: O(m) for the failure array; O(1) extra during search.",
            ],
          },
          {
            name: "Huffman Coding",
            color: "var(--violet)",
            points: [
              "Frequency count: O(n) scan of input, n = text length.",
              "Tree build: O(k log k) using a min-heap, k = unique characters ≤ 256.",
              "Code assignment: O(k) tree traversal to assign variable-length codes.",
              "Encoding: O(n) to convert each character using the code table.",
              "Proven optimal: no prefix-free code achieves a shorter expected length.",
            ],
          },
          {
            name: "Genetic Algorithm",
            color: "var(--rose)",
            points: [
              "Each chromosome is one integer (block size). Fitness = 1 − Huffman ratio.",
              "Per generation: p fitness evaluations, each O(n log n) → total O(g·p·n log n).",
              "Space: O(p) for the population; O(n) per fitness call for the Huffman tree.",
              "Tournament selection is O(k) per parent; crossover and mutation O(1).",
            ],
          },
          {
            name: "Randomized QuickSort",
            color: "var(--green)",
            points: [
              "Random pivot choice makes all n! input permutations equally likely.",
              "Expected comparisons: 2n ln n ≈ 1.39 n log₂ n.",
              "Worst case O(n²) has probability < 1/n! — negligible in practice.",
              "Recursion depth: expected O(log n), worst-case O(n).",
            ],
          },
          {
            name: "A* Search",
            color: "var(--amber)",
            points: [
              "Maintains an open set sorted by f(n) = g(n) + h(n).",
              "With an admissible heuristic, finds the optimal path.",
              "Time and space both O(b^d) in the worst case.",
              "With a perfect heuristic, degrades to O(n) — linear in nodes.",
            ],
          },
        ].map(({ name, color, points }) => (
          <details key={name} style={{ marginBottom: 8 }}>
            <summary style={{ color }}>
              {name} — complexity deep dive
            </summary>
            <ul style={{ marginTop: 8, paddingLeft: 20, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.8 }}>
              {points.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
