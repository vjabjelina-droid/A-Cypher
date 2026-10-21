import { useMemo, useState } from "react";
import {
  DEFAULT_GRAPH,
  parseGraph,
  buildAdj,
  buildMatrix,
  aStar,
} from "./lib.js";
import Header from "./components/Header.jsx";
import CipherPanel from "./components/CipherPanel.jsx";
import GraphPanel from "./components/GraphPanel.jsx";
import AStarPanel from "./components/AStarPanel.jsx";
import PatternMatchPanel from "./components/PatternMatchPanel.jsx";
import CompressionPanel from "./components/CompressionPanel.jsx";
import OptimizationPanel from "./components/OptimizationPanel.jsx";
import ParallelRandomPanel from "./components/ParallelRandomPanel.jsx";
import PerformancePanel from "./components/PerformancePanel.jsx";

const TABS = [
  { id: "graph",    label: "① Graph & A*",       icon: "⬡" },
  { id: "pattern",  label: "② Pattern Match",     icon: "🔍" },
  { id: "compress", label: "③ Compression",       icon: "📦" },
  { id: "optimize", label: "④ GA Optimizer",      icon: "🧬" },
  { id: "parallel", label: "⑤ Parallel/Random",   icon: "⚡" },
  { id: "perf",     label: "⑥ Performance",       icon: "📊" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("graph");

  // Graph / A* state
  const [text, setText] = useState(DEFAULT_GRAPH);
  const g = useMemo(() => parseGraph(text), [text]);
  const adj = useMemo(() => buildAdj(g.edges, g.vertices), [g]);
  const matrix = useMemo(() => buildMatrix(g.edges, g.vertices), [g]);
  const [s, setS] = useState("A");
  const [t, setT] = useState("F");

  const start = g.vertices.includes(s) ? s : g.vertices[0];
  const goal  = g.vertices.includes(t) ? t : g.vertices.at(-1);

  const res = useMemo(
    () =>
      start && goal
        ? aStar(adj, g.h, start, goal)
        : { steps: [], path: null, order: [] },
    [adj, g, start, goal],
  );

  const [step, setStep] = useState(99);
  const upTo = Math.min(step, res.steps.length);
  const cur  = upTo > 0 ? res.steps[upTo - 1] : null;
  const done = upTo >= res.steps.length && res.steps.length > 0;

  const handleResetGraph   = () => { setText(DEFAULT_GRAPH); setS("A"); setT("F"); setStep(99); };
  const handleTextChange   = (v) => { setText(v); setStep(99); };
  const handleSelectStart  = (v) => { setS(v); setStep(99); };
  const handleSelectGoal   = (v) => { setT(v); setStep(99); };

  return (
    <>
      <Header />

      {/* Tab bar */}
      <nav className="tab-nav" aria-label="Feature sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`tab-btn ${activeTab === tab.id ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main>
        {/* === Tab: Graph & A* (original 3-column layout) === */}
        {activeTab === "graph" && (
          <div className="graph-layout">
            <CipherPanel text={text} setText={setText} />
            <GraphPanel
              g={g}
              res={res}
              upTo={upTo}
              start={start}
              goal={goal}
              onSelectStart={handleSelectStart}
              onSelectGoal={handleSelectGoal}
              onResetGraph={handleResetGraph}
              text={text}
              onTextChange={handleTextChange}
            />
            <AStarPanel
              vertices={g.vertices}
              adj={adj}
              matrix={matrix}
              res={res}
              upTo={upTo}
              cur={cur}
              done={done}
              start={start}
              goal={goal}
              onStepChange={setStep}
            />
          </div>
        )}

        {/* === Tab: Pattern Matching === */}
        {activeTab === "pattern" && (
          <div className="single-layout">
            <PatternMatchPanel />
          </div>
        )}

        {/* === Tab: Compression === */}
        {activeTab === "compress" && (
          <div className="single-layout">
            <CompressionPanel />
          </div>
        )}

        {/* === Tab: Genetic Optimizer === */}
        {activeTab === "optimize" && (
          <div className="single-layout">
            <OptimizationPanel />
          </div>
        )}

        {/* === Tab: Parallel / Randomized === */}
        {activeTab === "parallel" && (
          <div className="single-layout">
            <ParallelRandomPanel />
          </div>
        )}

        {/* === Tab: Performance Analysis === */}
        {activeTab === "perf" && (
          <div className="single-layout">
            <PerformancePanel />
          </div>
        )}
      </main>
    </>
  );
}
