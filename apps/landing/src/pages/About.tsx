import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="prose">
      <div className="page-head">
        <Link to="/" className="back">
          ← Back
        </Link>
        <h1>About TraceGuard</h1>
        <p className="muted">
          TraceGuard was built for developers using AI coding agents who need a
          reliable record of what happened during a coding session.
        </p>
      </div>

      <h2>What TraceGuard is</h2>
      <p>
        TraceGuard is a local black box recorder and safety layer for AI coding
        agents. You launch an agent or command through the <code>trg</code>{" "}
        wrapper, and TraceGuard records what changed, what ran, what looked
        risky, what may have leaked, what it cost, and how to roll back.
      </p>

      <h2>What TraceGuard was built for</h2>
      <p>
        AI agents can edit files, run commands, touch secrets, change
        dependencies, break builds, and spend API money — often faster than a
        human can follow. TraceGuard gives the developer a local, honest record
        of those actions. It is built for:
      </p>
      <ul>
        <li>Developers using Claude Code, Codex, Cursor, VS Code, Copilot-style tools, and terminal agents</li>
        <li>Developers who want to know exactly what changed</li>
        <li>Developers who want to review agent edits before accepting them</li>
        <li>Developers who want rollback checkpoints</li>
        <li>Developers who want command-risk warnings</li>
        <li>Developers who want cost visibility</li>
        <li>Developers who do not want raw secrets stored or uploaded</li>
      </ul>

      <h2>Why local-first matters</h2>
      <p>
        Your source code, prompts, diffs, and command output are sensitive. They
        stay on your machine. The daemon binds only to <code>127.0.0.1</code>,
        there is no account, and there is no cloud sync. History lives in a local
        SQLite database. You stay in control.
      </p>

      <h2>What it records</h2>
      <ul>
        <li>Local daemon dashboard and a CLI wrapper with <code>trg</code></li>
        <li>Agent run timeline and Git checkpointing</li>
        <li>Patch review and file-change tracking</li>
        <li>Command guarding and secret detection with redaction</li>
        <li>Cost tracking and build/test result recording</li>
        <li>Rollback center backed by Git</li>
        <li>Local SQLite history</li>
        <li>Prompt compression and output budget controls</li>
      </ul>

      <h2>What it does not do</h2>
      <ul>
        <li>It does not replace AI coding agents.</li>
        <li>It does not write code for you.</li>
        <li>It does not upload local project data by default.</li>
        <li>It does not require a cloud login.</li>
        <li>It does not provide a trust score.</li>
        <li>It does not compare agents.</li>
        <li>
          It does not pretend GUI tools can be perfectly controlled unless they
          expose hooks, terminal execution, or integration APIs.
        </li>
      </ul>

      <h2>Supported integrations</h2>
      <ul>
        <li>Claude Code hooks adapter</li>
        <li>Codex CLI adapter</li>
        <li>Cursor MCP adapter</li>
        <li>VS Code extension</li>
        <li>GitHub App / GitHub Actions integration</li>
      </ul>

      <h2>Security model</h2>
      <ul>
        <li>The local daemon binds only to <code>127.0.0.1</code>.</li>
        <li>Raw secrets are never stored; detected secrets are redacted.</li>
        <li>No cloud upload by default.</li>
        <li>GitHub integration uploads only sanitized summaries — never raw files, secrets, or the local database.</li>
        <li>The Prompt Compressor runs locally and deterministically; any optional LLM-based compression is opt-in and clearly labelled because prompt text would leave the machine.</li>
      </ul>
    </div>
  );
}
