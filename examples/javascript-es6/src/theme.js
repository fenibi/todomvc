const DARK = "dark";
const LIGHT = "light";

const root = document.documentElement;
const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;

/**
 * Applies a theme to the page and reflects it on the toggle switch.
 * The choice lives in memory only; like the todos, it resets on reload.
 *
 * @param {string} theme Either "dark" or "light".
 */
const applyTheme = (theme) => {
    root.dataset.theme = theme;

    const toggle = document.querySelector(".theme-toggle");
    if (toggle)
        toggle.setAttribute("aria-checked", String(theme === DARK));
};

// Set before first paint so the page never flashes the wrong palette.
applyTheme(prefersLight ? LIGHT : DARK);

/**
 * Wires the theme switch. Assigning onclick (not addEventListener) keeps the
 * call idempotent when hot module replacement runs the load handler again.
 */
export const bindThemeToggle = () => {
    const toggle = document.querySelector(".theme-toggle");
    if (!toggle)
        return;

    applyTheme(root.dataset.theme);
    toggle.onclick = () => applyTheme(root.dataset.theme === DARK ? LIGHT : DARK);
};
