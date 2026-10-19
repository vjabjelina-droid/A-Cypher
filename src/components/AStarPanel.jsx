import AdjacencyList from "./AdjacencyList.jsx";
import AdjacencyMatrix from "./AdjacencyMatrix.jsx";

export default function AStarPanel({
  vertices,
  adj,
  matrix,
  res,
  upTo,
  cur,
  done,
  start,
  goal,
  onStepChange,
}) {
  return (
    <section className="panel">
      <h2>
        <span className="num">3</span>Run A*
      </h2>
      <input
        type="range"
        min="0"
        max={res.steps.length}
        value={upTo}
        onChange={(e) => onStepChange(+e.target.value)}
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
      <AdjacencyList vertices={vertices} adj={adj} />
      <AdjacencyMatrix vertices={vertices} matrix={matrix} />
    </section>
  );
}
