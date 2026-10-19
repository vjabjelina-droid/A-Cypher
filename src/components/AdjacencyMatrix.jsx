export default function AdjacencyMatrix({ vertices, matrix }) {
  return (
    <>
      <h3>Adjacency matrix</h3>
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th />
              {vertices.map((v) => (
                <th key={v}>{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vertices.map((v, i) => (
              <tr key={v}>
                <th>{v}</th>
                {matrix[i]?.map((x, j) => (
                  <td key={j} className={x ? "nz" : ""}>
                    {x}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
