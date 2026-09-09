'use strict';

var chunkX6JQRPQN_cjs = require('./chunk-X6JQRPQN.cjs');
var chunkXQHP5MJD_cjs = require('./chunk-XQHP5MJD.cjs');
var chunk3TJPHTNQ_cjs = require('./chunk-3TJPHTNQ.cjs');
var chunkPULMPDQL_cjs = require('./chunk-PULMPDQL.cjs');
var view = require('@codemirror/view');
var common = require('@lezer/common');
var highlight = require('@lezer/highlight');
var katex = require('katex');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var katex__default = /*#__PURE__*/_interopDefault(katex);

var latexHighlightTags = {
  [[
    "MathTextCtrlSeq HboxCtrlSeq DefCtrlSeq LetCtrlSeq LeftCtrlSeq RightCtrlSeq",
    "ItemCtrlSeq CenteringCtrlSeq MaketitleCtrlSeq HrefCtrlSeq UrlCtrlSeq",
    "VerbCtrlSeq LstInlineCtrlSeq IncludeGraphicsCtrlSeq IncludeSvgCtrlSeq",
    "CaptionCtrlSeq InputCtrlSeq IncludeCtrlSeq SubfileCtrlSeq",
    "NewCommandCtrlSeq RenewCommandCtrlSeq NewEnvironmentCtrlSeq",
    "RenewEnvironmentCtrlSeq NewTheoremCtrlSeq TheoremStyleCtrlSeq",
    "HLineCtrlSeq TopRuleCtrlSeq MidRuleCtrlSeq BottomRuleCtrlSeq",
    "MultiColumnCtrlSeq ParBoxCtrlSeq TextColorCtrlSeq ColorBoxCtrlSeq",
    "TextMediumCtrlSeq TextSansSerifCtrlSeq TextSuperscriptCtrlSeq",
    "TextSubscriptCtrlSeq TextStrikeOutCtrlSeq SetLengthCtrlSeq",
    "FootnoteCtrlSeq EndnoteCtrlSeq AffilCtrlSeq AffiliationCtrlSeq"
  ].join(" ")]: highlight.tags.keyword,
  "OpenParenCtrlSym CloseParenCtrlSym OpenBracketCtrlSym CloseBracketCtrlSym LineBreakCtrlSym": highlight.tags.operator
};
function injectKatexStyles() {
  if (typeof document === "undefined") return;
  if (katexStylesRequested) return;
  if (document.getElementById(KATEX_STYLE_ID)) return;
  katexStylesRequested = true;
  import('./katex-styles.generated-IW2ATT2O.cjs').then(({ katexStyles }) => {
    if (document.getElementById(KATEX_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = KATEX_STYLE_ID;
    style.textContent = katexStyles;
    document.head.appendChild(style);
  }).catch((e) => {
    katexStylesRequested = false;
    console.error("[draftly] Failed to load KaTeX styles:", e);
  });
}
var KATEX_STYLE_ID = "draftly-katex-styles";
var katexStylesRequested = false;
var DOLLAR = 36;
var mathMarkDecorations = {
  "math-block": view.Decoration.line({ class: "cm-draftly-math-block" }),
  "math-inline": view.Decoration.mark({ class: "cm-draftly-math-inline" }),
  "math-marker": view.Decoration.mark({ class: "cm-draftly-math-marker" }),
  "math-hidden": view.Decoration.mark({ class: "cm-draftly-math-hidden" })
};
function renderMath(latex, displayMode) {
  try {
    const html = katex__default.default.renderToString(latex, {
      displayMode,
      throwOnError: false,
      errorColor: "#d73a49",
      trust: false,
      strict: false
    });
    return { html, error: null };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    return { html: "", error: errorMsg };
  }
}
var InlineMathWidget = class extends view.WidgetType {
  constructor(latex, from, to) {
    super();
    this.latex = latex;
    this.from = from;
    this.to = to;
  }
  /**
   * Compares **content only**.
   *
   * `eq()` answers "can CodeMirror keep the DOM it already built?". Document positions
   * shift on any edit earlier in the document, so including them made the answer
   * permanently no -- every formula below an edit was torn down and re-rendered
   * through KaTeX on every keystroke. The handlers resolve the range from the live DOM instead.
   */
  eq(other) {
    return other.latex === this.latex;
  }
  toDOM(view) {
    const span = document.createElement("span");
    span.className = "cm-draftly-math-rendered cm-draftly-math-rendered-inline";
    span.style.cursor = "pointer";
    const { html, error } = renderMath(this.latex, false);
    if (error) {
      span.classList.add("cm-draftly-math-error");
      span.setAttribute("role", "alert");
      span.textContent = `[Math Error: ${error}]`;
    } else {
      span.innerHTML = html;
    }
    span.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const range = chunkXQHP5MJD_cjs.resolveWidgetRange(view, span, ["InlineMath"]) ?? { from: this.from, to: this.to };
      view.dispatch({
        selection: { anchor: range.from, head: range.to },
        scrollIntoView: true
      });
      view.focus();
    });
    return span;
  }
  ignoreEvent(event) {
    return event.type !== "click";
  }
};
var MathBlockWidget = class extends view.WidgetType {
  constructor(latex, from, to) {
    super();
    this.latex = latex;
    this.from = from;
    this.to = to;
  }
  /**
   * Compares **content only**.
   *
   * `eq()` answers "can CodeMirror keep the DOM it already built?". Document positions
   * shift on any edit earlier in the document, so including them made the answer
   * permanently no -- every block formula below an edit re-rendered through
   * KaTeX on every keystroke. The handlers resolve the range from the live DOM instead.
   */
  eq(other) {
    return other.latex === this.latex;
  }
  toDOM(view) {
    const div = document.createElement("div");
    div.className = "cm-draftly-math-rendered cm-draftly-math-rendered-block";
    div.style.cursor = "pointer";
    const { html, error } = renderMath(this.latex, true);
    if (error) {
      div.classList.add("cm-draftly-math-error");
      div.setAttribute("role", "alert");
      div.textContent = `[Math Error: ${error}]`;
    } else {
      div.innerHTML = html;
    }
    div.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const range = chunkXQHP5MJD_cjs.resolveWidgetRange(view, div, ["MathBlock"]) ?? { from: this.from, to: this.to };
      view.dispatch({
        selection: { anchor: range.from, head: range.to },
        scrollIntoView: true
      });
      view.focus();
    });
    return div;
  }
  ignoreEvent(event) {
    return event.type !== "click";
  }
};
var inlineMathParser = {
  name: "InlineMath",
  parse(cx, next, pos) {
    if (next !== DOLLAR) return -1;
    if (cx.char(pos + 1) === DOLLAR) return -1;
    let end = pos + 1;
    while (end < cx.end) {
      const char = cx.char(end);
      if (char === DOLLAR) {
        if (cx.char(end + 1) !== DOLLAR) {
          const content = cx.slice(pos + 1, end);
          if (content.trim().length === 0) return -1;
          const openMark = cx.elt("InlineMathMark", pos, pos + 1);
          const closeMark = cx.elt("InlineMathMark", end, end + 1);
          const inlineMath = cx.elt("InlineMath", pos, end + 1, [openMark, closeMark]);
          return cx.addElement(inlineMath);
        }
        return -1;
      }
      if (char === 92) {
        end += 2;
        continue;
      }
      end++;
    }
    return -1;
  }
};
var mathBlockParser = {
  name: "MathBlock",
  parse(cx, line) {
    const text = line.text;
    const openIndex = text.indexOf("$$", line.pos);
    if (openIndex === -1) return false;
    if (text.slice(line.pos, openIndex).trim() !== "") return false;
    const startLine = cx.lineStart;
    const openMarkStart = startLine + openIndex;
    let endPos = -1;
    const sameLineClose = text.indexOf("$$", openIndex + 2);
    if (sameLineClose !== -1) {
      if (text.slice(sameLineClose + 2).trim() !== "") return false;
      endPos = startLine + sameLineClose + 2;
      cx.nextLine();
    } else {
      while (cx.nextLine()) {
        const currentText = line.text;
        const closeIndex = currentText.lastIndexOf("$$");
        if (closeIndex !== -1 && currentText.slice(closeIndex + 2).trim() === "") {
          endPos = cx.lineStart + closeIndex + 2;
          cx.nextLine();
          break;
        }
      }
    }
    if (endPos === -1) return false;
    const openMark = cx.elt("MathBlockMark", openMarkStart, openMarkStart + 2);
    const closeMark = cx.elt("MathBlockMark", endPos - 2, endPos);
    cx.addElement(cx.elt("MathBlock", startLine, endPos, [openMark, closeMark]));
    return true;
  }
};
var MathPlugin = class extends chunk3TJPHTNQ_cjs.DecorationPlugin {
  name = "math";
  version = "1.0.0";
  decorationPriority = 25;
  requiredNodes = ["InlineMath", "MathBlock", "InlineMathMark", "MathBlockMark"];
  /** A LaTeX parser overlaid on math content, when the host supplied one. */
  mathParser;
  /**
   * @param options - LaTeX parser for highlighting raw math source, and whether to inject
   * KaTeX's stylesheet; see {@link MathPluginOptions}
   */
  constructor(options = {}) {
    super();
    this.mathParser = options.mathParser;
    if (options.injectStyles) injectKatexStyles();
  }
  /**
   * Plugin theme
   */
  get theme() {
    return theme;
  }
  /**
   * Intercepts dollar typing to wrap selected text as inline math.
   *
   * If user types '$' while text is selected, wraps each selected range
   * with single dollars (selected -> $selected$).
   */
  getExtensions() {
    return [chunkX6JQRPQN_cjs.createWrapSelectionInputHandler({ $: "$" })];
  }
  /**
   * Return markdown parser extensions for math syntax
   */
  getMarkdownConfig() {
    return {
      defineNodes: [
        { name: "InlineMath", style: highlight.tags.emphasis },
        { name: "InlineMathMark", style: highlight.tags.processingInstruction },
        { name: "MathBlock", block: true },
        { name: "MathBlockMark", style: highlight.tags.processingInstruction }
      ],
      parseInline: [inlineMathParser],
      parseBlock: [mathBlockParser],
      ...this.mathParser ? { wrap: this.buildMathOverlay(this.mathParser) } : {}
    };
  }
  /**
   * Overlay a LaTeX parser onto math node contents.
   *
   * The overlay spans the `$`/`$$` markers rather than stopping short of them, so
   * the LaTeX parser enters math mode and tokenises operators and identifiers as
   * math rather than as prose.
   *
   * @param parser - The LaTeX parser to overlay
   * @returns A mixed-parser wrapper for the markdown parser
   */
  buildMathOverlay(parser) {
    return common.parseMixed((node) => {
      if (node.name !== "InlineMath" && node.name !== "MathBlock") return null;
      return { parser, overlay: [{ from: node.from, to: node.to }] };
    });
  }
  /**
   * Build decorations for math expressions
   */
  buildDecorations(ctx) {
    const { view: view$1, decorations } = ctx;
    ctx.iterateVisible({
      enter: (node) => {
        const { from, to, name } = node;
        if (name === "InlineMath") {
          const content = view$1.state.sliceDoc(from, to);
          const latex = content.slice(1, -1);
          const cursorInRange = ctx.selectionOverlapsRange(from, to);
          if (cursorInRange) {
            decorations.push(mathMarkDecorations["math-inline"].range(from, to));
            for (let child = node.node.firstChild; child; child = child.nextSibling) {
              if (child.name === "InlineMathMark") {
                decorations.push(mathMarkDecorations["math-marker"].range(child.from, child.to));
              }
            }
          } else {
            decorations.push(
              view.Decoration.replace({
                widget: new InlineMathWidget(latex, from, to)
              }).range(from, to)
            );
          }
        }
        if (name === "MathBlock") {
          const content = view$1.state.sliceDoc(from, to);
          const lines = content.split("\n");
          const latex = lines.slice(1, -1).join("\n").trim();
          const singleLine = !content.includes("\n");
          const latexContent = singleLine ? content.slice(2, -2).trim() : latex;
          const nodeLineStart = view$1.state.doc.lineAt(from);
          const nodeLineEnd = view$1.state.doc.lineAt(to);
          const cursorInRange = ctx.selectionOverlapsRange(nodeLineStart.from, nodeLineEnd.to);
          decorations.push(mathMarkDecorations["math-block"].range(from));
          decorations.push(
            view.Decoration.widget({
              widget: new MathBlockWidget(latexContent, from, to),
              side: 1,
              block: false
            }).range(to)
          );
          for (let i = nodeLineStart.number; i <= nodeLineEnd.number; i++) {
            const line = view$1.state.doc.line(i);
            decorations.push(mathMarkDecorations["math-block"].range(line.from));
          }
          if (cursorInRange) {
            for (let child = node.node.firstChild; child; child = child.nextSibling) {
              if (child.name === "MathBlockMark") {
                decorations.push(mathMarkDecorations["math-marker"].range(child.from, child.to));
              }
            }
          } else {
            decorations.push(mathMarkDecorations["math-hidden"].range(from, to));
          }
        }
      }
    });
  }
  /**
   * Render math to HTML for preview mode
   */
  renderToHTML(node, _children, ctx) {
    if (node.name === "InlineMath") {
      const content = ctx.sliceDoc(node.from, node.to);
      const latex = content.slice(1, -1);
      const { html, error } = renderMath(latex, false);
      if (error) {
        return `<span class="cm-draftly-math-error">[Math Error: ${ctx.sanitize(error)}]</span>`;
      }
      return `<span class="cm-draftly-math-rendered cm-draftly-math-rendered-inline">${html}</span>`;
    }
    if (node.name === "MathBlock") {
      const content = ctx.sliceDoc(node.from, node.to);
      const lines = content.split("\n");
      const latex = lines.length > 1 ? lines.slice(1, -1).join("\n").trim() : content.slice(2, -2).trim();
      const { html, error } = renderMath(latex, true);
      if (error) {
        return `<div class="cm-draftly-math-error">[Math Error: ${ctx.sanitize(error)}]</div>`;
      }
      return `<div class="cm-draftly-math-rendered cm-draftly-math-rendered-block">${html}</div>`;
    }
    if (node.name === "InlineMathMark" || node.name === "MathBlockMark") {
      return "";
    }
    return null;
  }
};
var theme = chunkPULMPDQL_cjs.createTheme({
  default: {
    ".cm-draftly-math-block": {
      fontFamily: "var(--draftly-font-mono)"
    },
    ".cm-draftly-math-block br": {
      display: "none"
    },
    // Math markers ($ $$)
    ".cm-draftly-math-marker": {
      color: "var(--draftly-color-muted)",
      fontFamily: "var(--draftly-font-mono)"
    },
    // Inline math styling when editing
    ".cm-draftly-math-inline": {
      fontFamily: "var(--draftly-font-mono)",
      fontSize: "0.9em"
    },
    // Hidden math syntax (when cursor is not in range)
    ".cm-draftly-math-hidden": {
      display: "none"
    },
    // Hidden line (for multi-line blocks)
    ".cm-draftly-hidden-line": {
      display: "none"
    },
    // Rendered math container (both inline and block)
    ".cm-draftly-math-rendered": {
      fontFamily: "KaTeX_Main, 'Times New Roman', serif"
    },
    // Inline rendered math
    ".cm-draftly-math-rendered-inline": {
      display: "inline",
      verticalAlign: "baseline"
    },
    // Block rendered math (display mode)
    ".cm-draftly-math-rendered-block": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "1em 0",
      backgroundColor: "var(--draftly-tint-1)",
      borderRadius: "4px",
      overflow: "auto"
    },
    // Math error styling
    ".cm-draftly-math-error": {
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

exports.MathPlugin = MathPlugin;
exports.latexHighlightTags = latexHighlightTags;
//# sourceMappingURL=chunk-A3MEDSTQ.cjs.map
//# sourceMappingURL=chunk-A3MEDSTQ.cjs.map