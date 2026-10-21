// ============================================================
// 1. PATTERN MATCHING — Knuth-Morris-Pratt (KMP)
//    Time: O(n + m)  |  Space: O(m)
//    n = text length, m = pattern length
// ============================================================

/**
 * Builds the KMP failure (partial match) table for the pattern.
 * failure[i] = length of the longest proper prefix of pattern[0..i]
 * that is also a suffix.
 * Time: O(m)  Space: O(m)
 */
export function buildFailureTable(pattern) {
  const m = pattern.length;
  const fail = new Array(m).fill(0);
  let k = 0;
  for (let i = 1; i < m; i++) {
    while (k > 0 && pattern[k] !== pattern[i]) k = fail[k - 1];
    if (pattern[k] === pattern[i]) k++;
    fail[i] = k;
  }
  return fail;
}

/**
 * KMP string search.
 * Returns all starting indices where pattern occurs in text,
 * plus the number of character comparisons made.
 */
export function kmpSearch(text, pattern) {
  const n = text.length;
  const m = pattern.length;
  if (m === 0) return { matches: [], comparisons: 0, failTable: [] };

  const fail = buildFailureTable(pattern);
  const matches = [];
  let comparisons = 0;
  let q = 0; // characters matched so far

  for (let i = 0; i < n; i++) {
    while (q > 0 && pattern[q] !== text[i]) {
      comparisons++;
      q = fail[q - 1];
    }
    comparisons++;
    if (pattern[q] === text[i]) q++;
    if (q === m) {
      matches.push(i - m + 1);
      q = fail[q - 1];
    }
  }

  return { matches, comparisons, failTable: fail };
}

// ============================================================
// 2. TEXT COMPRESSION — Huffman Coding
//    Time: O(n log n)  |  Space: O(n)
//    n = number of unique characters in input
// ============================================================

/**
 * Builds a Huffman tree from character frequencies.
 * Uses a simple sorted-array min-heap.
 * Returns the root node of the tree.
 */
function buildHuffmanTree(freq) {
  // Each node: { ch, f, left, right }
  let heap = Object.entries(freq).map(([ch, f]) => ({
    ch,
    f,
    left: null,
    right: null,
  }));
  heap.sort((a, b) => a.f - b.f);

  while (heap.length > 1) {
    const left = heap.shift();
    const right = heap.shift();
    const parent = { ch: null, f: left.f + right.f, left, right };
    // Insert in sorted position
    let lo = 0,
      hi = heap.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (heap[mid].f < parent.f) lo = mid + 1;
      else hi = mid;
    }
    heap.splice(lo, 0, parent);
  }

  return heap[0] ?? null;
}

/**
 * Walks the Huffman tree to assign binary codes to each character.
 * Returns a map: { char -> binary string }
 */
function buildCodeTable(root) {
  const table = {};
  const walk = (node, code) => {
    if (!node) return;
    if (node.ch !== null) {
      table[node.ch] = code || "0"; // single-char edge case gets "0"
      return;
    }
    walk(node.left, code + "0");
    walk(node.right, code + "1");
  };
  walk(root, "");
  return table;
}

/**
 * Huffman compress a string.
 * Returns original bit count, compressed bit count, ratio, code table, and tree root.
 */
export function huffmanCompress(text) {
  if (!text) {
    return {
      originalBits: 0,
      compressedBits: 0,
      ratio: 1,
      table: {},
      tree: null,
      encoded: "",
    };
  }

  // Step 1 — frequency table
  const freq = {};
  for (const c of text) freq[c] = (freq[c] || 0) + 1;

  // Step 2 — build tree
  const tree = buildHuffmanTree(freq);

  // Step 3 — build code table
  const table = buildCodeTable(tree);

  // Step 4 — encode
  const encoded = [...text].map((c) => table[c]).join("");

  const originalBits = text.length * 8; // assuming 8-bit ASCII
  const compressedBits = encoded.length;
  const ratio = originalBits > 0 ? compressedBits / originalBits : 1;

  return { originalBits, compressedBits, ratio, table, tree, encoded, freq };
}

// ============================================================
// 3. OPTIMIZATION — Genetic Algorithm
//    Finds the best Huffman block-size setting to minimize
//    compressed output size on the given text.
//
//    Chromosome: integer blockSize in [1, maxBlock]
//    Fitness: compression ratio of splitting text into blocks
//             of that size, compressing each, summing bits.
//
//    Time: O(g * p * n log n)  Space: O(p)
//    g = generations, p = population size, n = text length
// ============================================================

/**
 * Evaluates compressed size when the text is split into chunks
 * of `blockSize` characters and each chunk is Huffman-compressed.
 * Smaller ratio = better.
 */
function blockCompressionRatio(text, blockSize) {
  if (!text || blockSize < 1) return 1;
  let totalOrig = 0,
    totalComp = 0;
  for (let i = 0; i < text.length; i += blockSize) {
    const chunk = text.slice(i, i + blockSize);
    const r = huffmanCompress(chunk);
    totalOrig += r.originalBits;
    totalComp += r.compressedBits;
  }
  return totalOrig > 0 ? totalComp / totalOrig : 1;
}

/**
 * Genetic Algorithm to find the optimal Huffman block size.
 * @param {string}  text        - input text
 * @param {number}  maxBlock    - maximum block size to consider
 * @param {number}  generations - number of GA generations
 * @param {number}  popSize     - population size
 * @returns {{ bestBlockSize, bestRatio, history, population }}
 */
