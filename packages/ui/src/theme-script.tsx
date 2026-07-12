export const THEME_STORAGE_KEY = "scalex-theme";

/**
 * Inline, render-blocking script that resolves the theme before first paint to
 * avoid a flash-of-wrong-theme. Render it as the first child of <body>.
 */
const script = `(function(){try{var k='${THEME_STORAGE_KEY}';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}var e=document.documentElement;e.setAttribute('data-theme',t);e.style.colorScheme=t;}catch(_){document.documentElement.setAttribute('data-theme','dark');}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
