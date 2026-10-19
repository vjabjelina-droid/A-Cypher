import { useMemo, useState } from "react";
import {
  DEFAULT_GRAPH,
  KEY,
  ALPHABET,
  encrypt,
  decrypt,
  parseGraph,
  buildAdj,
  buildMatrix,
  aStar,
} from "./lib.js";

const show = (c) => (c === "\n" ? "\u21B5" : c === " " ? "\u2423" : c);

function Cipher({ text, setText }) {
  const cipher = useMemo(() => encrypt(text), [text]);
  const [n, setN] = useState(0);
  const k = Math.min(n, cipher.length);
  return (
    <section className="panel">
      <h2>
        <span className="num">1</span>Decrypt the file
      </h2>
      <p className="hint">
        The file on disk is a substitution cipher. Drag to decrypt it character
        by character.
      </p>
      <input
        type="range"
        min="0"
        max={cipher.length}
        value={k}
        onChange={(e) => setN(+e.target.value)}
        aria-label="Characters decrypted"
      />
      <pre className="stream" aria-live="polite">
        <span className="plain">{decrypt(cipher.slice(0, k))}</span>
        <span className="amber">{cipher.slice(k)}</span>
      </pre>
      <label className="lbl" htmlFor="ct">
        graph_encrypted.txt (editable)
      </label>
      <textarea
        id="ct"
        className="amber"
        rows={3}
        value={cipher}
        onChange={(e) => {
          setText(decrypt(e.target.value));
          setN(e.target.value.length);
        }}
      />
      <details>
        <summary>
          Substitution key ({ALPHABET.length} symbols, seed 1234)
        </summary>
        <div className="keygrid">
          {[...ALPHABET].map((p, i) => (
            <div key={i}>
              <b>{show(p)}</b>
              <i>{show(KEY[i])}</i>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}

function GraphView({ g, adj, res, upTo, start, goal }) {
  const { vertices, edges, h } = g;
  const W = 520,
    H = 400,
    R = 150;
  const pos = Object.fromEntries(
    vertices.map((v, i) => {
      const a = (2 * Math.PI * i) / vertices.length - Math.PI / 2;
      return [v, [W / 2 + R * 1.15 * Math.cos(a), H / 2 + R * Math.sin(a)]];
    }),
  );
  const done = upTo >= res.steps.length;
  const cur = upTo > 0 ? res.steps[upTo - 1] : null;
  const seen = new Set(res.steps.slice(0, upTo).map((s) => s.v));
  const pathEdges = new Set();
  if (done && res.path)
    res.path
      .slice(1)
      .forEach((v, i) => pathEdges.add([res.path[i], v].sort().join()));
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="graph"
      role="img"
      aria-label="Graph"
    >
      {edges.map(([a, b, w], i) => {
        const [x1, y1] = pos[a],
          [x2, y2] = pos[b];
        const on = pathEdges.has([a, b].sort().join());
        return (
          <g key={i}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={on ? "edge on" : "edge"}
            />
            <text
              x={(x1 + x2) / 2}
              y={(y1 + y2) / 2}
              className="w"
              textAnchor="middle"
              dy="-4"
            >
              {w}
            </text>
          </g>
        );
      })}
      {vertices.map((v) => {
        const [x, y] = pos[v];
        const onPath = done && res.path?.includes(v);
        const cls = [
          "node",
          seen.has(v) && "seen",
          onPath && "path",
          cur?.v === v && !done && "cur",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <g key={v}>
            <circle cx={x} cy={y} r="22" className={cls} />
            <text x={x} y={y} textAnchor="middle" dy="5" className="nl">
              {v}
            </text>
            <text x={x} y={y + 38} textAnchor="middle" className="hv">
              h={h[v] ?? 0}
            </text>
            {v === start && (
              <text x={x} y={y - 29} textAnchor="middle" className="tag">
                start
              </text>
            )}
            {v === goal && (
              <text x={x} y={y - 29} textAnchor="middle" className="tag">
                goal
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function App() {
  const [text, setText] = useState(DEFAULT_GRAPH);
  const g = useMemo(() => parseGraph(text), [text]);
  const adj = useMemo(() => buildAdj(g.edges, g.vertices), [g]);
  const matrix = useMemo(() => buildMatrix(g.edges, g.vertices), [g]);
  const [s, setS] = useState("A"),
    [t, setT] = useState("F");
  const start = g.vertices.includes(s) ? s : g.vertices[0];
  const goal = g.vertices.includes(t) ? t : g.vertices.at(-1);
  const res = useMemo(
    () =>
      start && goal
        ? aStar(adj, g.h, start, goal)
        : { steps: [], path: null, order: [] },
    [adj, g, start, goal],
  );
  const [step, setStep] = useState(99);
  const upTo = Math.min(step, res.steps.length);
  const cur = upTo > 0 ? res.steps[upTo - 1] : null;
  const done = upTo >= res.steps.length && res.steps.length > 0;

  return (
    <>
      <header>
        <h1>A* on an Encrypted Graph</h1>
        <p>
          Logic midterm project. Decrypt the file, build the graph, search it.
        </p>
      </header>
      <main>
        <Cipher text={text} setText={setText} />

        <section className="panel wide">
          <h2>
            <span className="num">2</span>Build the graph
          </h2>
          <div className="row">
            <label>
              Start{" "}
              <select
                value={start}
                onChange={(e) => {
                  setS(e.target.value);
                  setStep(99);
                }}
              >
                {g.vertices.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Destination{" "}
              <select
                value={goal}
                onChange={(e) => {
                  setT(e.target.value);
                  setStep(99);
                }}
              >
                {g.vertices.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <button
              onClick={() => {
                setText(DEFAULT_GRAPH);
                setS("A");
                setT("F");
                setStep(99);
              }}
            >
              Reset graph
            </button>
          </div>
          <GraphView
            g={g}
            adj={adj}
            res={res}
            upTo={upTo}
            start={start}
            goal={goal}
          />
          <label className="lbl" htmlFor="pt">
            graph_data.txt (editable, re-encrypts live)
          </label>
          <textarea
            id="pt"
            rows={9}
            value={text}
            spellCheck="false"
            onChange={(e) => {
              setText(e.target.value);
              setStep(99);
            }}
          />
          {!g.vertices.length && (
            <p className="err">
              No vertices found. Check the # EDGES and # HEURISTICS headers.
            </p>
          )}
        </section>

        <section className="panel">
          <h2>
            <span className="num">3</span>Run A*
          </h2>
          <input
            type="range"
            min="0"
            max={res.steps.length}
            value={upTo}
            onChange={(e) => setStep(+e.target.value)}
            aria-label="A* step"
          />
          <p className="hint">
            Step {upTo} of {res.steps.length}
          </p>
          {cur && (
            <div className="step">
              <b>Expand {cur.v}</b>{" "}
              <span>
                g={cur.g}, f={cur.f}
                {cur.stale && " (stale, skipped)"}
              </span>
              <div className="queue">
                Open:{" "}
                {cur.open.length
                  ? cur.open.map((o) => `${o.v}(f=${o.f})`).join("  ")
                  : "empty"}
              </div>
            </div>
          )}
          <div className={"result" + (done ? " show" : "")}>
            {done &&
              (res.path ? (
                <>
                  <b>{res.path.join(" \u2192 ")}</b>
                  <br />
                  Total cost {res.cost}
                  <br />
                  <small>Expanded: {res.order.join(", ")}</small>
                </>
              ) : (
                <b>
                  No path between {start} and {goal}.
                </b>
              ))}
          </div>
          <h3>Adjacency list</h3>
          <pre className="mono">
            {g.vertices
              .map(
                (v) =>
                  `${v}: ` + adj[v].map(([n, w]) => `(${n},${w})`).join(" "),
              )
              .join("\n")}
          </pre>
          <h3>Adjacency matrix</h3>
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th />
                  {g.vertices.map((v) => (
                    <th key={v}>{v}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.vertices.map((v, i) => (
                  <tr key={v}>
                    <th>{v}</th>
                    {matrix[i].map((x, j) => (
                      <td key={j} className={x ? "nz" : ""}>
                        {x}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
