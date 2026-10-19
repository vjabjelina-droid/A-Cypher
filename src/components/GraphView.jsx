export default function GraphView({ g, res, upTo, start, goal }) {
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
