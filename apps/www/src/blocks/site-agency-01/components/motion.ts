/**
 * Agency motion: confident and editorial. The emphasised word in the statement headline gets an
 * accent stroke that draws in once the title has landed, and the big contact link sweeps its
 * underline on hover. Transform / background only, behind reduced-motion and data-motion guards.
 */
export const agencyMotion = `
@media screen and (prefers-reduced-motion: no-preference) {
  .ag-site:where(:not([data-motion="off"] *)) .vb-hero-title em {
    background: linear-gradient(var(--accent), var(--accent)) no-repeat 0 94% / 0% 0.06em;
    animation: ag-ink 900ms var(--ease-out-expo) 760ms forwards;
  }
  .ag-site:where(:not([data-motion="off"] *)) .vb-cta-biglink {
    text-decoration-color: transparent;
    background: linear-gradient(var(--accent), var(--accent)) no-repeat 100% 100% / 0% 2px;
    transition: background-size 520ms var(--ease-out-quint), background-position 0s 520ms;
  }
  .ag-site:where(:not([data-motion="off"] *)) .vb-cta-biglink:is(:hover, :focus-visible) {
    background-size: 100% 2px;
    background-position: 0 100%;
    transition: background-size 520ms var(--ease-out-quint);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ag-site .vb-hero-title em { background: linear-gradient(var(--accent), var(--accent)) no-repeat 0 94% / 100% 0.06em; }
}
@keyframes ag-ink { to { background-size: 100% 0.06em; } }
`;
