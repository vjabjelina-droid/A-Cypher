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

export default function App() {
  const [text, setText] = useState(DEFAULT_GRAPH);
  const g = useMemo(() => parseGraph(text), [text]);
  const adj = useMemo(() => buildAdj(g.edges, g.vertices), [g]);
  const matrix = useMemo(() => buildMatrix(g.edges, g.vertices), [g]);
  const [s, setS] = useState("A");
  const [t, setT] = useState("F");

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

  const handleResetGraph = () => {
    setText(DEFAULT_GRAPH);
    setS("A");
    setT("F");
    setStep(99);
  };

  const handleTextChange = (newText) => {
    setText(newText);
    setStep(99);
  };

  const handleSelectStart = (newStart) => {
    setS(newStart);
    setStep(99);
  };

  const handleSelectGoal = (newGoal) => {
    setT(newGoal);
    setStep(99);
  };

  return (
    <>
      <Header />
      <main>
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
      </main>
    </>
  );
}
