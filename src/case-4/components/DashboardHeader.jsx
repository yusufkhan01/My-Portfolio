import React from "react";
import { LANGS, LANG_NAMES } from "../i18n";

// Top of the dashboard: back-to-portfolio link (navigation), a text-only
// language selector (no country flags), a reset-filters action, then the
// title, description, and the always-visible synthetic-data notice.
export default function DashboardHeader({ t, lang, onLang, onReset }) {
  return (
    <header className="vm-header">
      <div className="vm-header-inner">
        <div className="vm-header-top">
          <a className="vm-back" href="index.html">
            <span aria-hidden="true">&larr;</span> {t.header.backToPortfolio}
          </a>

          <div className="vm-header-actions">
            <div className="vm-lang" role="group" aria-label={t.header.languageLabel}>
              <span className="vm-lang-label">{t.header.languageLabel}:</span>
              {LANGS.map((code) => (
                <button
                  key={code}
                  type="button"
                  className={"vm-lang-btn" + (lang === code ? " is-active" : "")}
                  aria-pressed={lang === code}
                  onClick={() => onLang(code)}
                >
                  {LANG_NAMES[code]}
                </button>
              ))}
            </div>

            <button type="button" className="vm-btn vm-btn--ghost" onClick={onReset}>
              {t.controls.reset}
            </button>
          </div>
        </div>

        <span className="vm-eyebrow">{t.header.eyebrow}</span>
        <h1 className="vm-title">{t.header.title}</h1>
        <p className="vm-subtitle">{t.header.description}</p>
        <p className="vm-notice" role="note">
          <span aria-hidden="true">&#9432;</span> {t.header.syntheticNotice}
        </p>
      </div>
    </header>
  );
}
