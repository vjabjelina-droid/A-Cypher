import { useMemo, useState } from "react";
import { encrypt, decrypt, KEY, ALPHABET } from "../lib.js";

const show = (c) => (c === "\n" ? "\u21B5" : c === " " ? "\u2423" : c);

export default function CipherPanel({ text, setText }) {
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
