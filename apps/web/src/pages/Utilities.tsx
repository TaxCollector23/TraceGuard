import { useState } from "react";
import type { CompressionResult } from "../api";
import { api } from "../api";

const BUDGET_OPTIONS: [string, string][] = [
  ["concise", "Be concise"],
  ["no_repeat_unchanged_code", "Don't repeat unchanged code"],
  ["summarize_in_bullets", "Summarize in bullets"],
  ["only_show_changed_files", "Only show changed files"],
  ["no_full_files_unless_necessary", "No full files unless necessary"],
  ["ask_before_large_rewrites", "Ask before large rewrites"],
];

export default function Utilities() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [budget, setBudget] = useState<Record<string, boolean>>({});
  const [target, setTarget] = useState<string>("");
  const [budgetBlock, setBudgetBlock] = useState("");

  async function compress() {
    if (!input.trim()) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await api.compressPrompt(input));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function buildBudget() {
    const payload: Record<string, unknown> = { ...budget };
    if (target.trim()) payload.target_tokens = Number(target);
    const res = await api.outputBudget(payload);
    setBudgetBlock(res.instruction_block);
  }

  return (
    <div>
      <h1 className="page-title">Utilities</h1>
      <p className="page-sub">
        Prompt Compressor and output-budget controls. Compression is local and
        deterministic — nothing is sent to any model, and nothing is sent to your
        agent automatically. You copy and use the result yourself.
      </p>

      <div className="section-title">Prompt Compressor</div>
      <textarea
        className="ta"
        placeholder="Paste a prompt to compress…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
      />
      <div style={{ marginTop: 8 }}>
        <button className="btn" onClick={compress} disabled={busy || !input.trim()}>
          {busy ? "Compressing…" : "Compress"}
        </button>
      </div>
      {error && <div className="empty">Error: {error}</div>}
      {result && (
        <>
          <div className="note" style={{ marginTop: 14 }}>
            Estimated tokens (approximate): <b>{result.original_tokens}</b> →{" "}
            <b>{result.compressed_tokens}</b> (~{result.reduction_pct.toFixed(0)}%
            reduction)
          </div>
          <pre className="diff" style={{ whiteSpace: "pre-wrap" }}>
            {result.compressed}
          </pre>
          <button
            className="btn"
            onClick={() => navigator.clipboard?.writeText(result.compressed)}
          >
            Copy compressed prompt
          </button>
        </>
      )}

      <div className="section-title">Output budget</div>
      <p className="muted">
        Generate a guidance block to paste into your prompt. This is guidance,
        not enforcement, unless your tool supports hard output limits.
      </p>
      <div className="budget-grid">
        {BUDGET_OPTIONS.map(([key, label]) => (
          <label key={key} className="check">
            <input
              type="checkbox"
              checked={!!budget[key]}
              onChange={(e) => setBudget({ ...budget, [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
        <label className="check">
          target tokens:
          <input
            className="num"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g. 800"
          />
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <button className="btn" onClick={buildBudget}>
          Build block
        </button>
      </div>
      {budgetBlock && (
        <pre className="diff" style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>
          {budgetBlock}
        </pre>
      )}
    </div>
  );
}
