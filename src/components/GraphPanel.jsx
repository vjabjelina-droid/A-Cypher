import GraphView from "./GraphView.jsx";

export default function GraphPanel({
  g,
  res,
  upTo,
  start,
  goal,
  onSelectStart,
  onSelectGoal,
  onResetGraph,
  text,
  onTextChange,
}) {
  return (
    <section className="panel wide">
      <h2>
        <span className="num">2</span>Build the graph
      </h2>
      <div className="row">
        <label>
          Start{" "}
          <select
            value={start}
            onChange={(e) => onSelectStart(e.target.value)}
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
            onChange={(e) => onSelectGoal(e.target.value)}
          >
            {g.vertices.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <button onClick={onResetGraph}>Reset graph</button>
      </div>
      <GraphView
        g={g}
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
        onChange={(e) => onTextChange(e.target.value)}
      />
      {!g.vertices.length && (
        <p className="err">
          No vertices found. Check the # EDGES and # HEURISTICS headers.
        </p>
      )}
    </section>
  );
}
