'use strict';

var chunkKTTVXTSR_cjs = require('./chunk-KTTVXTSR.cjs');

// src/preview/preview.ts
async function preview(markdown, config = {}) {
  const {
    plugins = [],
    markdown: markdownConfig = [],
    wrapperClass = "draftly-preview",
    wrapperTag = "article",
    sanitize = true,
    theme = "auto" /* AUTO */,
    syntaxTheme
  } = config;
  const renderer = new chunkKTTVXTSR_cjs.PreviewRenderer(markdown, plugins, markdownConfig, theme, sanitize, syntaxTheme);
  const content = await renderer.render();
  const classAttr = wrapperClass ? ` class="${wrapperClass}"` : "";
  return `<${wrapperTag}${classAttr}>
${content}</${wrapperTag}>`;
}

// src/preview/css-generator.ts
var baseStyles = `.draftly-preview {
  padding: 0 0.5rem;
}`;
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
    if (wrapperClass !== "draftly-preview") {
      cssChunks.push(baseStyles.replace(/\.draftly-preview/g, `.${wrapperClass}`));
    } else {
      cssChunks.push(baseStyles);
    }
  }
  const syntaxCSS = chunkKTTVXTSR_cjs.generateSyntaxThemeCSS(syntaxTheme, wrapperClass);
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
//# sourceMappingURL=chunk-NJVVUIR6.cjs.map
//# sourceMappingURL=chunk-NJVVUIR6.cjs.map