export function geneticBlockOptimizer(
  text,
  maxBlock = 50,
  generations = 30,
  popSize = 16
) {
  const clamp = (v) => Math.max(1, Math.min(maxBlock, Math.round(v)));

  // Fitness: higher is better (inverse of ratio)
  const fitness = (blockSize) => 1 - blockCompressionRatio(text, blockSize);

  // Random initial population
  let population = Array.from({ length: popSize }, () =>
    clamp(1 + Math.random() * (maxBlock - 1))
  );

  const history = [];

  for (let gen = 0; gen < generations; gen++) {
    // Score every individual
    const scored = population
      .map((bs) => ({ bs, fit: fitness(bs) }))
      .sort((a, b) => b.fit - a.fit);

    history.push({
      gen,
      bestBlockSize: scored[0].bs,
      bestFit: scored[0].fit,
      bestRatio: 1 - scored[0].fit,
    });

    // Elitism: keep top 2 unchanged
    const nextGen = [scored[0].bs, scored[1].bs];

    // Fill rest via tournament selection + arithmetic crossover + mutation
    while (nextGen.length < popSize) {
      // Tournament: pick best of 3 random candidates
      const pick = () => {
        const candidates = [
          scored[Math.floor(Math.random() * popSize)],
          scored[Math.floor(Math.random() * popSize)],
          scored[Math.floor(Math.random() * popSize)],
        ];
        return candidates.reduce((a, b) => (a.fit > b.fit ? a : b)).bs;
      };

      const parentA = pick();
      const parentB = pick();

      // Arithmetic crossover: child = α*A + (1-α)*B
      const alpha = Math.random();
      let child = clamp(alpha * parentA + (1 - alpha) * parentB);

      // Gaussian mutation with 20% probability
      if (Math.random() < 0.2) {
        child = clamp(child + Math.round((Math.random() - 0.5) * 6));
      }

      nextGen.push(child);
    }

    population = nextGen;
  }

  // Final evaluation
  const finalScored = population
    .map((bs) => ({ bs, fit: fitness(bs) }))
    .sort((a, b) => b.fit - a.fit);

  return {
    bestBlockSize: finalScored[0].bs,
    bestRatio: 1 - finalScored[0].fit,
    history,
    finalPopulation: finalScored.map((s) => s.bs),
  };
}

// ============================================================
// 4. RANDOMIZED ALGORITHM — Randomized QuickSort
//    Expected Time: O(n log n)  |  Expected Space: O(log n)
//    Worst Case (rare): O(n²) time, O(n) space
// ============================================================

/**
 * Randomized QuickSort: picks a RANDOM pivot at each step.
 * This makes the worst-case O(n²) scenario extremely unlikely
 * compared to always picking the first/last element.
 *
 * Returns the sorted array and total comparisons made.
 */
export function randomizedQuickSort(arr) {
  let comparisons = 0;
  const a = [...arr];

  const qs = (lo, hi) => {
    if (lo >= hi) return;

    // Random pivot — key difference from deterministic quicksort
    const pivotIdx = lo + Math.floor(Math.random() * (hi - lo + 1));
    [a[pivotIdx], a[hi]] = [a[hi], a[pivotIdx]]; // swap pivot to end
    const pivot = a[hi];

    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      if (a[j] <= pivot) {
        i++;
        [a[i], a[j]] = [a[j], a[i]];
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];

    const p = i + 1;
    qs(lo, p - 1);
    qs(p + 1, hi);
  };

  qs(0, a.length - 1);
  return { sorted: a, comparisons };
}

// ============================================================
// 5. COMPLEXITY REFERENCE TABLE
//    Documents the time & space complexity of every algorithm
//    used in this system.
// ============================================================

export const complexityTable = [
  {
    name: "A* Search",
    category: "Graph Search",
    timeAvg: "O(b^d)",
    timeBest: "O(d)",
    timeWorst: "O(b^d)",
    space: "O(b^d)",
    note: "b = branching factor, d = solution depth. With perfect heuristic reduces to O(n).",
  },
  {
    name: "KMP String Search",
    category: "Pattern Matching",
    timeAvg: "O(n + m)",
    timeBest: "O(n)",
    timeWorst: "O(n + m)",
    space: "O(m)",
    note: "n = text length, m = pattern length. Linear due to failure-function preprocessing.",
  },
  {
    name: "Huffman Coding",
    category: "Compression",
    timeAvg: "O(n log n)",
    timeBest: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(n)",
    note: "n = unique characters. Produces optimal prefix-free variable-length codes.",
  },
  {
    name: "Genetic Algorithm",
    category: "Optimization",
    timeAvg: "O(g · p · f)",
    timeBest: "O(g · p)",
    timeWorst: "O(g · p · f)",
    space: "O(p)",
    note: "g = generations, p = population size, f = cost of one fitness evaluation.",
  },
  {
    name: "Randomized QuickSort",
    category: "Randomized",
    timeAvg: "O(n log n)",
    timeBest: "O(n log n)",
    timeWorst: "O(n²)",
    space: "O(log n)",
    note: "Random pivot makes O(n²) worst case have probability < 1/n!. Expected O(n log n).",
  },
];
