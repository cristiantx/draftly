'use strict';

var chunkXQHP5MJD_cjs = require('./chunk-XQHP5MJD.cjs');
var chunkFAW6KSSV_cjs = require('./chunk-FAW6KSSV.cjs');
var chunk3TJPHTNQ_cjs = require('./chunk-3TJPHTNQ.cjs');
var chunkPULMPDQL_cjs = require('./chunk-PULMPDQL.cjs');
var view = require('@codemirror/view');
var highlight = require('@lezer/highlight');
var state = require('@codemirror/state');
var language = require('@codemirror/language');
var mermaid = require('mermaid');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var mermaid__default = /*#__PURE__*/_interopDefault(mermaid);

var mermaidInitialized = false;
function ensureMermaidInitialized() {
  if (mermaidInitialized) return;
  mermaidInitialized = true;
  mermaid__default.default.initialize({
    startOnLoad: false,
    theme: "default",
    suppressErrorRendering: true
  });
}
var mermaidCounter = 0;
var MERMAID_ID_WINDOW = 1e6;
var inFlightRenders = /* @__PURE__ */ new Map();
function renderMermaid(definition, options = {}, defaultTheme = "default") {
  const key = `${defaultTheme}\0${JSON.stringify(options)}\0${definition}`;
  const existing = inFlightRenders.get(key);
  if (existing) return existing;
  const pending = renderMermaidUncached(definition, options, defaultTheme).finally(() => {
    if (inFlightRenders.get(key) === pending) inFlightRenders.delete(key);
  });
  inFlightRenders.set(key, pending);
  return pending;
}
async function renderMermaidUncached(definition, options = {}, defaultTheme = "default") {
  try {
    ensureMermaidInitialized();
    mermaidCounter = (mermaidCounter + 1) % MERMAID_ID_WINDOW;
    const id = `draftly-mermaid-${mermaidCounter}`;
    let finalDefinition = definition;
    const mermaidConfig = {};
    if (options.theme) {
      mermaidConfig.theme = options.theme;
    } else {
      mermaidConfig.theme = defaultTheme;
    }
    if (Object.keys(mermaidConfig).length > 0) {
      const jsonConfig = JSON.stringify(mermaidConfig);
      finalDefinition = `%%{init: ${jsonConfig} }%%
${definition}`;
    }
    const { svg } = await mermaid__default.default.render(id, finalDefinition);
    return { svg, error: null };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    return { svg: "", error: errorMsg };
  }
}
function parseAttributes(fenceLine) {
  const attributes = {};
  const regex = /(\w+)=["']([^"']*)["']/g;
  let match;
  while ((match = regex.exec(fenceLine)) !== null && match[1] && match[2]) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}
var MermaidBlockWidget = class extends view.WidgetType {
  constructor(definition, attributes, defaultTheme, from, to, activation = "select") {
    super();
    this.definition = definition;
    this.attributes = attributes;
    this.defaultTheme = defaultTheme;
    this.from = from;
    this.to = to;
    this.activation = activation;
  }
  /**
   * Compares **content only**.
   *
   * `eq()` answers "can CodeMirror keep the DOM it already built?". Document positions
   * shift on any edit earlier in the document, so including them made the answer
   * permanently no -- every diagram below an edit re-ran an async
   * mermaid.render() on every keystroke, flashing "Rendering diagram…" as it went. The handlers resolve the range from the live DOM instead.
   */
  eq(other) {
    return other.activation === this.activation && other.definition === this.definition && other.defaultTheme === this.defaultTheme && chunkXQHP5MJD_cjs.shallowEqualRecord(other.attributes, this.attributes);
  }
  /**
   * Set by {@link destroy}. `mermaid.render()` is async and routinely outlives the
   * element it was started for, so the resolution handler must be able to tell.
   */
  disposed = false;
  destroy() {
    this.disposed = true;
  }
  toDOM(view) {
    const div = document.createElement("button");
    div.type = "button";
    div.style.border = "0";
    div.style.background = "transparent";
    div.style.color = "inherit";
    div.style.width = "100%";
    div.className = "cm-draftly-mermaid-rendered";
    div.style.cursor = "pointer";
    div.setAttribute(
      "aria-label",
      `Edit Mermaid diagram: ${this.definition.replace(/\s+/g, " ").trim().slice(0, 200)}`
    );
    div.innerHTML = `<div class="cm-draftly-mermaid-loading">Rendering diagram\u2026</div>`;
    renderMermaid(this.definition, this.attributes, this.defaultTheme).then(({ svg, error }) => {
      if (this.disposed || !div.isConnected) {
        return;
      }
      if (error) {
        div.classList.add("cm-draftly-mermaid-error");
        div.innerHTML = `<span role="alert">[Mermaid Error: ${chunkFAW6KSSV_cjs.escapeHtml(error)}]</span>`;
        view.state.facet(chunk3TJPHTNQ_cjs.draftlyOnPluginErrorFacet)?.("mermaid", new Error(error));
      } else {
        div.innerHTML = svg;
        const diagram = div.querySelector("svg");
        const box = diagram?.viewBox.baseVal;
        if (diagram && box?.width) diagram.style.width = `${box.width}px`;
      }
      view.requestMeasure();
    });
    div.addEventListener("mousedown", (event) => event.preventDefault());
    div.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const range = chunkXQHP5MJD_cjs.resolveWidgetRange(view, div, ["MermaidBlock"]) ?? { from: this.from, to: this.to };
      view.dispatch({
        selection: this.activation === "caret" ? { anchor: Math.min(view.state.doc.lineAt(range.from).to + 1, range.to) } : { anchor: range.from, head: range.to },
        scrollIntoView: true
      });
      view.focus();
    });
    return div;
  }
  ignoreEvent() {
    return true;
  }
};

