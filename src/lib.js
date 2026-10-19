// Direct port of cipher.py + main.py. KEY is the exact output of
// random.Random(1234).shuffle(ALPHABET) from the Python project.
export const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 \n#.-_";
export const KEY =
  "NzZ0DkKSMTVXYhcb1Q-7j wrmtUvRaICo9lui\n_fg.H#8Jd6enp52y3BPWxGFsqELAO4";

const ENC = {},
  DEC = {};
[...ALPHABET].forEach((p, i) => {
  ENC[p] = KEY[i];
  DEC[KEY[i]] = p;
});
export const encrypt = (t) => [...t].map((c) => ENC[c] ?? c).join("");
export const decrypt = (t) => [...t].map((c) => DEC[c] ?? c).join("");

export const DEFAULT_GRAPH = `# EDGES
A B 5
A C 2
B D 4
C D 7
C E 3
D E 1
D F 6
E F 5

# HEURISTICS
A 7
B 6
C 5
D 3
E 2
F 0
`;

export function parseGraph(text) {
  const edges = [],
    h = {},
    set = new Set();
  let section = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#")) {
      const head = line.replace(/^#+/, "").trim().toUpperCase();
      if (head === "EDGES" || head === "HEURISTICS") section = head;
      continue;
    }
    const p = line.split(/\s+/);
    if (section === "EDGES" && p.length === 3 && !isNaN(+p[2])) {
      edges.push([p[0], p[1], +p[2]]);
      set.add(p[0]);
      set.add(p[1]);
    } else if (section === "HEURISTICS" && p.length === 2 && !isNaN(+p[1])) {
      h[p[0]] = +p[1];
      set.add(p[0]);
    }
  }
  return { edges, h, vertices: [...set].sort() };
}

export function buildAdj(edges, vertices) {
  const adj = Object.fromEntries(vertices.map((v) => [v, []]));
  edges.forEach(([a, b, w]) => {
    adj[a].push([b, w]);
    adj[b].push([a, w]);
  });
  Object.values(adj).forEach((l) => l.sort((x, y) => (x[0] < y[0] ? -1 : 1)));
  return adj;
}

export function buildMatrix(edges, vertices) {
  const ix = Object.fromEntries(vertices.map((v, i) => [v, i]));
  const m = vertices.map(() => vertices.map(() => 0));
  edges.forEach(([a, b, w]) => {
    m[ix[a]][ix[b]] = w;
    m[ix[b]][ix[a]] = w;
  });
  return m;
}

// Same algorithm as main.py a_star(), but records a snapshot per expansion.
export function aStar(adj, h, start, goal) {
  const open = [{ f: h[start] ?? 0, g: 0, v: start, path: [start] }];
  const best = { [start]: 0 },
    order = [],
    steps = [];
  while (open.length) {
    open.sort(
      (a, b) => a.f - b.f || a.g - b.g || (a.v < b.v ? -1 : a.v > b.v ? 1 : 0),
    );
    const n = open.shift();
    order.push(n.v);
    const stale = n.g > (best[n.v] ?? Infinity);
    if (n.v !== goal && !stale) {
      for (const [nb, w] of adj[n.v]) {
        const g = n.g + w;
        if (g < (best[nb] ?? Infinity)) {
          best[nb] = g;
          open.push({ f: g + (h[nb] ?? 0), g, v: nb, path: [...n.path, nb] });
        }
      }
    }
    steps.push({
      v: n.v,
      g: n.g,
      f: n.f,
      path: n.path,
      stale,
      open: open.map((o) => ({ v: o.v, f: o.f, g: o.g })),
    });
    if (n.v === goal) return { path: n.path, cost: n.g, order, steps };
  }
  return { path: null, cost: Infinity, order, steps };
}
