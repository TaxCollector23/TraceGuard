import { Link, NavLink, Outlet } from "react-router-dom";
import { GITHUB_REPO, MINTLIFY_DOCS_URL } from "./config";

export default function App() {
  return (
    <div className="site">
      <header className="topbar">
        <Link to="/" className="logo">
          Trace<span>Guard</span>
        </Link>
        <nav className="topnav">
          <NavLink to="/about">About</NavLink>
          <a href={MINTLIFY_DOCS_URL} target="_blank" rel="noreferrer">
            Docs
          </a>
          <a href={GITHUB_REPO} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div>
          TraceGuard — local-first. Your project data stays on your machine.
        </div>
        <div className="muted">
          The dashboard runs only on <code>127.0.0.1</code>. This site is for
          installation and docs; it never connects to your local daemon.
        </div>
      </footer>
    </div>
  );
}