// src/plugins/mermaid/blocks.ts
function readDiagrams(state) {
  const diagrams = [];
  language.syntaxTree(state).iterate({
    enter(node) {
      if (node.name !== "MermaidBlock") return;
      const lines = state.sliceDoc(node.from, node.to).split("\n");
      diagrams.push({
        from: node.from,
        to: node.to,
        definition: lines.slice(1, -1).join("\n").trim(),
        attributes: parseAttributes(lines[0] ?? "")
      });
      return false;
    }
  });
  return diagrams;
}
function createMermaidBlocks(activation) {
  const decorate = (state, diagrams) => {
    const theme2 = state.facet(chunk3TJPHTNQ_cjs.draftlyThemeFacet) === "dark" /* DARK */ ? "dark" : "default";
    return view.Decoration.set(
      diagrams.map((diagram) => {
        const expanded = state.selection.ranges.some((range) => range.from <= diagram.to && range.to >= diagram.from);
        const widget = new MermaidBlockWidget(
          diagram.definition,
          diagram.attributes,
          theme2,
          diagram.from,
          diagram.to,
          activation
        );
        return expanded ? view.Decoration.widget({ widget, block: true, side: 1 }).range(diagram.to) : view.Decoration.replace({ widget, block: true, inclusive: false }).range(diagram.from, diagram.to);
      }),
      true
    );
  };
  return state.StateField.define({
    create(state) {
      const diagrams = readDiagrams(state);
      return { diagrams, decorations: decorate(state, diagrams) };
    },
    update(value, transaction) {
      const parsed = transaction.docChanged || language.syntaxTree(transaction.startState) !== language.syntaxTree(transaction.state);
      if (!parsed && !transaction.selection && !transaction.reconfigured) return value;
      const diagrams = parsed ? readDiagrams(transaction.state) : value.diagrams;
      return { diagrams, decorations: decorate(transaction.state, diagrams) };
    },
    provide: (field) => view.EditorView.decorations.from(field, (value) => value.decorations)
  });
}

