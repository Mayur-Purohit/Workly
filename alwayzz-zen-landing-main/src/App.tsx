import { useState } from "react";
import { ChevronUp } from "lucide-react";

const NAV_LINKS = ["Projects", "Plans", "Team", "FAQs", "Get in Touch"];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="az-nav">
        <div className="az-nav-inner">
          <span className="az-logo">
            Alwayzz<span className="az-logo-r">®</span>
          </span>
          <button
            className="az-menu-btn"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            Menu
            <ChevronUp size={16} />
          </button>
        </div>
      </header>

      <div className={`az-drawer${open ? " is-open" : ""}`}>
        <nav className="az-drawer-links">
          {NAV_LINKS.map((link) => (
            <a key={link} href="#" onClick={() => setOpen(false)}>
              {link}
            </a>
          ))}
        </nav>
        <div className="az-drawer-footer">© {new Date().getFullYear()} Alwayzz®. All rights reserved.</div>
      </div>
    </>
  );
}

function CurvedLines() {
  const lines = Array.from({ length: 20 });
  return (
    <>
      <div className="az-lines" aria-hidden="true">
        {lines.map((_, i) => (
          <span
            key={`l-${i}`}
            className="az-line az-line--left"
            style={{ width: `${60 + i * 10}px`, animationDelay: `${i * 0.25}s` }}
          />
        ))}
        {lines.map((_, i) => (
          <span
            key={`r-${i}`}
            className="az-line az-line--right"
            style={{ width: `${60 + i * 10}px`, animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </div>
      <div className="az-lines-top" aria-hidden="true">
        {lines.map((_, i) => (
          <span
            key={`t-${i}`}
            className="az-line-top"
            style={{ height: `${60 + i * 10}px`, animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </div>
    </>
  );
}

export default function App() {
  return (
    <div className="az-page">
      <Navbar />

      <section className="az-hero">
        <CurvedLines />
        <div className="az-hero-content">
          <h1 className="az-title">
            Premium creative <span className="az-serif">alwayzz</span>
            <sup className="az-title-r">®</sup> on demand.
          </h1>
          <p className="az-subtitle">
            A flexible design partnership for founders, brands, and agencies who want top craft
            delivered on their timeline.
          </p>
          <div className="az-cta">
            <button className="az-btn-primary">View Plans</button>
            <button className="az-btn-book">
              <img
                className="az-avatar"
                src="https://framerusercontent.com/images/hfneFL6CHBi5BnNvCeOaqU9HqE4.png"
                alt="Book a call with an Alwayzz designer"
              />
              <span className="az-book-text">
                <span className="az-book-primary">Chat for 15 minutes</span>
                <span className="az-book-secondary">
                  <span className="az-dot" />
                  Pick a slot
                </span>
              </span>
            </button>
          </div>
        </div>
        <div className="az-blur" aria-hidden="true" />
      </section>
    </div>
  );
}
