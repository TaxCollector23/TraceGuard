import { Link } from "react-router-dom";
import { Cmd, Section } from "../components";
import { MINTLIFY_DOCS_URL, RAW_BASE } from "../config";

const FEATURES: [string, string][] = [
  ["Run timeline", "Every checkpoint, command, file change, risk, and result in order."],
  ["Patch review", "Files added/modified/deleted, grounded in the real Git diff."],
  ["Command guarding", "Rule-based allow / warn / approve / block on risky commands."],
  ["Secret detection", "Local scanning with redaction — raw secrets are never stored."],
  ["Cost tracking", "Provider, model, tokens, and estimated cost with honest gaps."],
  ["Rollback center", "Git-based checkpoints created before every run."],
  ["Prompt Compressor", "Shrink prompts locally while preserving constraints."],
  ["Output budget", "Generate concise-output guidance to cut token waste."],
];

const INTEGRATIONS = [
  "Claude Code hooks",
  "Codex CLI",
  "Cursor MCP",
  "VS Code extension",
  "GitHub App / Actions",
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>TraceGuard</h1>
        <p className="statement">
          TraceGuard shows <b>what AI coding agents changed</b>, what they ran,
          what they cost, what looked risky, and how to roll back — before your
          project turns into a mystery.
        </p>
        <a className="docs-btn" href={MINTLIFY_DOCS_URL} target="_blank" rel="noreferrer">
          Read the documentation
        </a>
      </section>

      <Section id="download" kicker="Install" title="Download the CLI">
        <div className="os-grid">
          <div className="os-card">
            <h3>macOS</h3>
            <div className="label">Homebrew (recommended)</div>
            <Cmd>brew install traceguard</Cmd>
            <div className="label">Before Homebrew-core acceptance (tap)</div>
            <Cmd>brew tap TaxCollector23/traceguard</Cmd>
            <Cmd>brew install traceguard</Cmd>
            <div className="label">curl fallback</div>
            <Cmd>{`curl -fsSL ${RAW_BASE}/scripts/install.sh | sh`}</Cmd>
          </div>

          <div className="os-card">
            <h3>Linux</h3>
            <div className="label">Shell install (recommended)</div>
            <Cmd>{`curl -fsSL ${RAW_BASE}/scripts/install.sh | sh`}</Cmd>
            <div className="label">Homebrew on Linux</div>
            <Cmd>brew tap TaxCollector23/traceguard</Cmd>
            <Cmd>brew install traceguard</Cmd>
            <div className="label">npm (optional)</div>
            <Cmd>npm install -g traceguard</Cmd>
          </div>

          <div className="os-card">
            <h3>Windows</h3>
            <div className="label">PowerShell</div>
            <Cmd>{`irm ${RAW_BASE}/scripts/install.ps1 | iex`}</Cmd>
            <div className="label">npm (optional)</div>
            <Cmd>npm install -g traceguard</Cmd>
          </div>
        </div>
      </Section>

      <Section kicker="Get started" title="The workflow">
        <p className="muted">After install, confirm the CLI:</p>
        <Cmd>trg --help</Cmd>
        <p className="muted">Then record your first agent run:</p>
        <Cmd>trg init</Cmd>
        <Cmd>trg run claude</Cmd>
        <Cmd>trg dashboard</Cmd>
        <p className="muted">
          The dashboard opens locally at{" "}
          <code>http://127.0.0.1:&lt;port&gt;</code> (it binds to{" "}
          <code>127.0.0.1</code> only).
        </p>
      </Section>

      <Section kicker="What it is" title="About TraceGuard">
        <p>
          TraceGuard is a local black box recorder and safety layer for AI coding
          agents. It records what an agent did to your project — files, commands,
          risks, secrets, cost, and build/test results — and lets you review and
          roll back. It does not replace your agent and it does not write code for
          you.
        </p>
        <p>
          <Link to="/about">Read the full About page →</Link>
        </p>
      </Section>

      <Section kicker="Features" title="What you get">
        <div className="feature-grid">
          {FEATURES.map(([t, d]) => (
            <div className="feature" key={t}>
              <div className="ft">{t}</div>
              <div className="fd">{d}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="Integrations" title="Works with your tools">
        <div className="integrations">
          {INTEGRATIONS.map((i) => (
            <span className="tag" key={i}>
              <span className="dot">●</span>
              {i}
            </span>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 14 }}>
          Terminal agents are wrapped directly with <code>trg run</code>. GUI
          tools are observed via file changes and Git diffs; full command
          guarding requires supported hooks or running through the wrapper.
        </p>
      </Section>

      <Section kicker="Local-first" title="Your data stays on your machine">
        <div className="callout">
          <h3>Local-first &amp; private by default</h3>
          <p style={{ margin: 0 }}>
            The dashboard and daemon run only on <code>127.0.0.1</code> — never
            on the local network. There is no account and no cloud sync. Raw
            secrets are never stored; detections are redacted. GitHub integration
            uploads only sanitized summaries — never raw project files, secrets,
            or your local database.
          </p>
        </div>
      </Section>
    </>
  );
}