// src/plugins/mermaid-plugin.ts
var mermaidMarkDecorations = {
  "mermaid-block-start": view.Decoration.line({ class: "cm-draftly-mermaid-block-start" }),
  "mermaid-block-end": view.Decoration.line({ class: "cm-draftly-mermaid-block-end" }),
  "mermaid-block": view.Decoration.line({ class: "cm-draftly-mermaid-block" }),
  "mermaid-block-rendered": view.Decoration.line({ class: "cm-draftly-mermaid-block-rendered" }),
  "mermaid-marker": view.Decoration.mark({ class: "cm-draftly-mermaid-marker" }),
  "mermaid-hidden": view.Decoration.mark({ class: "cm-draftly-mermaid-hidden" })
};
var mermaidBlockParser = {
  name: "MermaidBlock",
  before: "FencedCode",
  parse(cx, line) {
    const text = line.text;
    const trimmed = text.slice(line.pos).trimStart();
    if (!trimmed.startsWith("```mermaid")) return false;
    const startLine = cx.lineStart;
    let endPos = -1;
    let closeBacktickStart = -1;
    while (cx.nextLine()) {
      const currentText = line.text;
      const currentLineStart = cx.lineStart;
      const lastLineEnd = currentLineStart + currentText.length;
      const trimmedLine = currentText.trim();
      if (trimmedLine === "```") {
        endPos = lastLineEnd;
        closeBacktickStart = currentLineStart + currentText.indexOf("```");
        cx.nextLine();
        break;
      }
    }
    if (endPos === -1) {
      return false;
    }
    const openMarkEnd = startLine + text.indexOf("```mermaid") + 10;
    const openMark = cx.elt("MermaidBlockMark", startLine, openMarkEnd);
    const closeMark = cx.elt("MermaidBlockMark", closeBacktickStart, closeBacktickStart + 3);
    cx.addElement(cx.elt("MermaidBlock", startLine, endPos, [openMark, closeMark]));
    return true;
  }
};
var MermaidPlugin = class extends chunk3TJPHTNQ_cjs.DecorationPlugin {
  constructor(options = {}) {
    super();
    this.options = options;
  }
  name = "mermaid";
  version = "1.0.0";
  decorationPriority = 25;
  requiredNodes = ["MermaidBlock", "MermaidBlockMark"];
  /** Supplies height-changing decorations before CodeMirror calculates its viewport. */
  getExtensions() {
    return [createMermaidBlocks(this.options.activation ?? "select")];
  }
  /**
   * Plugin theme
   */
  get theme() {
    return theme;
  }
  /**
   * Return markdown parser extensions for mermaid syntax
   */
  getMarkdownConfig() {
    return {
      defineNodes: [
        { name: "MermaidBlock", block: true },
        { name: "MermaidBlockMark", style: highlight.tags.processingInstruction }
      ],
      parseBlock: [mermaidBlockParser]
    };
  }
  /**
   * Build decorations for mermaid blocks
   */
  buildDecorations(ctx) {
    const { view: view$1, decorations } = ctx;
    ctx.iterateVisible({
      enter: (node) => {
        const { from, to, name } = node;
        if (name === "MermaidBlock") {
          const nodeLineStart = view$1.state.doc.lineAt(from);
          const nodeLineEnd = view$1.state.doc.lineAt(to);
          const cursorInRange = ctx.selectionOverlapsRange(nodeLineStart.from, nodeLineEnd.to);
          if (!cursorInRange) return false;
          const totalCodeLines = nodeLineEnd.number - nodeLineStart.number - 1;
          const lineNumWidth = String(totalCodeLines).length;
          let codeLineIndex = 1;
          for (let i = nodeLineStart.number; i <= nodeLineEnd.number; i++) {
            const line = view$1.state.doc.line(i);
            const isFenceLine = i === nodeLineStart.number || i === nodeLineEnd.number;
            const relativeLineNum = codeLineIndex;
            decorations.push(mermaidMarkDecorations["mermaid-block"].range(line.from));
            if (i === nodeLineStart.number)
              decorations.push(mermaidMarkDecorations["mermaid-block-start"].range(line.from));
            if (i === nodeLineEnd.number)
              decorations.push(mermaidMarkDecorations["mermaid-block-end"].range(line.from));
            if (!isFenceLine) {
              decorations.push(
                view.Decoration.line({
                  attributes: {
                    "data-line-num": String(relativeLineNum),
                    style: `--line-num-width: ${lineNumWidth}ch`
                  }
                }).range(line.from)
              );
            }
            if (!isFenceLine) {
              codeLineIndex++;
            }
          }
          if (cursorInRange) {
            for (let child = node.node.firstChild; child; child = child.nextSibling) {
              if (child.name === "MermaidBlockMark") {
                decorations.push(mermaidMarkDecorations["mermaid-marker"].range(child.from, child.to));
              }
            }
          }
        }
      }
    });
  }
  /**
   * Render mermaid to HTML for preview mode
   *
   * Renders the actual mermaid diagram to SVG HTML
   */
  async renderToHTML(node, _children, ctx) {
    if (node.name === "MermaidBlock") {
      const content = ctx.sliceDoc(node.from, node.to);
      const lines = content.split("\n");
      const definition = lines.length > 1 ? lines.slice(1, -1).join("\n").trim() : "";
      const fenceLine = lines[0] || "";
      const attributes = parseAttributes(fenceLine);
      const config = this.context?.config;
      const currentTheme = config?.theme === "dark" /* DARK */ ? "dark" : "default";
      const { svg, error } = await renderMermaid(definition, attributes, currentTheme);
      if (error) {
        return `<div class="cm-draftly-mermaid-error">${ctx.sanitize(`[Mermaid Error: ${error}]`)}</div>`;
      }
      return `<div class="cm-draftly-mermaid-rendered">${svg}</div>`;
    }
    if (node.name === "MermaidBlockMark") {
      return "";
    }
    return null;
  }
};
var theme = chunkPULMPDQL_cjs.createTheme({
  default: {
    // Raw mermaid block lines (monospace)
    ".cm-draftly-mermaid-block:not(.cm-draftly-mermaid-block-rendered)": {
      "--radius": "0.375rem",
      position: "relative",
      fontFamily: "var(--draftly-font-mono)",
      fontSize: "0.9rem",
      backgroundColor: "var(--draftly-tint-2)",
      padding: "0 1rem !important",
      paddingLeft: "calc(var(--line-num-width, 2ch) + 1rem) !important",
      lineHeight: "1.5",
      borderLeft: "1px solid var(--draftly-color-border)",
      borderRight: "1px solid var(--draftly-color-border)"
    },
    ".cm-draftly-mermaid-block-start:not(.cm-draftly-mermaid-block-rendered)": {
      overflow: "hidden",
      borderTopLeftRadius: "var(--radius)",
      borderTopRightRadius: "var(--radius)",
      borderTop: "1px solid var(--draftly-color-border)"
    },
    ".cm-draftly-mermaid-block-end:not(.cm-draftly-mermaid-block-rendered)": {
      overflow: "hidden",
      borderBottomLeftRadius: "var(--radius)",
      borderBottomRightRadius: "var(--radius)",
      borderBottom: "1px solid var(--draftly-color-border)"
    },
    ".cm-draftly-mermaid-block:not(.cm-draftly-mermaid-block-rendered)::before": {
      content: "attr(data-line-num)",
      position: "absolute",
      left: "0.5rem",
      top: "0.2rem",
      width: "var(--line-num-width, 2ch)",
      textAlign: "right",
      color: "var(--draftly-color-muted)",
      opacity: "0.6",
      fontFamily: "var(--draftly-font-mono)",
      fontSize: "0.85rem",
      userSelect: "none"
    },
    ".cm-draftly-mermaid-block.cm-draftly-mermaid-block-rendered br": {
      display: "none"
    },
    // Mermaid markers (```mermaid / ```)
    ".cm-draftly-mermaid-marker": {
      color: "var(--draftly-color-muted)",
      fontFamily: "var(--draftly-font-mono)"
    },
    // Hidden mermaid syntax (when cursor is not in range)
    ".cm-draftly-mermaid-hidden": {
      display: "none"
    },
    // Rendered mermaid container
    ".cm-draftly-mermaid-rendered": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "1em 0",
      borderRadius: "4px",
      overflow: "auto"
    },
    // SVG inside rendered container
    ".cm-draftly-mermaid-rendered svg": {
      maxWidth: "100%",
      height: "auto",
      aspectRatio: "auto"
    },
    // Loading state
    ".cm-draftly-mermaid-loading": {
      display: "inline-block",
      padding: "0.5em 1em",
      color: "var(--draftly-color-muted)",
      fontSize: "0.875em",
      fontStyle: "italic",
      fontFamily: "var(--draftly-font-mono)"
    },
    // Error styling
    ".cm-draftly-mermaid-error": {
      display: "inline-block",
      padding: "0.25em 0.5em",
      backgroundColor: "var(--draftly-color-error-surface)",
      color: "var(--draftly-color-danger)",
      borderRadius: "4px",
      fontSize: "0.875em",
      fontStyle: "italic",
      fontFamily: "var(--draftly-font-mono)"
    }
  }
});

exports.MermaidPlugin = MermaidPlugin;
//# sourceMappingURL=chunk-ZPG5FMPQ.cjs.map
//# sourceMappingURL=chunk-ZPG5FMPQ.cjs.map