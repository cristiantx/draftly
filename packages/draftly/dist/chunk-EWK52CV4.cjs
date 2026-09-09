'use strict';

var chunkFAW6KSSV_cjs = require('./chunk-FAW6KSSV.cjs');
var chunkQFIW5FJA_cjs = require('./chunk-QFIW5FJA.cjs');
var highlight = require('@lezer/highlight');
var langMarkdown = require('@codemirror/lang-markdown');
var languageData = require('@codemirror/language-data');
var DOMPurify = require('dompurify');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var DOMPurify__default = /*#__PURE__*/_interopDefault(DOMPurify);

// src/preview/default-renderers.ts
var renderDocument = (_node, children) => {
  return children;
};
var defaultRenderers = {
  // Document structure
  Document: renderDocument
};

// src/preview/scope-css.ts
var NESTED_STYLE_AT_RULES = /^@(?:media|supports|container|layer|scope|document)\b/i;
var ROOT_SELECTORS = /* @__PURE__ */ new Set([":root", "html", "body"]);
function scopeCssToWrapper(css, wrapperClass) {
  if (!css || !wrapperClass) return css;
  return scopeBlocks(css, `.${wrapperClass}`);
}
function scopeBlocks(css, prefix) {
  let out = "";
  let cursor = 0;
  while (cursor < css.length) {
    const open = findSignificant(css, cursor, "{");
    if (open === -1) {
      out += css.slice(cursor);
      break;
    }
    const close = findBlockEnd(css, open);
    const prelude = css.slice(cursor, open);
    const body = css.slice(open + 1, close);
    const lastSemicolon = prelude.lastIndexOf(";");
    const leading = lastSemicolon === -1 ? "" : prelude.slice(0, lastSemicolon + 1);
    const selectorText = (lastSemicolon === -1 ? prelude : prelude.slice(lastSemicolon + 1)).trim();
    out += leading;
    if (selectorText.startsWith("@")) {
      const inner = NESTED_STYLE_AT_RULES.test(selectorText) ? scopeBlocks(body, prefix) : body;
      out += `
${selectorText} {${inner}}`;
    } else {
      out += `
${scopeSelectorList(selectorText, prefix)} {${body}}`;
    }
    cursor = close + 1;
  }
  return out;
}
function scopeSelectorList(selectorText, prefix) {
  const scoped = splitSelectors(selectorText).map((selector) => ROOT_SELECTORS.has(selector) ? prefix : `${prefix} ${selector}`).join(", ");
  return scoped || selectorText;
}
function splitSelectors(selectorText) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selectorText.length; i++) {
    const char = selectorText[i];
    if (char === '"' || char === "'") {
      i = skipString(selectorText, i);
    } else if (char === "(" || char === "[") {
      depth++;
    } else if (char === ")" || char === "]") {
      depth--;
    } else if (char === "," && depth === 0) {
      parts.push(selectorText.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(selectorText.slice(start).trim());
  return parts.filter(Boolean);
}
function findSignificant(css, from, target) {
  for (let i = from; i < css.length; i++) {
    const char = css[i];
    if (char === "/" && css[i + 1] === "*") {
      i = skipComment(css, i);
    } else if (char === '"' || char === "'") {
      i = skipString(css, i);
    } else if (char === target) {
      return i;
    }
  }
  return -1;
}
function findBlockEnd(css, openIndex) {
  let depth = 0;
  for (let i = openIndex; i < css.length; i++) {
    const char = css[i];
    if (char === "/" && css[i + 1] === "*") {
      i = skipComment(css, i);
    } else if (char === '"' || char === "'") {
      i = skipString(css, i);
    } else if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return css.length;
}
function skipString(css, start) {
  const quote = css[start];
  for (let i = start + 1; i < css.length; i++) {
    if (css[i] === "\\") {
      i++;
    } else if (css[i] === quote) {
      return i;
    }
  }
  return css.length - 1;
}
function skipComment(css, start) {
  const end = css.indexOf("*/", start + 2);
  return end === -1 ? css.length - 1 : end + 1;
}

// src/preview/syntax-theme.ts
var MAX_WALK_DEPTH = 8;
function generateSyntaxThemeCSS(syntaxTheme, wrapperClass) {
  if (!syntaxTheme) return "";
  const styles = extractRuntimeHighlightStyles(syntaxTheme);
  if (!styles.length) return "";
  const cssChunks = [];
  for (const style of styles) {
    const rules = style.module?.getRules();
    if (!rules) continue;
    cssChunks.push(scopeCssToWrapper(rules, wrapperClass));
  }
  if (!cssChunks.length) return "";
  return Array.from(new Set(cssChunks)).join("\n");
}
function resolveSyntaxHighlighters(syntaxTheme, includeLegacyClassHighlighter = true) {
  const resolved = [];
  if (includeLegacyClassHighlighter) {
    resolved.push(highlight.classHighlighter);
  }
  const styles = extractRuntimeHighlightStyles(syntaxTheme);
  for (const style of styles) {
    if (typeof style.style === "function") {
      resolved.push(style);
    }
  }
  return Array.from(new Set(resolved));
}
function extractRuntimeHighlightStyles(input) {
  if (!input) return [];
  const values = Array.isArray(input) ? input : [input];
  const styles = [];
  const visited = /* @__PURE__ */ new WeakSet();
  for (const value of values) {
    walk(value, 0, visited, styles);
  }
  return styles;
}
function walk(value, depth, visited, out) {
  if (value === null || value === void 0) return;
  if (depth > MAX_WALK_DEPTH) return;
  if (isRuntimeHighlightStyle(value)) {
    out.push(value);
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      walk(item, depth + 1, visited, out);
    }
    return;
  }
  if (typeof value !== "object") return;
  if (visited.has(value)) return;
  visited.add(value);
  const keys = Object.getOwnPropertyNames(value);
  for (const key of keys) {
    try {
      walk(value[key], depth + 1, visited, out);
    } catch {
    }
  }
}
function isRuntimeHighlightStyle(value) {
  if (!value || typeof value !== "object") return false;
  const style = value;
  return Array.isArray(style.specs) && typeof style.style === "function";
}
function hasDOM() {
  return typeof window !== "undefined" && typeof window.document !== "undefined";
}
var warnedAboutMissingDOM = false;
function warnSanitizationUnavailable() {
  if (warnedAboutMissingDOM) return;
  warnedAboutMissingDOM = true;
  console.warn(
    "[draftly] preview({ sanitize: true }) cannot sanitize outside a browser: DOMPurify requires a DOM. HTML in this document is being emitted UNSANITIZED. Pass a `sanitizer` option (for example isomorphic-dompurify), sanitize at the application layer, or render on the client."
  );
}
function createPreviewContext(doc, theme, renderChildren, sanitizeHtml = true, syntaxHighlighters = [], sanitizer) {
  return {
    doc,
    theme,
    syntaxHighlighters,
    sliceDoc(from, to) {
      return doc.slice(from, to);
    },
    sanitize(html) {
      if (!sanitizeHtml) return html;
      if (sanitizer) return sanitizer(html);
      if (hasDOM()) return DOMPurify__default.default.sanitize(html);
      warnSanitizationUnavailable();
      return html;
    },
    renderChildren
  };
}

// src/editor/markdown-cache.ts
var markdownConfigCache = /* @__PURE__ */ new WeakMap();
function resolveMarkdownConfig(plugin) {
  let config = markdownConfigCache.get(plugin);
  if (config === void 0) {
    config = plugin.getMarkdownConfig();
    markdownConfigCache.set(plugin, config);
  }
  return config;
}

// src/preview/renderer.ts
var parserCache = null;
function buildParser(extensions) {
  return langMarkdown.markdown({
    base: langMarkdown.markdownLanguage,
    codeLanguages: languageData.languages,
    extensions,
    addKeymap: true,
    completeHTMLTags: true,
    pasteURLAsLink: true
  }).language.parser;
}
function getParser(extensions) {
  const cached = parserCache;
  if (cached && cached.extensions.length === extensions.length && cached.extensions.every((ext, i) => ext === extensions[i])) {
    return cached.parser;
  }
  const parser = buildParser(extensions);
  parserCache = { extensions, parser };
  return parser;
}
var PreviewRenderer = class {
  doc;
  theme;
  plugins;
  markdown;
  sanitizeHtml;
  syntaxTheme;
  renderers;
  ctx;
  nodeToPlugins;
  constructor(doc, plugins = [], markdown2, theme = "auto" /* AUTO */, sanitize = true, syntaxTheme, sanitizer) {
    this.doc = doc;
    this.theme = theme;
    this.plugins = plugins;
    this.markdown = markdown2;
    this.sanitizeHtml = sanitize;
    this.syntaxTheme = syntaxTheme;
    this.renderers = { ...defaultRenderers };
    const syntaxHighlighters = resolveSyntaxHighlighters(this.syntaxTheme, true);
    this.ctx = createPreviewContext(
      doc,
      theme,
      this.renderChildren.bind(this),
      sanitize,
      syntaxHighlighters,
      sanitizer
    );
    this.nodeToPlugins = this.buildNodePluginMap();
  }
  /**
   * Build a map from node names to the plugins that handle them.
   *
   * Candidates for a node are ordered by **descending `decorationPriority`**, so the
   * plugin that would win visually in the editor is the one consulted first here.
   * `renderNode` takes the first non-null result, so highest priority wins.
   *
   * That direction is the inverse of the editor's sort, and deliberately so: the editor
   * sorts ascending because it applies *every* plugin and later decorations layer over
   * earlier ones. The two surfaces have different composition models — layering versus
   * precedence — and this is what makes one priority number mean the same thing in both.
   * Before this, preview resolved conflicts by whatever order the consumer happened to
   * write their plugin array in.
   *
   * @returns Node name to prioritised candidate list
   */
  buildNodePluginMap() {
    const map = /* @__PURE__ */ new Map();
    for (const plugin of this.plugins) {
      if (plugin.renderToHTML && plugin.requiredNodes.length === 0) {
        chunkQFIW5FJA_cjs.devWarn(
          `Plugin "${plugin.name}" defines renderToHTML() but declares no requiredNodes, so it will never be called during preview rendering.`
        );
      }
      if (plugin.renderToHTML && plugin.requiredNodes.length > 0) {
        for (const nodeName of plugin.requiredNodes) {
          const list = map.get(nodeName) || [];
          list.push(plugin);
          map.set(nodeName, list);
        }
      }
    }
    for (const [nodeName, candidates] of map) {
      if (candidates.length < 2) continue;
      candidates.sort((a, b) => b.decorationPriority - a.decorationPriority);
      const [first, second] = candidates;
      if (first.decorationPriority === second.decorationPriority) {
        chunkQFIW5FJA_cjs.devWarn(
          `Plugins "${first.name}" and "${second.name}" both claim node "${nodeName}" at decorationPriority ${first.decorationPriority}. Which one renders it is unspecified; give one a higher priority.`
        );
      }
    }
    return map;
  }
  /**
   * Render the document to HTML
   */
  async render() {
    const extensions = [
      ...this.markdown,
      ...this.plugins.map(resolveMarkdownConfig).filter((ext) => ext !== null)
    ];
    const tree = getParser(extensions).parse(this.doc);
    return await this.renderNode(tree.topNode);
  }
  /**
   * Render a single node to HTML
   */
  async renderNode(node) {
    const plugins = this.nodeToPlugins.get(node.name);
    const renderer = this.renderers[node.name];
    let children;
    const getChildren = async () => {
      children ??= await this.renderChildren(node);
      return children;
    };
    if (plugins) {
      const rendered = await getChildren();
      for (const plugin of plugins) {
        const result = await plugin.renderToHTML(node, rendered, this.ctx);
        if (result !== null) {
          return result;
        }
      }
    }
    if (renderer) {
      return renderer(node, await getChildren(), this.ctx);
    }
    if (node.firstChild) {
      return await getChildren();
    }
    return chunkFAW6KSSV_cjs.escapeHtml(this.ctx.sliceDoc(node.from, node.to));
  }
  /**
   * Render all children of a node, including text between nodes
   */
  async renderChildren(node) {
    let result = "";
    let pos = node.from;
    let child = node.firstChild;
    while (child) {
      if (child.from > pos) {
        result += chunkFAW6KSSV_cjs.escapeHtml(this.ctx.sliceDoc(pos, child.from));
      }
      result += await this.renderNode(child);
      pos = child.to;
      child = child.nextSibling;
    }
    if (pos < node.to) {
      result += chunkFAW6KSSV_cjs.escapeHtml(this.ctx.sliceDoc(pos, node.to));
    }
    return result;
  }
};

exports.PreviewRenderer = PreviewRenderer;
exports.defaultRenderers = defaultRenderers;
exports.generateSyntaxThemeCSS = generateSyntaxThemeCSS;
//# sourceMappingURL=chunk-EWK52CV4.cjs.map
//# sourceMappingURL=chunk-EWK52CV4.cjs.map