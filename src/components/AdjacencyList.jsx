export default function AdjacencyList({ vertices, adj }) {
  return (
    <>
      <h3>Adjacency list</h3>
      <pre className="mono">
        {vertices
          .map(
            (v) =>
              `${v}: ` + (adj[v] ? adj[v].map(([n, w]) => `(${n},${w})`).join(" ") : ""),
          )
          .join("\n")}
      </pre>
    </>
  );
}
