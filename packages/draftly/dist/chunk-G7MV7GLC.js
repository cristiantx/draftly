import { PreviewRenderer, generateSyntaxThemeCSS } from './chunk-LB72KTUD.js';
import { escapeHtml } from './chunk-LUQ5Q6D7.js';
import { resolveBaseStyles } from './chunk-XRXGYUPJ.js';
import { StyleModule } from 'style-mod';

// src/preview/preview.ts
async function preview(markdown, config = {}) {
  const {
    plugins = [],
    markdown: markdownConfig = [],
    wrapperClass = "draftly-preview",
    wrapperTag = "article",
    sanitize = true,
    sanitizer,
    theme = "auto" /* AUTO */,
    syntaxTheme
  } = config;
  const renderer = new PreviewRenderer(markdown, plugins, markdownConfig, theme, sanitize, syntaxTheme, sanitizer);
  const content = await renderer.render();
  const classAttr = wrapperClass ? ` class="${escapeHtml(wrapperClass)}"` : "";
  return `<${wrapperTag}${classAttr}>
${content}</${wrapperTag}>`;
}
var baseStyleCache = /* @__PURE__ */ new Map();
function generateBaseStyles(theme, wrapperClass) {
  const cacheKey = `${theme}\0${wrapperClass}`;
  const cached = baseStyleCache.get(cacheKey);
  if (cached !== void 0) return cached;
  const wrapperSelector = `.${wrapperClass}`;
  const rules = new StyleModule(resolveBaseStyles(theme), {
    finish: (selector) => selector.replace(/&\.cm-draftly \.cm-content/g, wrapperSelector).replace(/&\.cm-draftly/g, wrapperSelector)
  }).getRules();
  baseStyleCache.set(cacheKey, rules);
  return rules;
}
function generateCSS(config = {}) {
  const {
    plugins = [],
    theme = "auto" /* AUTO */,
    wrapperClass = "draftly-preview",
    includeBase = true,
    syntaxTheme
  } = config;
  const cssChunks = [];
  if (includeBase) {
    cssChunks.push(generateBaseStyles(theme, wrapperClass));
  }
  const syntaxCSS = generateSyntaxThemeCSS(syntaxTheme, wrapperClass);
  if (syntaxCSS) {
    cssChunks.push("/* syntax-theme */\n" + syntaxCSS);
  }
  for (const plugin of plugins) {
    const pluginCSS = plugin.getPreviewStyles(theme, wrapperClass);
    if (pluginCSS) cssChunks.push(`/* ${plugin.name} - ${plugin.version} */
` + pluginCSS);
  }
  return cssChunks.join("\n\n");
}

export { generateCSS, preview };
//# sourceMappingURL=chunk-G7MV7GLC.js.map
//# sourceMappingURL=chunk-G7MV7GLC.js.map