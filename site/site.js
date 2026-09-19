/* Optional enhancement: native CSS follows the OS even without JavaScript.
   This script runs before CSS so a saved preference applies before first paint. */
(() => {
  "use strict";

  const storageKey = "omnithings.theme";
  const allowedThemes = new Set(["system", "light", "dark"]);
  const root = document.documentElement;
  const systemTheme = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;
  let preference = "system";

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (allowedThemes.has(stored)) preference = stored;
  } catch {
    // Storage may be unavailable; the theme control still works for this visit.
  }

  const updateThemeColor = () => {
    const dark = preference === "dark" || (preference === "system" && systemTheme?.matches);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? "#19171d" : "#f5f4f7";
  };

  const applyTheme = (value) => {
    preference = allowedThemes.has(value) ? value : "system";
    root.dataset.theme = preference;
    updateThemeColor();
  };

  applyTheme(preference);

  if (systemTheme && typeof systemTheme.addEventListener === "function") {
    systemTheme.addEventListener("change", updateThemeColor);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const select = document.querySelector("[data-theme-select]");
    if (!select) return;
    select.value = preference;
    select.closest(".theme-control").hidden = false;
    select.addEventListener("change", () => {
      applyTheme(select.value);
      try {
        window.localStorage.setItem(storageKey, preference);
      } catch {
        // A denied write must not prevent changing the current page theme.
      }
    });
    window.addEventListener("storage", (event) => {
      if (event.key !== storageKey && event.key !== null) return;
      applyTheme(event.newValue);
      select.value = preference;
    });
  }, { once: true });
})();
