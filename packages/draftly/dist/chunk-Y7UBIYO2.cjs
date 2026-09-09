'use strict';

var chunkEWK52CV4_cjs = require('./chunk-EWK52CV4.cjs');
var chunkFAW6KSSV_cjs = require('./chunk-FAW6KSSV.cjs');
var chunkPULMPDQL_cjs = require('./chunk-PULMPDQL.cjs');
var styleMod = require('style-mod');

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
  const renderer = new chunkEWK52CV4_cjs.PreviewRenderer(markdown, plugins, markdownConfig, theme, sanitize, syntaxTheme, sanitizer);
  const content = await renderer.render();
  const classAttr = wrapperClass ? ` class="${chunkFAW6KSSV_cjs.escapeHtml(wrapperClass)}"` : "";
  return `<${wrapperTag}${classAttr}>
${content}</${wrapperTag}>`;
}
var baseStyleCache = /* @__PURE__ */ new Map();
function generateBaseStyles(theme, wrapperClass) {
  const cacheKey = `${theme}\0${wrapperClass}`;
  const cached = baseStyleCache.get(cacheKey);
  if (cached !== void 0) return cached;
  const wrapperSelector = `.${wrapperClass}`;
  const rules = new styleMod.StyleModule(chunkPULMPDQL_cjs.resolveBaseStyles(theme), {
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
  const syntaxCSS = chunkEWK52CV4_cjs.generateSyntaxThemeCSS(syntaxTheme, wrapperClass);
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

exports.generateCSS = generateCSS;
exports.preview = preview;
//# sourceMappingURL=chunk-Y7UBIYO2.cjs.map
//# sourceMappingURL=chunk-Y7UBIYO2.cjs.map