import { DraftlyPlugin, DecorationPlugin } from './chunk-UCHBDJ4R.js';
import { createWrapSelectionInputHandler } from './chunk-65NNRAME.js';
import { PreviewRenderer } from './chunk-HVDMBUET.js';
import { createTheme, toggleMarkdownStyle } from './chunk-TD3L5C45.js';
import { Decoration, BlockWrapper, keymap, EditorView, WidgetType } from '@codemirror/view';
import { syntaxTree, LanguageDescription } from '@codemirror/language';
import { tags, highlightCode } from '@lezer/highlight';
import { Annotation, Prec, RangeSet } from '@codemirror/state';
import { Table } from '@lezer/markdown';
import DOMPurify from 'dompurify';
import katex from 'katex';
import katexCss from 'katex/dist/katex.min.css?raw';
import mermaid from 'mermaid';
import { languages } from '@codemirror/language-data';
import * as emoji from 'node-emoji';

// src/plugins/paragraph-plugin.ts
var ParagraphPlugin = class extends DraftlyPlugin {
  name = "paragraph";
  version = "1.0.0";
  requiredNodes = ["Paragraph"];
  /**
   * Plugin theme for preview styling
   */
  get theme() {
    return theme;
  }
  renderToHTML(node, children) {
    if (node.name !== "Paragraph") {
      return null;
    }
    return `<p class="cm-draftly-paragraph">${children}</p>`;
  }
};
var theme = createTheme({
  default: {
    ".cm-draftly-paragraph": {
      paddingTop: "0.5em",
      paddingBottom: "0.5em"
    }
  }
});
var HEADING_TYPES = ["ATXHeading1", "ATXHeading2", "ATXHeading3", "ATXHeading4", "ATXHeading5", "ATXHeading6"];
var headingMarkDecorations = {
  "heading-1": Decoration.mark({ class: "cm-draftly-h1" }),
  "heading-2": Decoration.mark({ class: "cm-draftly-h2" }),
  "heading-3": Decoration.mark({ class: "cm-draftly-h3" }),
  "heading-4": Decoration.mark({ class: "cm-draftly-h4" }),
  "heading-5": Decoration.mark({ class: "cm-draftly-h5" }),
  "heading-6": Decoration.mark({ class: "cm-draftly-h6" }),
  "header-mark-class": Decoration.mark({ class: "cm-draftly-header-mark" }),
  "heading-mark": Decoration.replace({})
};
var headingLineDecorations = {
  "heading-1": Decoration.line({ class: "cm-draftly-line-h1" }),
  "heading-2": Decoration.line({ class: "cm-draftly-line-h2" }),
  "heading-3": Decoration.line({ class: "cm-draftly-line-h3" }),
  "heading-4": Decoration.line({ class: "cm-draftly-line-h4" }),
  "heading-5": Decoration.line({ class: "cm-draftly-line-h5" }),
  "heading-6": Decoration.line({ class: "cm-draftly-line-h6" })
};
var HeadingPlugin = class extends DecorationPlugin {
  name = "heading";
  version = "1.0.0";
  decorationPriority = 10;
  requiredNodes = [
    "ATXHeading1",
    "ATXHeading2",
    "ATXHeading3",
    "ATXHeading4",
    "ATXHeading5",
    "ATXHeading6",
    "HeaderMark"
  ];
  /**
   * Constructor - calls super constructor
   */
  constructor() {
    super();
  }
  /**
   * Plugin theme
   */
  get theme() {
    return theme2;
  }
  /**
   * Build heading decorations by iterating the syntax tree
   */
  buildDecorations(ctx) {
    const { view, decorations } = ctx;
    const tree = syntaxTree(view.state);
    tree.iterate({
      enter: (node) => {
        const { from, to, name } = node;
        if (!HEADING_TYPES.includes(name)) {
          return;
        }
        const level = parseInt(name.slice(-1), 10);
        const headingClass = `heading-${level}`;
        const lineClass = `heading-${level}`;
        const line = view.state.doc.lineAt(from);
        decorations.push(headingLineDecorations[lineClass].range(line.from));
        decorations.push(headingMarkDecorations[headingClass].range(from, to));
        const headingMark = node.node.getChild("HeaderMark");
        if (headingMark) {
          const markEnd = Math.min(headingMark.to + 1, line.to);
          const cursorInNode = ctx.selectionOverlapsRange(from, to);
          if (!cursorInNode) {
            decorations.push(headingMarkDecorations["heading-mark"].range(headingMark.from, markEnd));
          } else {
            decorations.push(headingMarkDecorations["header-mark-class"].range(headingMark.from, markEnd));
          }
        }
      }
    });
  }
  renderToHTML(node, children) {
    if (node.name === "HeaderMark") {
      return "";
    }
    if (!HEADING_TYPES.includes(node.name)) {
      return null;
    }
    const level = parseInt(node.name.slice(-1), 10);
    const lineClass = headingLineDecorations[`heading-${level}`].spec.class;
    const headingClass = headingMarkDecorations[`heading-${level}`].spec.class;
    return `<div class="${lineClass}">
      <h${level} class="${headingClass}">${children}</h${level}>
    </div>
`;
  }
};
var theme2 = createTheme({
  default: {
    ".cm-draftly-h1": {
      fontSize: "2em",
      fontWeight: "bold",
      fontFamily: "sans-serif",
      textDecoration: "none"
    },
    ".cm-draftly-h2": {
      fontSize: "1.75em",
      fontWeight: "bold",
      fontFamily: "sans-serif",
      textDecoration: "none"
    },
    ".cm-draftly-h3": {
      fontSize: "1.5em",
      fontWeight: "bold",
      fontFamily: "sans-serif",
      textDecoration: "none"
    },
    ".cm-draftly-h4": {
      fontSize: "1.25em",
      fontWeight: "bold",
      fontFamily: "sans-serif",
      textDecoration: "none"
    },
    ".cm-draftly-h5": {
      fontSize: "1em",
      fontWeight: "bold",
      fontFamily: "sans-serif",
      textDecoration: "none"
    },
    ".cm-draftly-h6": {
      fontSize: "0.75em",
      fontWeight: "bold",
      fontFamily: "sans-serif",
      textDecoration: "none"
    },
    // Heading line styles
    ".cm-draftly-line-h1": {
      paddingTop: "1.5em",
      paddingBottom: "0.5em"
    },
    ".cm-draftly-line-h2": {
      paddingTop: "1.25em",
      paddingBottom: "0.5em"
    },
    ".cm-draftly-line-h3, .cm-draftly-line-h4, .cm-draftly-line-h5, .cm-draftly-line-h6": {
      paddingTop: "1em",
      paddingBottom: "0.5em"
    },
    ".cm-draftly-header-mark": {
      opacity: 0.5
    }
  }
});
var INLINE_TYPES = {
  Emphasis: "emphasis",
  StrongEmphasis: "strong",
  Strikethrough: "strikethrough",
  Subscript: "subscript",
  Superscript: "superscript",
  Highlight: "highlight"
};
var inlineMarkDecorations = {
  emphasis: Decoration.mark({ class: "cm-draftly-emphasis" }),
  strong: Decoration.mark({ class: "cm-draftly-strong" }),
  strikethrough: Decoration.mark({ class: "cm-draftly-strikethrough" }),
  subscript: Decoration.mark({ class: "cm-draftly-subscript" }),
  superscript: Decoration.mark({ class: "cm-draftly-superscript" }),
  highlight: Decoration.mark({ class: "cm-draftly-highlight" }),
  // Markers (* _ ~~ ^ ~ ==)
  "inline-mark": Decoration.replace({})
};
var EQUALS = 61;
var Punctuation = /[!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~\xA1\u2010-\u2027]/;
try {
  Punctuation = new RegExp("[\\p{S}|\\p{P}]", "u");
} catch {
}
var HighlightDelim = { resolve: "Highlight", mark: "HighlightMark" };
var highlightParser = {
  name: "Highlight",
  parse(cx, next, pos) {
    if (next !== EQUALS || cx.char(pos + 1) !== EQUALS) return -1;
    if (cx.char(pos + 2) === EQUALS) return -1;
    const before = cx.slice(pos - 1, pos);
    const after = cx.slice(pos + 2, pos + 3);
    const sBefore = /\s|^$/.test(before), sAfter = /\s|^$/.test(after);
    const pBefore = Punctuation.test(before), pAfter = Punctuation.test(after);
    return cx.addDelimiter(
      HighlightDelim,
      pos,
      pos + 2,
      !sAfter && (!pAfter || sBefore || pBefore),
      !sBefore && (!pBefore || sAfter || pAfter)
    );
  }
};
var InlinePlugin = class extends DecorationPlugin {
  name = "inline";
  version = "1.0.0";
  decorationPriority = 20;
  requiredNodes = [
    "Emphasis",
    "StrongEmphasis",
    "Strikethrough",
    "Subscript",
    "Superscript",
    "Highlight",
    "EmphasisMark",
    "StrikethroughMark",
    "SubscriptMark",
    "SuperscriptMark",
    "HighlightMark"
  ];
  marks = [];
  constructor() {
    super();
    for (const mark of Object.keys(INLINE_TYPES)) {
      this.marks.push(...this.getMarkerNames(mark));
    }
  }
  /**
   * Plugin theme
   */
  get theme() {
    return theme3;
  }
  /**
   * Keyboard shortcuts for inline formatting
   */
  getKeymap() {
    return [
      {
        key: "Mod-b",
        run: toggleMarkdownStyle("**"),
        preventDefault: true
      },
      {
        key: "Mod-i",
        run: toggleMarkdownStyle("*"),
        preventDefault: true
      },
      {
        key: "Mod-Shift-s",
        run: toggleMarkdownStyle("~~"),
        preventDefault: true
      },
      {
        key: "Mod-,",
        run: toggleMarkdownStyle("~"),
        preventDefault: true
      },
      {
        key: "Mod-.",
        run: toggleMarkdownStyle("^"),
        preventDefault: true
      },
      {
        key: "Mod-Shift-h",
        run: toggleMarkdownStyle("=="),
        preventDefault: true
      }
    ];
  }
  /**
   * Intercepts inline marker typing to wrap selected text.
   *
   * If user types inline markers while text is selected, wraps each selected
   * range with the appropriate marker:
   * - * _ ~ ^ -> marker + selected + marker
   * - = -> ==selected==
   */
  getExtensions() {
    return [createWrapSelectionInputHandler({ "*": "*", _: "_", "~": "~", "^": "^", "=": "==" })];
  }
  /**
   * Return markdown parser extensions for highlight syntax (==text==)
   */
  getMarkdownConfig() {
    return {
      defineNodes: [
        { name: "Highlight", style: tags.emphasis },
        { name: "HighlightMark", style: tags.processingInstruction }
      ],
      parseInline: [highlightParser]
    };
  }
  /**
   * Build inline decorations by iterating the syntax tree
   */
  buildDecorations(ctx) {
    const { view, decorations } = ctx;
    const tree = syntaxTree(view.state);
    tree.iterate({
      enter: (node) => {
        const { from, to, name } = node;
        const inlineType = INLINE_TYPES[name];
        if (!inlineType) {
          return;
        }
        decorations.push(inlineMarkDecorations[inlineType].range(from, to));
        const cursorInNode = ctx.selectionOverlapsRange(from, to);
        if (!cursorInNode) {
          const markerNames = this.getMarkerNames(name);
          for (const markerName of markerNames) {
            const marks = node.node.getChildren(markerName);
            for (const mark of marks) {
              decorations.push(inlineMarkDecorations["inline-mark"].range(mark.from, mark.to));
            }
          }
        }
      }
    });
  }
  /**
   * Get the marker node names for a given inline type
   */
  getMarkerNames(nodeType) {
    switch (nodeType) {
      case "Emphasis":
      case "StrongEmphasis":
        return ["EmphasisMark"];
      case "Strikethrough":
        return ["StrikethroughMark"];
      case "Subscript":
        return ["SubscriptMark"];
      case "Superscript":
        return ["SuperscriptMark"];
      case "Highlight":
        return ["HighlightMark"];
      default:
        return [];
    }
  }
  renderToHTML(node, children) {
    if (this.marks.includes(node.name)) {
      return "";
    }
    const inlineType = INLINE_TYPES[node.name];
    if (!inlineType) {
      return null;
    }
    const className = inlineMarkDecorations[inlineType].spec.class;
    return `<span class="${className}">${children}</span>`;
  }
};
var theme3 = createTheme({
  default: {
    // Emphasis (italic)
    ".cm-draftly-emphasis": {
      fontStyle: "italic"
    },
    // Strong (bold)
    ".cm-draftly-strong": {
      fontWeight: "bold"
    },
    // Strikethrough
    ".cm-draftly-strikethrough": {
      textDecoration: "line-through",
      opacity: "0.7"
    },
    // Subscript
    ".cm-draftly-subscript": {
      fontSize: "0.75em",
      verticalAlign: "sub"
    },
    // Superscript
    ".cm-draftly-superscript": {
      fontSize: "0.75em",
      verticalAlign: "super"
    },
    // Highlight
    ".cm-draftly-highlight": {
      backgroundColor: "rgba(255, 213, 0, 0.35)",
      borderRadius: "2px",
      padding: "1px 2px"
    }
  }
});
var linkMarkDecorations = {
  "link-text": Decoration.mark({ class: "cm-draftly-link-text" }),
  "link-marker": Decoration.mark({ class: "cm-draftly-link-marker" }),
  "link-url": Decoration.mark({ class: "cm-draftly-link-url" }),
  "link-hidden": Decoration.mark({ class: "cm-draftly-link-hidden" })
};
function parseLinkMarkdown(content) {
  const match = content.match(/^\[([^\]]*)\]\(([^"\s)]+)(?:\s+"([^"]*)")?\s*\)$/);
  if (!match) return null;
  const result = {
    text: match[1] || "",
    url: match[2]
  };
  if (match[3] !== void 0) {
    result.title = match[3];
  }
  return result;
}
var LinkTooltipWidget = class extends WidgetType {
  constructor(url, from, to) {
    super();
    this.url = url;
    this.from = from;
    this.to = to;
  }
  eq(other) {
    return other.url === this.url && other.from === this.from && other.to === this.to;
  }
  toDOM(view) {
    const wrapper = document.createElement("span");
    wrapper.className = "cm-draftly-link-wrapper";
    wrapper.style.cursor = "pointer";
    const tooltip = document.createElement("span");
    tooltip.className = "cm-draftly-link-tooltip";
    tooltip.textContent = this.url;
    wrapper.appendChild(tooltip);
    wrapper.addEventListener("mouseenter", () => {
      tooltip.classList.add("cm-draftly-link-tooltip-visible");
    });
    wrapper.addEventListener("mouseleave", () => {
      tooltip.classList.remove("cm-draftly-link-tooltip-visible");
    });
    wrapper.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        window.open(this.url, "_blank", "noopener,noreferrer");
      } else {
        e.preventDefault();
        e.stopPropagation();
        view.dispatch({
          selection: { anchor: this.from, head: this.to },
          scrollIntoView: true
        });
        view.focus();
      }
    });
    return wrapper;
  }
  ignoreEvent(event) {
    return event.type !== "click" && event.type !== "mouseenter" && event.type !== "mouseleave";
  }
};
var LinkPlugin = class extends DecorationPlugin {
  name = "link";
  version = "1.0.0";
  decorationPriority = 22;
  requiredNodes = ["Link"];
  constructor() {
    super();
  }
  /**
   * Plugin theme
   */
  get theme() {
    return theme4;
  }
  /**
   * Keyboard shortcuts for link formatting
   */
  getKeymap() {
    return [
      {
        key: "Mod-k",
        run: (view) => this.toggleLink(view),
        preventDefault: true
      }
    ];
  }
  /**
   * URL regex pattern
   */
  urlPattern = /^(https?:\/\/|www\.)[^\s]+$/i;
  /**
   * Toggle link on selection
   * - If text is selected and is a URL: [](url) with cursor in brackets
   * - If text is selected (not URL): [text]() with cursor in parentheses
   * - If nothing selected: []() with cursor in brackets
   * - If already a link: remove syntax, leave plain text
   */
  toggleLink(view) {
    const { state } = view;
    const { from, to, empty } = state.selection.main;
    const selectedText = state.sliceDoc(from, to);
    const linkMatch = selectedText.match(/^\[([^\]]*)\]\(([^)]*)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1] || "";
      view.dispatch({
        changes: { from, to, insert: linkText },
        selection: { anchor: from, head: from + linkText.length }
      });
      return true;
    }
    const lineStart = state.doc.lineAt(from).from;
    const lineEnd = state.doc.lineAt(to).to;
    const lineText = state.sliceDoc(lineStart, lineEnd);
    const linkRegex = /\[([^\]]*)\]\(([^)]*)\)/g;
    let match;
    while ((match = linkRegex.exec(lineText)) !== null) {
      const matchFrom = lineStart + match.index;
      const matchTo = matchFrom + match[0].length;
      if (from >= matchFrom && to <= matchTo) {
        const linkText = match[1] || "";
        view.dispatch({
          changes: { from: matchFrom, to: matchTo, insert: linkText },
          selection: { anchor: matchFrom, head: matchFrom + linkText.length }
        });
        return true;
      }
    }
    if (empty) {
      view.dispatch({
        changes: { from, insert: "[]()" },
        selection: { anchor: from + 1 }
      });
    } else if (this.urlPattern.test(selectedText)) {
      const newText = `[](${selectedText})`;
      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from + 1 }
      });
    } else {
      const newText = `[${selectedText}]()`;
      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from + selectedText.length + 3 }
      });
    }
    return true;
  }
  buildDecorations(ctx) {
    const { view, decorations } = ctx;
    const tree = syntaxTree(view.state);
    tree.iterate({
      enter: (node) => {
        const { from, to, name } = node;
        if (name === "Link") {
          const content = view.state.sliceDoc(from, to);
          const parsed = parseLinkMarkdown(content);
          if (!parsed) return;
          const cursorInRange = ctx.selectionOverlapsRange(from, to);
          if (cursorInRange) {
            this.decorateRawLink(node.node, decorations, view);
          } else {
            decorations.push(linkMarkDecorations["link-hidden"].range(from, to));
            decorations.push(
              Decoration.widget({
                widget: new LinkTooltipWidget(parsed.url, from, to),
                side: 1
              }).range(to)
            );
            decorations.push(
              Decoration.replace({
                widget: new LinkTextWidget(parsed.text, parsed.url, from, to, parsed.title)
              }).range(from, to)
            );
          }
        }
      }
    });
  }
  /**
   * Decorate raw link markdown when cursor is in range
   */
  decorateRawLink(node, decorations, view) {
    const content = view.state.sliceDoc(node.from, node.to);
    decorations.push(linkMarkDecorations["link-marker"].range(node.from, node.from + 1));
    const bracketParen = content.indexOf("](");
    if (bracketParen !== -1) {
      if (bracketParen > 1) {
        decorations.push(linkMarkDecorations["link-text"].range(node.from + 1, node.from + bracketParen));
      }
      decorations.push(
        linkMarkDecorations["link-marker"].range(node.from + bracketParen, node.from + bracketParen + 2)
      );
      const urlChild = node.getChild("URL");
      if (urlChild) {
        decorations.push(linkMarkDecorations["link-url"].range(urlChild.from, urlChild.to));
      }
      decorations.push(linkMarkDecorations["link-marker"].range(node.to - 1, node.to));
    }
  }
  /**
   * Render link to HTML for preview mode
   */
  renderToHTML(node, _children, ctx) {
    if (node.name !== "Link") return null;
    const content = ctx.sliceDoc(node.from, node.to);
    const parsed = parseLinkMarkdown(content);
    if (!parsed) return null;
    const textContent = ctx.sanitize(parsed.text);
    const urlAttr = ctx.sanitize(parsed.url);
    const titleAttr = parsed.title ? ` title="${ctx.sanitize(parsed.title)}"` : "";
    return `<a class="cm-draftly-link" href="${urlAttr}"${titleAttr} target="_blank" rel="noopener noreferrer">${textContent}</a>`;
  }
};
var LinkTextWidget = class extends WidgetType {
  constructor(text, url, from, to, title) {
    super();
    this.text = text;
    this.url = url;
    this.from = from;
    this.to = to;
    this.title = title;
  }
  eq(other) {
    return other.text === this.text && other.url === this.url && other.from === this.from && other.to === this.to && other.title === this.title;
  }
  toDOM(view) {
    const span = document.createElement("span");
    span.className = "cm-draftly-link-styled";
    span.textContent = this.text;
    span.style.cursor = "pointer";
    if (this.title) {
      span.title = this.title;
    }
    const tooltip = document.createElement("span");
    tooltip.className = "cm-draftly-link-tooltip";
    tooltip.textContent = this.url;
    span.appendChild(tooltip);
    span.addEventListener("mouseenter", () => {
      tooltip.classList.add("cm-draftly-link-tooltip-visible");
    });
    span.addEventListener("mouseleave", () => {
      tooltip.classList.remove("cm-draftly-link-tooltip-visible");
    });
    span.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        window.open(this.url, "_blank", "noopener,noreferrer");
      } else {
        e.preventDefault();
        e.stopPropagation();
        view.dispatch({
          selection: { anchor: this.from, head: this.to },
          scrollIntoView: true
        });
        view.focus();
      }
    });
    return span;
  }
  ignoreEvent(event) {
    return event.type !== "click" && event.type !== "mouseenter" && event.type !== "mouseleave";
  }
};
var theme4 = createTheme({
  default: {
    // Link text
    ".cm-draftly-link-text": {
      color: "#0366d6"
    },
    // Link markers ([ ] ( ))
    ".cm-draftly-link-marker": {
      color: "#6a737d",
      fontFamily: "var(--font-jetbrains-mono, monospace)"
    },
    // URL in raw markdown
    ".cm-draftly-link-url": {
      color: "#6a737d",
      fontStyle: "italic"
    },
    // Hidden markdown syntax
    ".cm-draftly-link-hidden": {
      display: "none"
    },
    // Styled link when cursor is not in range
    ".cm-draftly-link-styled": {
      color: "#0366d6",
      textDecoration: "underline",
      position: "relative",
      cursor: "pointer"
    },
    ".cm-draftly-link-styled:hover": {
      color: "#0056b3"
    },
    // Preview link styling
    ".cm-draftly-link": {
      color: "#0366d6",
      textDecoration: "underline"
    },
    ".cm-draftly-link:hover": {
      color: "#0056b3"
    },
    // Tooltip styling
    ".cm-draftly-link-tooltip": {
      display: "none",
      position: "absolute",
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#24292e",
      color: "#ffffff",
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      whiteSpace: "nowrap",
      zIndex: "1000",
      pointerEvents: "none",
      marginBottom: "4px",
      maxWidth: "300px",
      overflow: "hidden",
      textOverflow: "ellipsis"
    },
    ".cm-draftly-link-tooltip-visible": {
      display: "block"
    }
  },
  dark: {
    ".cm-draftly-link-text": {
      color: "#58a6ff"
    },
    ".cm-draftly-link-marker": {
      color: "#8b949e"
    },
    ".cm-draftly-link-url": {
      color: "#8b949e"
    },
    ".cm-draftly-link-styled": {
      color: "#58a6ff"
    },
    ".cm-draftly-link-styled:hover": {
      color: "#79c0ff"
    },
    ".cm-draftly-link": {
      color: "#58a6ff"
    },
    ".cm-draftly-link:hover": {
      color: "#79c0ff"
    },
    ".cm-draftly-link-tooltip": {
      backgroundColor: "#30363d",
      color: "#c9d1d9"
    }
  }
});
var classes = {
  // Unordered list classes
  lineUL: "cm-draftly-list-line-ul",
  markUL: "cm-draftly-list-mark-ul",
  // Ordered list classes
  lineOL: "cm-draftly-list-line-ol",
  markOL: "cm-draftly-list-mark-ol",
  // Task list classes
  taskLine: "cm-draftly-task-line",
  taskMarker: "cm-draftly-task-marker",
  // Common classes
  content: "cm-draftly-list-content",
  indent: "cm-draftly-list-indent",
  active: " cm-draftly-active",
  preview: "cm-draftly-preview"
};
var TaskCheckboxWidget = class extends WidgetType {
  constructor(checked) {
    super();
    this.checked = checked;
  }
  eq(other) {
    return other.checked === this.checked;
  }
  toDOM(view) {
    const wrap = document.createElement("span");
    wrap.className = `cm-draftly-task-checkbox ${this.checked ? "checked" : ""}`;
    wrap.setAttribute("aria-hidden", "true");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = this.checked;
    checkbox.tabIndex = -1;
    checkbox.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.toggleCheckbox(view, wrap);
    });
    wrap.appendChild(checkbox);
    return wrap;
  }
  ignoreEvent() {
    return false;
  }
  /** Toggle the checkbox state in the document */
  toggleCheckbox(view, wrap) {
    const pos = view.posAtDOM(wrap);
    const line = view.state.doc.lineAt(pos);
    const match = line.text.match(/^(\s*(?:[-*+]|\d+\.)\s*)\[([ xX])\]/);
    if (match) {
      const markerStart = line.from + match[1].length + 1;
      const newChar = this.checked ? " " : "x";
      view.dispatch({
        changes: { from: markerStart, to: markerStart + 1, insert: newChar }
      });
    }
  }
};
var ListPlugin = class extends DecorationPlugin {
  name = "list";
  version = "1.0.0";
  decorationPriority = 20;
  requiredNodes = [
    "BulletList",
    "OrderedList",
    "ListItem",
    "ListMark",
    "Task",
    "TaskMarker"
  ];
  get theme() {
    return theme5;
  }
  /**
   * Keyboard shortcuts for list formatting
   */
  getKeymap() {
    return [
      {
        key: "Mod-Shift-8",
        run: (view) => this.toggleListOnLines(view, "- "),
        preventDefault: true
      },
      {
        key: "Mod-Shift-7",
        run: (view) => this.toggleListOnLines(view, "1. "),
        preventDefault: true
      },
      {
        key: "Mod-Shift-9",
        run: (view) => this.toggleListOnLines(view, "- [ ] "),
        preventDefault: true
      }
    ];
  }
  /**
   * Toggle list marker on current line or selected lines
   */
  toggleListOnLines(view, marker) {
    const { state } = view;
    const { from, to } = state.selection.main;
    const startLine = state.doc.lineAt(from);
    const endLine = state.doc.lineAt(to);
    const changes = [];
    const listMarkerRegex = /^(\s*)([-*+]|\d+\.)\s(\[[ xX]\]\s)?/;
    const isOrderedMarker = marker === "1. ";
    let orderNum = 1;
    for (let lineNum = startLine.number; lineNum <= endLine.number; lineNum++) {
      const line = state.doc.line(lineNum);
      const match = line.text.match(listMarkerRegex);
      const actualMarker = isOrderedMarker ? `${orderNum}. ` : marker;
      if (match) {
        const existingMarker = match[0];
        const indent = match[1] || "";
        const isUnordered = /^[-*+]$/.test(match[2]);
        const isOrdered = /^\d+\.$/.test(match[2]);
        const hasTask = !!match[3];
        const wantUnordered = marker === "- ";
        const wantOrdered = isOrderedMarker;
        const wantTask = marker === "- [ ] ";
        if (wantUnordered && isUnordered && !hasTask || wantOrdered && isOrdered && !hasTask || wantTask && hasTask) {
          changes.push({
            from: line.from,
            to: line.from + existingMarker.length,
            insert: indent
          });
        } else {
          changes.push({
            from: line.from,
            to: line.from + existingMarker.length,
            insert: indent + actualMarker
          });
          orderNum++;
        }
      } else {
        const indentMatch = line.text.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : "";
        changes.push({
          from: line.from + indent.length,
          to: line.from + indent.length,
          insert: actualMarker
        });
        orderNum++;
      }
    }
    if (changes.length > 0) {
      view.dispatch({ changes });
    }
    return true;
  }
  buildDecorations(ctx) {
    const { view, decorations } = ctx;
    const tree = syntaxTree(view.state);
    tree.iterate({
      enter: (node) => {
        const { from, to, name } = node;
        const line = view.state.doc.lineAt(from);
        const cursorInLine = ctx.cursorInRange(line.from, line.to);
        switch (name) {
          case "ListItem":
            this.decorateListItem(node, line, decorations);
            break;
          case "ListMark":
            this.decorateListMark(node, line, decorations, cursorInLine);
            break;
          case "TaskMarker":
            this.decorateTaskMarker(from, to, view, decorations, cursorInLine);
            break;
        }
      }
    });
  }
  /** Add line decoration for list items with nesting depth */
  decorateListItem(node, line, decorations) {
    const parent = node.node.parent;
    const listType = parent?.name;
    let depth = 0;
    let ancestor = node.node.parent;
    while (ancestor) {
      if (ancestor.name === "ListItem") depth++;
      ancestor = ancestor.parent;
    }
    const hasTask = this.hasTaskChild(node);
    let lineClass;
    if (hasTask) lineClass = classes.taskLine;
    else if (listType === "OrderedList") lineClass = classes.lineOL;
    else lineClass = classes.lineUL;
    decorations.push(
      Decoration.line({
        class: lineClass,
        attributes: { style: `--depth: ${depth}` }
      }).range(line.from)
    );
  }
  /** Check if a ListItem node has a Task child */
  hasTaskChild(node) {
    const cursor = node.node.cursor();
    if (cursor.firstChild()) {
      do {
        if (cursor.name === "Task") return true;
      } while (cursor.nextSibling());
    }
    return false;
  }
  /** Decorate list markers (bullets for UL, numbers for OL) */
  decorateListMark(node, line, decorations, cursorInLine) {
    const { from, to } = node;
    const parent = node.node.parent;
    const grandparent = parent?.parent;
    const listType = grandparent?.name;
    const activeClass = cursorInLine ? classes.active : "";
    if (from > line.from) {
      decorations.push(Decoration.mark({ class: classes.indent + activeClass }).range(line.from, from));
    }
    const markClass = listType === "OrderedList" ? classes.markOL : classes.markUL;
    decorations.push(Decoration.mark({ class: markClass + activeClass }).range(from, to + 1));
    const contentStart = to + 1;
    if (contentStart < line.to) {
      decorations.push(Decoration.mark({ class: classes.content }).range(contentStart, line.to));
    }
  }
  /** Decorate task markers - show checkbox widget or raw text based on cursor */
  decorateTaskMarker(from, to, view, decorations, cursorInLine) {
    const text = view.state.sliceDoc(from, to);
    const isChecked = text.includes("x") || text.includes("X");
    if (cursorInLine) {
      decorations.push(Decoration.mark({ class: classes.taskMarker }).range(from, to));
    } else {
      decorations.push(
        Decoration.replace({
          widget: new TaskCheckboxWidget(isChecked)
        }).range(from, to)
      );
    }
  }
  /** Render list nodes to HTML */
  renderToHTML(node, children, ctx) {
    switch (node.name) {
      case "BulletList":
        return `<ul class="${classes.lineUL} ${classes.preview}">${children}</ul>
`;
      case "OrderedList":
        return `<ol class="${classes.lineOL} ${classes.preview}">${children}</ol>
`;
      case "ListItem":
        return `<li>${children}</li>
`;
      case "Task":
        return children;
      case "TaskMarker": {
        const text = ctx.sliceDoc(node.from, node.to);
        const isChecked = text.includes("x") || text.includes("X");
        return `<input type="checkbox" class="cm-draftly-task-checkbox" disabled ${isChecked ? "checked" : ""} />`;
      }
      case "ListMark":
        return "";
      default:
        return null;
    }
  }
};
var theme5 = createTheme({
  default: {
    // Indentation marker positioning
    ".cm-draftly-list-indent": {
      overflow: "hidden",
      display: "inline-block",
      position: "absolute",
      left: "calc(1rem * (var(--depth, 0) + 1))",
      transform: "translateX(-100%)"
    },
    // List line layout (flexbox for marker alignment)
    ".cm-draftly-list-line-ul, .cm-draftly-list-line-ol": {
      position: "relative",
      paddingLeft: "calc(1rem * (var(--depth, 0) + 1)) !important",
      display: "flex",
      alignItems: "start"
    },
    ".cm-draftly-list-line-ul > :first-child, .cm-draftly-list-line-ol > :first-child": {
      flexShrink: 0
    },
    // List marker sizing
    ".cm-draftly-list-line-ul .cm-draftly-list-mark-ul, .cm-draftly-list-line-ol .cm-draftly-list-mark-ol": {
      whiteSpace: "pre",
      position: "relative",
      width: "1rem",
      flexShrink: 0
    },
    // Hide raw marker text when not active
    ".cm-draftly-list-mark-ul:not(.cm-draftly-active) > span, .cm-draftly-task-line .cm-draftly-list-mark-ol:not(.cm-draftly-active) > span": {
      visibility: "hidden",
      display: "none"
    },
    // Styled bullet for unordered lists
    ".cm-draftly-list-line-ul .cm-draftly-list-mark-ul:not(.cm-draftly-active)::after": {
      content: '"\u2022"',
      color: "var(--color-link)",
      fontWeight: "bold",
      pointerEvents: "none"
    },
    // Task marker styling (visible when editing)
    ".cm-draftly-task-marker": {
      color: "var(--draftly-highlight, #a4a4a4)",
      fontFamily: "monospace"
    },
    // Task checkbox container
    ".cm-draftly-task-checkbox": {
      display: "inline-flex",
      verticalAlign: "middle",
      marginRight: "0.3em",
      cursor: "pointer",
      userSelect: "none",
      alignItems: "center",
      height: "1.2em"
    },
    // Task checkbox input styling
    ".cm-draftly-task-checkbox input": {
      cursor: "pointer",
      margin: 0,
      width: "1.1em",
      height: "1.1em",
      appearance: "none",
      border: "1px solid",
      borderRadius: "0.25em",
      backgroundColor: "transparent",
      position: "relative"
    },
    // Checkmark for completed tasks
    ".cm-draftly-task-checkbox.checked input::after": {
      content: '"\u2713"',
      position: "absolute",
      left: "1px",
      top: "-3px"
    },
    // Preview styles (override editor-specific layout)
    ".cm-draftly-preview": {
      display: "block",
      paddingLeft: "1.5rem",
      margin: "0.5rem 0"
    },
    ".cm-draftly-preview li": {
      display: "list-item",
      marginBottom: "0.25rem"
    },
    "ul.cm-draftly-preview": {
      listStyleType: "disc"
    },
    "ol.cm-draftly-preview": {
      listStyleType: "decimal"
    },
    // Hide list marker for task items
    ".cm-draftly-preview li:has(.cm-draftly-task-checkbox)": {
      listStyleType: "none"
    },
    ".cm-draftly-preview li .cm-draftly-paragraph": {
      padding: "0"
    }
  }
});
var BREAK_TAG = "<br />";
var BREAK_TAG_REGEX = /<br\s*\/?>/gi;
var DELIMITER_CELL_PATTERN = /^:?-{3,}:?$/;
var TABLE_SUB_NODE_NAMES = /* @__PURE__ */ new Set(["TableHeader", "TableDelimiter", "TableRow", "TableCell"]);
var TABLE_TEMPLATE = {
  headers: ["Header 1", "Header 2", "Header 3"],
  alignments: ["left", "left", "left"],
  rows: [["", "", ""]]
};
var normalizeAnnotation = Annotation.define();
var repairSelectionAnnotation = Annotation.define();
var pipeReplace = Decoration.replace({});
var delimiterReplace = Decoration.replace({});
var tableBlockWrapper = BlockWrapper.create({
  tagName: "div",
  attributes: { class: "cm-draftly-table-wrapper" }
});
var TableBreakWidget = class extends WidgetType {
  /** Reuses the same widget instance for identical break markers. */
  eq() {
    return true;
  }
  /** Renders an inline `<br />` placeholder inside a table cell. */
  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-draftly-table-break";
    span.setAttribute("aria-label", "line break");
    span.appendChild(document.createElement("br"));
    return span;
  }
  /** Allows the editor to observe events on the rendered break widget. */
  ignoreEvent() {
    return false;
  }
};
var TableControlsWidget = class extends WidgetType {
  constructor(onAddRow, onAddColumn) {
    super();
    this.onAddRow = onAddRow;
    this.onAddColumn = onAddColumn;
  }
  /** Forces the control widget to be recreated so handlers stay current. */
  eq() {
    return false;
  }
  /** Renders the hover controls used to append rows and columns. */
  toDOM(view) {
    const anchor = document.createElement("span");
    anchor.className = "cm-draftly-table-controls-anchor";
    anchor.setAttribute("aria-hidden", "true");
    const rightButton = this.createButton("Add column", "cm-draftly-table-control cm-draftly-table-control-column");
    rightButton.addEventListener("mousedown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.onAddColumn(view);
    });
    const bottomButton = this.createButton("Add row", "cm-draftly-table-control cm-draftly-table-control-row");
    bottomButton.addEventListener("mousedown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.onAddRow(view);
    });
    anchor.append(rightButton, bottomButton);
    return anchor;
  }
  /** Lets button events bubble through the widget. */
  ignoreEvent() {
    return false;
  }
  /** Builds a single control button with the provided label and class. */
  createButton(label, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("tabindex", "-1");
    button.setAttribute("aria-label", label);
    button.textContent = "+";
    return button;
  }
};
function isEscaped(text, index) {
  let slashCount = 0;
  for (let i = index - 1; i >= 0 && text[i] === "\\"; i--) {
    slashCount++;
  }
  return slashCount % 2 === 1;
}
function getPipePositions(lineText) {
  const positions = [];
  for (let index = 0; index < lineText.length; index++) {
    if (lineText[index] === "|" && !isEscaped(lineText, index)) {
      positions.push(index);
    }
  }
  return positions;
}
function splitTableLine(lineText) {
  const cells = [];
  const trimmed = lineText.trim();
  if (!trimmed.includes("|")) {
    return [trimmed];
  }
  let current = "";
  for (let index = 0; index < trimmed.length; index++) {
    const char = trimmed[index];
    if (char === "|" && !isEscaped(trimmed, index)) {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current);
  if (trimmed.startsWith("|")) {
    cells.shift();
  }
  if (trimmed.endsWith("|")) {
    cells.pop();
  }
  return cells;
}
function isTableRowLine(lineText) {
  return getPipePositions(lineText.trim()).length > 0;
}
function parseAlignment(cell) {
  const trimmed = cell.trim();
  const left = trimmed.startsWith(":");
  const right = trimmed.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  return "left";
}
function parseDelimiterAlignments(lineText) {
  const cells = splitTableLine(lineText).map((cell) => cell.trim());
  if (cells.length === 0 || !cells.every((cell) => DELIMITER_CELL_PATTERN.test(cell))) {
    return null;
  }
  return cells.map(parseAlignment);
}
function splitTableAndTrailingMarkdown(markdown) {
  const lines = markdown.split("\n");
  if (lines.length < 2) {
    return { tableMarkdown: markdown, trailingMarkdown: "" };
  }
  const headerLine = lines[0] || "";
  const delimiterLine = lines[1] || "";
  if (!isTableRowLine(headerLine) || !parseDelimiterAlignments(delimiterLine)) {
    return { tableMarkdown: markdown, trailingMarkdown: "" };
  }
  let endIndex = 1;
  for (let index = 2; index < lines.length; index++) {
    if (!isTableRowLine(lines[index] || "")) {
      break;
    }
    endIndex = index;
  }
  return {
    tableMarkdown: lines.slice(0, endIndex + 1).join("\n"),
    trailingMarkdown: lines.slice(endIndex + 1).join("\n")
  };
}
function canonicalizeBreakTags(text) {
  return text.replace(BREAK_TAG_REGEX, BREAK_TAG);
}
function escapeUnescapedPipes(text) {
  let result = "";
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === "|" && !isEscaped(text, index)) {
      result += "\\|";
      continue;
    }
    result += char;
  }
  return result;
}
function normalizeCellContent(text) {
  const normalizedBreaks = canonicalizeBreakTags(text.trim());
  if (!normalizedBreaks) {
    return "";
  }
  const parts = normalizedBreaks.split(BREAK_TAG_REGEX).map((part) => escapeUnescapedPipes(part.trim()));
  if (parts.length === 1) {
    return parts[0] || "";
  }
  return parts.join(` ${BREAK_TAG} `).trim();
}
function renderWidth(text) {
  return canonicalizeBreakTags(text).replace(BREAK_TAG, " ").replace(/\\\|/g, "|").length;
}
function padCell(text, width, alignment) {
  const safeWidth = Math.max(width, renderWidth(text));
  const difference = safeWidth - renderWidth(text);
  if (difference <= 0) {
    return text;
  }
  if (alignment === "right") {
    return " ".repeat(difference) + text;
  }
  if (alignment === "center") {
    const left = Math.floor(difference / 2);
    const right = difference - left;
    return " ".repeat(left) + text + " ".repeat(right);
  }
  return text + " ".repeat(difference);
}
function delimiterCell(width, alignment) {
  const hyphenCount = Math.max(width, 3);
  if (alignment === "center") {
    return ":" + "-".repeat(Math.max(1, hyphenCount - 2)) + ":";
  }
  if (alignment === "right") {
    return "-".repeat(Math.max(2, hyphenCount - 1)) + ":";
  }
  return "-".repeat(hyphenCount);
}
function parseTableMarkdown(markdown) {
  const { tableMarkdown } = splitTableAndTrailingMarkdown(markdown);
  const lines = tableMarkdown.split("\n");
  if (lines.length < 2) {
    return null;
  }
  const headers = splitTableLine(lines[0] || "").map((cell) => cell.trim());
  const alignments = parseDelimiterAlignments(lines[1] || "");
  if (!alignments) {
    return null;
  }
  const rows = lines.slice(2).filter((line) => isTableRowLine(line)).map((line) => splitTableLine(line).map((cell) => cell.trim()));
  return { headers, alignments, rows };
}
function normalizeParsedTable(parsed) {
  const columnCount = Math.max(
    parsed.headers.length,
    parsed.alignments.length,
    ...parsed.rows.map((row) => row.length),
    1
  );
  const headers = Array.from({ length: columnCount }, (_, index) => normalizeCellContent(parsed.headers[index] || ""));
  const alignments = Array.from({ length: columnCount }, (_, index) => parsed.alignments[index] || "left");
  const rows = parsed.rows.map(
    (row) => Array.from({ length: columnCount }, (_, index) => normalizeCellContent(row[index] || ""))
  );
  return { headers, alignments, rows };
}
function formatTableMarkdown(parsed) {
  const normalized = normalizeParsedTable(parsed);
  const widths = normalized.headers.map(
    (header, index) => Math.max(renderWidth(header), ...normalized.rows.map((row) => renderWidth(row[index] || "")), 3)
  );
  const formatRow = (cells) => `| ${cells.map((cell, index) => padCell(cell, widths[index] || 3, normalized.alignments[index] || "left")).join(" | ")} |`;
  const headerLine = formatRow(normalized.headers);
  const delimiterLine = `| ${normalized.alignments.map((alignment, index) => delimiterCell(widths[index] || 3, alignment)).join(" | ")} |`;
  const bodyLines = normalized.rows.map((row) => formatRow(row));
  return [headerLine, delimiterLine, ...bodyLines].join("\n");
}
function buildEmptyRow(columnCount) {
  return Array.from({ length: columnCount }, () => "");
}
function createPreviewRenderer(markdown, config) {
  const plugins = (config?.plugins || []).filter((plugin) => plugin.name !== "paragraph");
  return new PreviewRenderer(markdown, plugins, config?.markdown || [], config?.theme || "auto" /* AUTO */, true);
}
function stripSingleParagraph(html) {
  const trimmed = html.trim();
  const match = trimmed.match(/^<p\b[^>]*>([\s\S]*)<\/p>$/i);
  return match?.[1] || trimmed;
}
async function renderCellToHtml(text, config) {
  if (!text.trim()) {
    return "&nbsp;";
  }
  return stripSingleParagraph(await createPreviewRenderer(text, config).render());
}
async function renderTableToHtml(parsed, config) {
  const normalized = normalizeParsedTable(parsed);
  let html = '<div class="cm-draftly-table-widget"><table class="cm-draftly-table cm-draftly-table-preview">';
  html += '<thead><tr class="cm-draftly-table-row cm-draftly-table-header-row">';
  for (let index = 0; index < normalized.headers.length; index++) {
    const alignment = normalized.alignments[index] || "left";
    const content = await renderCellToHtml(normalized.headers[index] || "", config);
    html += `<th class="cm-draftly-table-cell cm-draftly-table-th${alignment === "center" ? " cm-draftly-table-cell-center" : alignment === "right" ? " cm-draftly-table-cell-right" : ""}${index === normalized.headers.length - 1 ? " cm-draftly-table-cell-last" : ""}">${content}</th>`;
  }
  html += "</tr></thead><tbody>";
  for (let rowIndex = 0; rowIndex < normalized.rows.length; rowIndex++) {
    const row = normalized.rows[rowIndex] || [];
    html += `<tr class="cm-draftly-table-row cm-draftly-table-body-row${rowIndex % 2 === 1 ? " cm-draftly-table-row-even" : ""}${rowIndex === normalized.rows.length - 1 ? " cm-draftly-table-row-last" : ""}">`;
    for (let index = 0; index < normalized.headers.length; index++) {
      const alignment = normalized.alignments[index] || "left";
      const content = await renderCellToHtml(row[index] || "", config);
      html += `<td class="cm-draftly-table-cell${alignment === "center" ? " cm-draftly-table-cell-center" : alignment === "right" ? " cm-draftly-table-cell-right" : ""}${index === normalized.headers.length - 1 ? " cm-draftly-table-cell-last" : ""}">${content}</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table></div>";
  return html;
}
function getVisibleBounds(rawCellText) {
  const leading = rawCellText.length - rawCellText.trimStart().length;
  const trailing = rawCellText.length - rawCellText.trimEnd().length;
  const trimmedLength = rawCellText.trim().length;
  if (trimmedLength === 0) {
    const placeholderOffset = Math.min(Math.floor(rawCellText.length / 2), Math.max(rawCellText.length - 1, 0));
    return {
      startOffset: placeholderOffset,
      endOffset: Math.min(placeholderOffset + 1, rawCellText.length)
    };
  }
  return {
    startOffset: leading,
    endOffset: rawCellText.length - trailing
  };
}
function isBodyRowEmpty(row) {
  return row.every((cell) => normalizeCellContent(cell.rawText) === "");
}
function buildTableFromInfo(tableInfo) {
  return {
    headers: tableInfo.headerCells.map((cell) => normalizeCellContent(cell.rawText)),
    alignments: [...tableInfo.alignments],
    rows: tableInfo.bodyCells.map((row) => row.map((cell) => normalizeCellContent(cell.rawText)))
  };
}
function getRowLineIndex(rowIndex) {
  return rowIndex === 0 ? 0 : rowIndex + 1;
}
function getCellAnchorInFormattedTable(formattedTable, rowIndex, columnIndex, offset = 0) {
  const lines = formattedTable.split("\n");
  const lineIndex = getRowLineIndex(rowIndex);
  const lineText = lines[lineIndex] || "";
  const pipes = getPipePositions(lineText);
  if (pipes.length < columnIndex + 2) {
    return formattedTable.length;
  }
  const rawFrom = pipes[columnIndex] + 1;
  const rawTo = pipes[columnIndex + 1];
  const visible = getVisibleBounds(lineText.slice(rawFrom, rawTo));
  const lineOffset = lines.slice(0, lineIndex).reduce((sum, line) => sum + line.length + 1, 0);
  return lineOffset + Math.min(rawFrom + visible.startOffset + offset, rawFrom + Math.max(visible.endOffset - 1, visible.startOffset));
}
function createTableInsert(state, from, to, tableMarkdown) {
  let insert = tableMarkdown;
  let prefixLength = 0;
  const startLine = state.doc.lineAt(from);
  if (startLine.number === 1 || state.doc.line(startLine.number - 1).text.trim() !== "") {
    insert = "\n" + insert;
    prefixLength = 1;
  }
  const endLine = state.doc.lineAt(Math.max(from, to));
  if (endLine.number === state.doc.lines || state.doc.line(endLine.number + 1).text.trim() !== "") {
    insert += "\n";
  }
  return { from, to, insert, prefixLength };
}
function readTableInfo(state, nodeFrom, nodeTo) {
  const startLine = state.doc.lineAt(nodeFrom);
  const endLine = state.doc.lineAt(nodeTo);
  const delimiterLineNumber = startLine.number + 1;
  if (delimiterLineNumber > endLine.number) {
    return null;
  }
  const delimiterLine = state.doc.line(delimiterLineNumber);
  const alignments = parseDelimiterAlignments(delimiterLine.text);
  if (!alignments) {
    return null;
  }
  let effectiveEndLineNumber = delimiterLineNumber;
  for (let lineNumber = delimiterLineNumber + 1; lineNumber <= endLine.number; lineNumber++) {
    const line = state.doc.line(lineNumber);
    if (!isTableRowLine(line.text)) {
      break;
    }
    effectiveEndLineNumber = lineNumber;
  }
  const cellsByRow = [];
  for (let lineNumber = startLine.number; lineNumber <= effectiveEndLineNumber; lineNumber++) {
    if (lineNumber === delimiterLineNumber) {
      continue;
    }
    const line = state.doc.line(lineNumber);
    const pipes = getPipePositions(line.text);
    if (pipes.length < 2) {
      return null;
    }
    const isHeader = lineNumber === startLine.number;
    const rowIndex = isHeader ? 0 : cellsByRow.length;
    const cells = [];
    for (let columnIndex = 0; columnIndex < pipes.length - 1; columnIndex++) {
      const from = line.from + pipes[columnIndex] + 1;
      const to = line.from + pipes[columnIndex + 1];
      const rawText = line.text.slice(pipes[columnIndex] + 1, pipes[columnIndex + 1]);
      const visible = getVisibleBounds(rawText);
      cells.push({
        rowKind: isHeader ? "header" : "body",
        rowIndex,
        columnIndex,
        from,
        to,
        contentFrom: from + visible.startOffset,
        contentTo: from + visible.endOffset,
        lineFrom: line.from,
        lineNumber,
        rawText
      });
    }
    cellsByRow.push(cells);
  }
  if (cellsByRow.length === 0) {
    return null;
  }
  return {
    from: startLine.from,
    to: state.doc.line(effectiveEndLineNumber).to,
    startLineNumber: startLine.number,
    delimiterLineNumber,
    endLineNumber: effectiveEndLineNumber,
    columnCount: cellsByRow[0].length,
    alignments: Array.from({ length: cellsByRow[0].length }, (_, index) => alignments[index] || "left"),
    cellsByRow,
    headerCells: cellsByRow[0],
    bodyCells: cellsByRow.slice(1)
  };
}
function getTableInfoAtPosition(state, position) {
  let resolved = null;
  syntaxTree(state).iterate({
    enter: (node) => {
      if (resolved || node.name !== "Table") {
        return;
      }
      const info = readTableInfo(state, node.from, node.to);
      if (info && position >= info.from && position <= info.to) {
        resolved = info;
      }
    }
  });
  return resolved;
}
function findCellAtPosition(tableInfo, position) {
  for (const row of tableInfo.cellsByRow) {
    for (const cell of row) {
      if (position >= cell.from && position <= cell.to) {
        return cell;
      }
    }
  }
  for (const row of tableInfo.cellsByRow) {
    for (const cell of row) {
      if (position >= cell.from - 1 && position <= cell.to + 1) {
        return cell;
      }
    }
  }
  let nearestCell = null;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const row of tableInfo.cellsByRow) {
    for (const cell of row) {
      const distance = Math.min(Math.abs(position - cell.from), Math.abs(position - cell.to));
      if (distance < nearestDistance) {
        nearestCell = cell;
        nearestDistance = distance;
      }
    }
  }
  return nearestCell;
}
function clampCellPosition(cell, position) {
  const cellEnd = Math.max(cell.contentFrom, cell.contentTo);
  return Math.max(cell.contentFrom, Math.min(position, cellEnd));
}
function collectBreakRanges(tableInfo) {
  const ranges = [];
  for (const row of tableInfo.cellsByRow) {
    for (const cell of row) {
      let match;
      const regex = new RegExp(BREAK_TAG_REGEX);
      while ((match = regex.exec(cell.rawText)) !== null) {
        ranges.push({
          from: cell.from + match.index,
          to: cell.from + match.index + match[0].length
        });
      }
    }
  }
  return ranges;
}
var lineDecorations = {
  header: Decoration.line({ class: "cm-draftly-table-row cm-draftly-table-header-row" }),
  delimiter: Decoration.line({ class: "cm-draftly-table-row cm-draftly-table-delimiter-row" }),
  body: Decoration.line({ class: "cm-draftly-table-row cm-draftly-table-body-row" }),
  even: Decoration.line({ class: "cm-draftly-table-row cm-draftly-table-body-row cm-draftly-table-row-even" }),
  last: Decoration.line({ class: "cm-draftly-table-row-last" })
};
var cellDecorations = {
  "th-left": Decoration.mark({ class: "cm-draftly-table-cell cm-draftly-table-th" }),
  "th-center": Decoration.mark({ class: "cm-draftly-table-cell cm-draftly-table-th cm-draftly-table-cell-center" }),
  "th-right": Decoration.mark({ class: "cm-draftly-table-cell cm-draftly-table-th cm-draftly-table-cell-right" }),
  "th-left-last": Decoration.mark({ class: "cm-draftly-table-cell cm-draftly-table-th cm-draftly-table-cell-last" }),
  "th-center-last": Decoration.mark({
    class: "cm-draftly-table-cell cm-draftly-table-th cm-draftly-table-cell-center cm-draftly-table-cell-last"
  }),
  "th-right-last": Decoration.mark({
    class: "cm-draftly-table-cell cm-draftly-table-th cm-draftly-table-cell-right cm-draftly-table-cell-last"
  }),
  "td-left": Decoration.mark({ class: "cm-draftly-table-cell" }),
  "td-center": Decoration.mark({ class: "cm-draftly-table-cell cm-draftly-table-cell-center" }),
  "td-right": Decoration.mark({ class: "cm-draftly-table-cell cm-draftly-table-cell-right" }),
  "td-left-last": Decoration.mark({ class: "cm-draftly-table-cell cm-draftly-table-cell-last" }),
  "td-center-last": Decoration.mark({
    class: "cm-draftly-table-cell cm-draftly-table-cell-center cm-draftly-table-cell-last"
  }),
  "td-right-last": Decoration.mark({
    class: "cm-draftly-table-cell cm-draftly-table-cell-right cm-draftly-table-cell-last"
  })
};
function getCellDecoration(isHeader, alignment, isLastCell) {
  const key = `${isHeader ? "th" : "td"}-${alignment}${isLastCell ? "-last" : ""}`;
  return cellDecorations[key];
}
var TablePlugin = class extends DecorationPlugin {
  name = "table";
  version = "2.0.0";
  decorationPriority = 20;
  requiredNodes = ["Table", "TableHeader", "TableDelimiter", "TableRow", "TableCell"];
  draftlyConfig;
  pendingNormalizationView = null;
  pendingPaddingView = null;
  pendingSelectionRepairView = null;
  /** Stores the editor config for preview rendering and shared behavior. */
  onRegister(context) {
    super.onRegister(context);
    this.draftlyConfig = context.config;
  }
  /** Exposes the plugin theme used for editor and preview styling. */
  get theme() {
    return theme6;
  }
  /** Enables GFM table parsing for the editor and preview renderer. */
  getMarkdownConfig() {
    return Table;
  }
  /** Registers block wrappers and atomic ranges for the table UI. */
  getExtensions() {
    return [
      Prec.highest(keymap.of(this.buildTableKeymap())),
      EditorView.blockWrappers.of((view) => this.computeBlockWrappers(view)),
      EditorView.atomicRanges.of((view) => this.computeAtomicRanges(view)),
      EditorView.domEventHandlers({
        keydown: (event, view) => this.handleDomKeydown(view, event)
      })
    ];
  }
  /** Provides the table-specific keyboard shortcuts and navigation. */
  getKeymap() {
    return [];
  }
  /** Builds the high-priority key bindings used inside tables. */
  buildTableKeymap() {
    return [
      { key: "Mod-Shift-t", run: (view) => this.insertTable(view), preventDefault: true },
      { key: "Mod-Alt-ArrowDown", run: (view) => this.addRow(view), preventDefault: true },
      { key: "Mod-Alt-ArrowRight", run: (view) => this.addColumn(view), preventDefault: true },
      { key: "Mod-Alt-Backspace", run: (view) => this.removeRow(view), preventDefault: true },
      { key: "Mod-Alt-Delete", run: (view) => this.removeColumn(view), preventDefault: true },
      { key: "Tab", run: (view) => this.handleTab(view, false) },
      { key: "Shift-Tab", run: (view) => this.handleTab(view, true) },
      { key: "ArrowLeft", run: (view) => this.handleArrowHorizontal(view, false) },
      { key: "ArrowRight", run: (view) => this.handleArrowHorizontal(view, true) },
      { key: "ArrowUp", run: (view) => this.handleArrowVertical(view, false) },
      { key: "ArrowDown", run: (view) => this.handleArrowVertical(view, true) },
      { key: "Enter", run: (view) => this.handleEnter(view) },
      { key: "Shift-Enter", run: (view) => this.insertBreakTag(view), preventDefault: true },
      { key: "Backspace", run: (view) => this.handleBreakDeletion(view, false) },
      { key: "Delete", run: (view) => this.handleBreakDeletion(view, true) }
    ];
  }
  /** Schedules an initial normalization pass once the view is ready. */
  onViewReady(view) {
    this.scheduleNormalization(view);
  }
  /** Re-schedules normalization after user-driven document changes. */
  onViewUpdate(update) {
    if (update.docChanged && !update.transactions.some((transaction) => transaction.annotation(normalizeAnnotation))) {
      this.schedulePadding(update.view);
    }
    if (update.selectionSet && !update.transactions.some((transaction) => transaction.annotation(repairSelectionAnnotation))) {
      this.scheduleSelectionRepair(update.view);
    }
  }
  /** Intercepts table-specific DOM key handling before browser defaults run. */
  handleDomKeydown(view, event) {
    if (event.defaultPrevented || event.isComposing || event.altKey || event.metaKey || event.ctrlKey) {
      return false;
    }
    let handled = false;
    if (event.key === "Tab") {
      handled = this.handleTab(view, event.shiftKey);
    } else if (event.key === "Enter" && event.shiftKey) {
      handled = this.insertBreakTag(view);
    } else if (event.key === "Enter") {
      handled = this.handleEnter(view);
    } else if (event.key === "ArrowLeft") {
      handled = this.handleArrowHorizontal(view, false);
    } else if (event.key === "ArrowRight") {
      handled = this.handleArrowHorizontal(view, true);
    } else if (event.key === "ArrowUp") {
      handled = this.handleArrowVertical(view, false);
    } else if (event.key === "ArrowDown") {
      handled = this.handleArrowVertical(view, true);
    } else if (event.key === "Backspace") {
      handled = this.handleBreakDeletion(view, false);
    } else if (event.key === "Delete") {
      handled = this.handleBreakDeletion(view, true);
    }
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
    return handled;
  }
  /** Builds the visual table decorations for every parsed table block. */
  buildDecorations(ctx) {
    const { view, decorations } = ctx;
    syntaxTree(view.state).iterate({
      enter: (node) => {
        if (node.name !== "Table") {
          return;
        }
        const tableInfo = readTableInfo(view.state, node.from, node.to);
        if (tableInfo) {
          this.decorateTable(view, decorations, tableInfo);
        }
      }
    });
  }
  /** Renders the full table node to semantic preview HTML. */
  async renderToHTML(node, _children, ctx) {
    if (node.name === "Table") {
      const content = ctx.sliceDoc(node.from, node.to);
      const { tableMarkdown, trailingMarkdown } = splitTableAndTrailingMarkdown(content);
      const parsed = parseTableMarkdown(tableMarkdown);
      if (!parsed) {
        return null;
      }
      const tableHtml = await renderTableToHtml(parsed, this.draftlyConfig);
      if (!trailingMarkdown.trim()) {
        return tableHtml;
      }
      return tableHtml + await createPreviewRenderer(trailingMarkdown, this.draftlyConfig).render();
    }
    if (TABLE_SUB_NODE_NAMES.has(node.name)) {
      return "";
    }
    return null;
  }
  /** Computes the block wrapper ranges used to group table lines. */
  computeBlockWrappers(view) {
    const wrappers = [];
    syntaxTree(view.state).iterate({
      enter: (node) => {
        if (node.name !== "Table") {
          return;
        }
        const tableInfo = readTableInfo(view.state, node.from, node.to);
        if (tableInfo) {
          wrappers.push(tableBlockWrapper.range(tableInfo.from, tableInfo.to));
        }
      }
    });
    return BlockWrapper.set(wrappers, true);
  }
  /** Computes atomic ranges for delimiters and inline break tags. */
  computeAtomicRanges(view) {
    const ranges = [];
    syntaxTree(view.state).iterate({
      enter: (node) => {
        if (node.name !== "Table") {
          return;
        }
        const tableInfo = readTableInfo(view.state, node.from, node.to);
        if (!tableInfo) {
          return;
        }
        for (let lineNumber = tableInfo.startLineNumber; lineNumber <= tableInfo.endLineNumber; lineNumber++) {
          const line = view.state.doc.line(lineNumber);
          if (lineNumber === tableInfo.delimiterLineNumber) {
            ranges.push(delimiterReplace.range(line.from, line.to));
            continue;
          }
          const pipes = getPipePositions(line.text);
          for (const pipe of pipes) {
            ranges.push(pipeReplace.range(line.from + pipe, line.from + pipe + 1));
          }
          for (let columnIndex = 0; columnIndex < pipes.length - 1; columnIndex++) {
            const rawFrom = pipes[columnIndex] + 1;
            const rawTo = pipes[columnIndex + 1];
            const rawText = line.text.slice(rawFrom, rawTo);
            const visible = getVisibleBounds(rawText);
            if (visible.startOffset > 0) {
              ranges.push(pipeReplace.range(line.from + rawFrom, line.from + rawFrom + visible.startOffset));
            }
            if (visible.endOffset < rawText.length) {
              ranges.push(pipeReplace.range(line.from + rawFrom + visible.endOffset, line.from + rawTo));
            }
            let match;
            const regex = new RegExp(BREAK_TAG_REGEX);
            while ((match = regex.exec(rawText)) !== null) {
              ranges.push(
                Decoration.replace({ widget: new TableBreakWidget() }).range(
                  line.from + rawFrom + match.index,
                  line.from + rawFrom + match.index + match[0].length
                )
              );
            }
          }
        }
      }
    });
    return RangeSet.of(ranges, true);
  }
  /** Applies row, cell, and control decorations for a single table. */
  decorateTable(view, decorations, tableInfo) {
    for (let lineNumber = tableInfo.startLineNumber; lineNumber <= tableInfo.endLineNumber; lineNumber++) {
      const line = view.state.doc.line(lineNumber);
      const isHeader = lineNumber === tableInfo.startLineNumber;
      const isDelimiter = lineNumber === tableInfo.delimiterLineNumber;
      const isLastBody = !isHeader && !isDelimiter && lineNumber === tableInfo.endLineNumber;
      const bodyIndex = isHeader || isDelimiter ? -1 : lineNumber - tableInfo.delimiterLineNumber - 1;
      if (isHeader) {
        decorations.push(lineDecorations.header.range(line.from));
      } else if (isDelimiter) {
        decorations.push(lineDecorations.delimiter.range(line.from));
      } else if (bodyIndex % 2 === 1) {
        decorations.push(lineDecorations.even.range(line.from));
      } else {
        decorations.push(lineDecorations.body.range(line.from));
      }
      if (isLastBody) {
        decorations.push(lineDecorations.last.range(line.from));
      }
      if (isDelimiter) {
        decorations.push(delimiterReplace.range(line.from, line.to));
        continue;
      }
      this.decorateLine(decorations, line.from, line.text, tableInfo.alignments, isHeader);
    }
    decorations.push(
      Decoration.widget({
        widget: new TableControlsWidget(
          (view2) => {
            const liveTable = getTableInfoAtPosition(view2.state, tableInfo.from);
            if (liveTable) {
              this.appendRow(view2, liveTable, liveTable.columnCount - 1);
            }
          },
          (view2) => {
            const liveTable = getTableInfoAtPosition(view2.state, tableInfo.from);
            if (liveTable) {
              this.appendColumn(view2, liveTable);
            }
          }
        ),
        side: 1
      }).range(tableInfo.to)
    );
  }
  /** Applies the visual cell decorations for a single table row line. */
  decorateLine(decorations, lineFrom, lineText, alignments, isHeader) {
    const pipes = getPipePositions(lineText);
    if (pipes.length < 2) {
      return;
    }
    for (const pipe of pipes) {
      decorations.push(pipeReplace.range(lineFrom + pipe, lineFrom + pipe + 1));
    }
    for (let columnIndex = 0; columnIndex < pipes.length - 1; columnIndex++) {
      const rawFrom = pipes[columnIndex] + 1;
      const rawTo = pipes[columnIndex + 1];
      const rawText = lineText.slice(rawFrom, rawTo);
      const visible = getVisibleBounds(rawText);
      const absoluteFrom = lineFrom + rawFrom;
      const absoluteTo = lineFrom + rawTo;
      if (visible.startOffset > 0) {
        decorations.push(pipeReplace.range(absoluteFrom, absoluteFrom + visible.startOffset));
      }
      if (visible.endOffset < rawText.length) {
        decorations.push(pipeReplace.range(absoluteFrom + visible.endOffset, absoluteTo));
      }
      decorations.push(
        getCellDecoration(isHeader, alignments[columnIndex] || "left", columnIndex === pipes.length - 2).range(
          absoluteFrom,
          absoluteTo
        )
      );
      let match;
      const regex = new RegExp(BREAK_TAG_REGEX);
      while ((match = regex.exec(rawText)) !== null) {
        decorations.push(
          Decoration.replace({ widget: new TableBreakWidget() }).range(
            absoluteFrom + match.index,
            absoluteFrom + match.index + match[0].length
          )
        );
      }
    }
  }
  /** Normalizes every parsed table block back into canonical markdown. */
  normalizeTables(view) {
    const changes = [];
    syntaxTree(view.state).iterate({
      enter: (node) => {
        if (node.name !== "Table") {
          return;
        }
        const content = view.state.sliceDoc(node.from, node.to);
        const { tableMarkdown } = splitTableAndTrailingMarkdown(content);
        const parsed = parseTableMarkdown(tableMarkdown);
        if (!parsed) {
          return;
        }
        const formatted = formatTableMarkdown(parsed);
        const change = createTableInsert(view.state, node.from, node.from + tableMarkdown.length, formatted);
        if (change.insert !== tableMarkdown || change.from !== node.from || change.to !== node.from + tableMarkdown.length) {
          changes.push({
            from: change.from,
            to: change.to,
            insert: change.insert
          });
        }
      }
    });
    if (changes.length > 0) {
      view.dispatch({
        changes: changes.sort((left, right) => right.from - left.from),
        annotations: normalizeAnnotation.of(true)
      });
    }
  }
  /** Defers table normalization until the current update cycle is finished. */
  scheduleNormalization(view) {
    if (this.pendingNormalizationView === view) {
      return;
    }
    this.pendingNormalizationView = view;
    queueMicrotask(() => {
      if (this.pendingNormalizationView !== view) {
        return;
      }
      this.pendingNormalizationView = null;
      this.normalizeTables(view);
    });
  }
  /** Adds missing spacer lines above and below tables after edits. */
  ensureTablePadding(view) {
    const changes = [];
    syntaxTree(view.state).iterate({
      enter: (node) => {
        if (node.name !== "Table") {
          return;
        }
        const tableInfo = readTableInfo(view.state, node.from, node.to);
        if (!tableInfo) {
          return;
        }
        const startLine = view.state.doc.lineAt(tableInfo.from);
        if (startLine.number === 1) {
          changes.push({ from: startLine.from, to: startLine.from, insert: "\n" });
        } else {
          const previousLine = view.state.doc.line(startLine.number - 1);
          if (previousLine.text.trim() !== "") {
            changes.push({ from: startLine.from, to: startLine.from, insert: "\n" });
          }
        }
        const endLine = view.state.doc.lineAt(tableInfo.to);
        if (endLine.number === view.state.doc.lines) {
          changes.push({ from: endLine.to, to: endLine.to, insert: "\n" });
        } else {
          const nextLine = view.state.doc.line(endLine.number + 1);
          if (nextLine.text.trim() !== "") {
            changes.push({ from: endLine.to, to: endLine.to, insert: "\n" });
          }
        }
      }
    });
    if (changes.length > 0) {
      view.dispatch({
        changes: changes.sort((left, right) => right.from - left.from),
        annotations: normalizeAnnotation.of(true)
      });
    }
  }
  /** Schedules a padding-only pass after the current update cycle finishes. */
  schedulePadding(view) {
    if (this.pendingPaddingView === view) {
      return;
    }
    this.pendingPaddingView = view;
    queueMicrotask(() => {
      if (this.pendingPaddingView !== view) {
        return;
      }
      this.pendingPaddingView = null;
      this.ensureTablePadding(view);
    });
  }
  /** Repairs carets that land in hidden table markup instead of editable cell content. */
  ensureTableSelection(view) {
    const selection = view.state.selection.main;
    if (!selection.empty) {
      return;
    }
    const tableInfo = getTableInfoAtPosition(view.state, selection.head);
    if (!tableInfo) {
      return;
    }
    const cell = findCellAtPosition(tableInfo, selection.head);
    if (!cell) {
      return;
    }
    const anchor = clampCellPosition(cell, selection.head);
    if (anchor === selection.head) {
      return;
    }
    view.dispatch({
      selection: { anchor },
      annotations: repairSelectionAnnotation.of(true),
      scrollIntoView: true
    });
  }
  /** Schedules table selection repair after the current update finishes. */
  scheduleSelectionRepair(view) {
    if (this.pendingSelectionRepairView === view) {
      return;
    }
    this.pendingSelectionRepairView = view;
    queueMicrotask(() => {
      if (this.pendingSelectionRepairView !== view) {
        return;
      }
      this.pendingSelectionRepairView = null;
      this.ensureTableSelection(view);
    });
  }
  /** Rewrites a table block and restores the caret to a target cell position. */
  replaceTable(view, tableInfo, parsed, targetRowIndex, targetColumnIndex, offset = 0) {
    const formatted = formatTableMarkdown(parsed);
    const change = createTableInsert(view.state, tableInfo.from, tableInfo.to, formatted);
    const selection = change.from + change.prefixLength + getCellAnchorInFormattedTable(
      formatted,
      Math.max(0, targetRowIndex),
      Math.max(0, Math.min(targetColumnIndex, Math.max(parsed.headers.length - 1, 0))),
      Math.max(0, offset)
    );
    view.dispatch({
      changes: { from: change.from, to: change.to, insert: change.insert },
      selection: { anchor: selection }
    });
  }
  /** Inserts an empty body row below the given logical row index. */
  insertRowBelow(view, tableInfo, afterRowIndex, targetColumn) {
    const parsed = normalizeParsedTable(buildTableFromInfo(tableInfo));
    const insertBodyIndex = Math.max(0, Math.min(afterRowIndex, parsed.rows.length));
    parsed.rows.splice(insertBodyIndex, 0, buildEmptyRow(tableInfo.columnCount));
    this.replaceTable(view, tableInfo, parsed, insertBodyIndex + 1, targetColumn);
  }
  /** Inserts a starter table near the current cursor line. */
  insertTable(view) {
    const { state } = view;
    const cursor = state.selection.main.head;
    const line = state.doc.lineAt(cursor);
    const insertAt = line.text.trim() ? line.to : line.from;
    const formatted = formatTableMarkdown(TABLE_TEMPLATE);
    const change = createTableInsert(state, insertAt, insertAt, formatted);
    const selection = change.from + change.prefixLength + getCellAnchorInFormattedTable(formatted, 0, 0);
    view.dispatch({
      changes: { from: change.from, to: change.to, insert: change.insert },
      selection: { anchor: selection }
    });
    return true;
  }
  /** Adds a new empty body row to the active table. */
  addRow(view) {
    const tableInfo = this.getTableAtCursor(view);
    if (!tableInfo) {
      return false;
    }
    const cell = this.getCurrentCell(view, tableInfo);
    this.appendRow(view, tableInfo, cell?.columnIndex || 0);
    return true;
  }
  /** Appends a row and keeps the caret in the requested column. */
  appendRow(view, tableInfo, targetColumn) {
    this.insertRowBelow(view, tableInfo, tableInfo.bodyCells.length, targetColumn);
  }
  /** Inserts a new column after the current column. */
  addColumn(view) {
    const tableInfo = this.getTableAtCursor(view);
    if (!tableInfo) {
      return false;
    }
    const cell = this.getCurrentCell(view, tableInfo);
    const insertAfter = cell?.columnIndex ?? tableInfo.columnCount - 1;
    const parsed = normalizeParsedTable(buildTableFromInfo(tableInfo));
    parsed.headers.splice(insertAfter + 1, 0, "");
    parsed.alignments.splice(insertAfter + 1, 0, "left");
    for (const row of parsed.rows) {
      row.splice(insertAfter + 1, 0, "");
    }
    this.replaceTable(view, tableInfo, parsed, cell?.rowIndex || 0, insertAfter + 1);
    return true;
  }
  /** Appends a new column at the far right of the table. */
  appendColumn(view, tableInfo) {
    const parsed = normalizeParsedTable(buildTableFromInfo(tableInfo));
    parsed.headers.push("");
    parsed.alignments.push("left");
    for (const row of parsed.rows) {
      row.push("");
    }
    this.replaceTable(view, tableInfo, parsed, 0, parsed.headers.length - 1);
  }
  /** Removes the current body row or clears the last remaining row. */
  removeRow(view) {
    const tableInfo = this.getTableAtCursor(view);
    if (!tableInfo) {
      return false;
    }
    const cell = this.getCurrentCell(view, tableInfo);
    if (!cell || cell.rowKind !== "body") {
      return false;
    }
    const parsed = normalizeParsedTable(buildTableFromInfo(tableInfo));
    const bodyIndex = cell.rowIndex - 1;
    if (bodyIndex < 0 || bodyIndex >= parsed.rows.length) {
      return false;
    }
    if (parsed.rows.length === 1) {
      parsed.rows[0] = buildEmptyRow(tableInfo.columnCount);
    } else {
      parsed.rows.splice(bodyIndex, 1);
    }
    const nextRowIndex = Math.max(1, Math.min(cell.rowIndex, parsed.rows.length));
    this.replaceTable(view, tableInfo, parsed, nextRowIndex, Math.min(cell.columnIndex, tableInfo.columnCount - 1));
    return true;
  }
  /** Removes the current column when the table has more than one column. */
  removeColumn(view) {
    const tableInfo = this.getTableAtCursor(view);
    if (!tableInfo || tableInfo.columnCount <= 1) {
      return false;
    }
    const cell = this.getCurrentCell(view, tableInfo);
    const removeAt = cell?.columnIndex ?? tableInfo.columnCount - 1;
    const parsed = normalizeParsedTable(buildTableFromInfo(tableInfo));
    parsed.headers.splice(removeAt, 1);
    parsed.alignments.splice(removeAt, 1);
    for (const row of parsed.rows) {
      row.splice(removeAt, 1);
    }
    this.replaceTable(view, tableInfo, parsed, cell?.rowIndex || 0, Math.min(removeAt, parsed.headers.length - 1));
    return true;
  }
  /** Moves to the next or previous logical cell with Tab navigation. */
  handleTab(view, backwards) {
    const tableInfo = this.getTableAtCursor(view);
    if (!tableInfo) {
      return false;
    }
    const cell = this.getCurrentCell(view, tableInfo);
    if (!cell) {
      return false;
    }
    const cells = tableInfo.cellsByRow.flat();
    const currentIndex = cells.findIndex((candidate) => candidate.from === cell.from && candidate.to === cell.to);
    if (currentIndex < 0) {
      return false;
    }
    const nextIndex = backwards ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0) {
      return true;
    }
    if (nextIndex >= cells.length) {
      this.appendRow(view, tableInfo, 0);
      return true;
    }
    this.moveSelectionToCell(view, cells[nextIndex]);
    return true;
  }
  /** Moves horizontally between adjacent cells when the caret hits an edge. */
  handleArrowHorizontal(view, forward) {
    const tableInfo = this.getTableAtCursor(view);
    if (!tableInfo) {
      return false;
    }
    const cell = this.getCurrentCell(view, tableInfo);
    if (!cell) {
      return false;
    }
    const cursor = view.state.selection.main.head;
    const rightEdge = Math.max(cell.contentFrom, cell.contentTo);
    if (forward && cursor < rightEdge) {
      return false;
    }
    if (!forward && cursor > cell.contentFrom) {
      return false;
    }
    const row = tableInfo.cellsByRow[cell.rowIndex] || [];
    const nextCell = row[cell.columnIndex + (forward ? 1 : -1)];
    if (!nextCell) {
      return false;
    }
    this.moveSelectionToCell(view, nextCell);
    return true;
  }
  /** Moves vertically between rows while keeping the current column. */
  handleArrowVertical(view, forward) {
    const tableInfo = this.getTableAtCursor(view);
    if (!tableInfo) {
      return false;
    }
    const cell = this.getCurrentCell(view, tableInfo);
    if (!cell) {
      return false;
    }
    const nextRow = tableInfo.cellsByRow[cell.rowIndex + (forward ? 1 : -1)];
    if (!nextRow) {
      return false;
    }
    const nextCell = nextRow[cell.columnIndex];
    if (!nextCell) {
      return false;
    }
    this.moveSelectionToCell(view, nextCell);
    return true;
  }
  /** Advances downward on Enter and manages the trailing empty row behavior. */
  handleEnter(view) {
    const tableInfo = this.getTableAtCursor(view);
    if (!tableInfo) {
      return false;
    }
    const cell = this.getCurrentCell(view, tableInfo);
    if (!cell) {
      return false;
    }
    if (cell.rowKind === "body") {
      const currentRow = tableInfo.bodyCells[cell.rowIndex - 1];
      if (currentRow && isBodyRowEmpty(currentRow)) {
        const parsed = normalizeParsedTable(buildTableFromInfo(tableInfo));
        parsed.rows.splice(cell.rowIndex - 1, 1);
        const formatted = formatTableMarkdown(parsed);
        const change = createTableInsert(view.state, tableInfo.from, tableInfo.to, formatted);
        const anchor = Math.min(change.from + change.insert.length, view.state.doc.length + change.insert.length);
        view.dispatch({
          changes: { from: change.from, to: change.to, insert: change.insert },
          selection: { anchor }
        });
        return true;
      }
    }
    if (cell.rowKind === "body" && cell.rowIndex === tableInfo.cellsByRow.length - 1) {
      const parsed = normalizeParsedTable(buildTableFromInfo(tableInfo));
      parsed.rows.push(buildEmptyRow(tableInfo.columnCount));
      this.replaceTable(view, tableInfo, parsed, parsed.rows.length, cell.columnIndex);
      return true;
    }
    this.insertRowBelow(view, tableInfo, cell.rowIndex, cell.columnIndex);
    return true;
  }
  /** Inserts a canonical `<br />` token inside the current table cell. */
  insertBreakTag(view) {
    const tableInfo = this.getTableAtCursor(view);
    if (!tableInfo) {
      return false;
    }
    const selection = view.state.selection.main;
    view.dispatch({
      changes: { from: selection.from, to: selection.to, insert: BREAK_TAG },
      selection: { anchor: selection.from + BREAK_TAG.length }
    });
    return true;
  }
  /** Deletes a whole `<br />` token when backspace or delete hits it. */
  handleBreakDeletion(view, forward) {
    const tableInfo = this.getTableAtCursor(view);
    if (!tableInfo) {
      return false;
    }
    const selection = view.state.selection.main;
    const cursor = selection.head;
    for (const range of collectBreakRanges(tableInfo)) {
      const within = cursor > range.from && cursor < range.to;
      const matchesBackspace = !forward && cursor === range.to;
      const matchesDelete = forward && cursor === range.from;
      const overlapsSelection = !selection.empty && selection.from <= range.from && selection.to >= range.to;
      if (within || matchesBackspace || matchesDelete || overlapsSelection) {
        view.dispatch({
          changes: { from: range.from, to: range.to, insert: "" },
          selection: { anchor: range.from }
        });
        return true;
      }
    }
    return false;
  }
  /** Moves the current selection anchor into a target cell. */
  moveSelectionToCell(view, cell, offset = 0) {
    const end = Math.max(cell.contentFrom, cell.contentTo);
    view.dispatch({
      selection: { anchor: Math.min(cell.contentFrom + offset, end) },
      scrollIntoView: true
    });
  }
  /** Returns the table currently containing the editor cursor. */
  getTableAtCursor(view) {
    return getTableInfoAtPosition(view.state, view.state.selection.main.head);
  }
  /** Returns the active cell under the current selection head. */
  getCurrentCell(view, tableInfo) {
    return findCellAtPosition(tableInfo, view.state.selection.main.head);
  }
};
var theme6 = createTheme({
  default: {
    ".cm-draftly-table-wrapper, .cm-draftly-table-widget": {
      display: "table",
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0",
      position: "relative",
      overflow: "visible",
      border: "1px solid var(--color-border, #d7dee7)",
      borderRadius: "0.75rem",
      backgroundColor: "var(--color-background, #ffffff)",
      "& .cm-draftly-table": {
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: "0",
        tableLayout: "auto"
      },
      "& .cm-draftly-table-row": {
        display: "table-row !important"
      },
      "& .cm-draftly-table-header-row": {
        backgroundColor: "rgba(15, 23, 42, 0.04)"
      },
      "& .cm-draftly-table-row-even": {
        backgroundColor: "rgba(15, 23, 42, 0.02)"
      },
      "& .cm-draftly-table-delimiter-row": {
        display: "none !important"
      },
      "& .cm-draftly-table-cell": {
        display: "table-cell",
        minWidth: "4rem",
        minHeight: "2.5rem",
        height: "2.75rem",
        padding: "0.5rem 0.875rem",
        verticalAlign: "top",
        borderRight: "1px solid var(--color-border, #d7dee7)",
        borderBottom: "1px solid var(--color-border, #d7dee7)",
        whiteSpace: "normal",
        overflowWrap: "break-word",
        wordBreak: "normal",
        lineHeight: "1.6"
      },
      "& .cm-draftly-table-body-row": {
        minHeight: "2.75rem"
      },
      "& .cm-draftly-table-cell .cm-draftly-code-inline": {
        whiteSpace: "normal",
        overflowWrap: "anywhere"
      },
      "& .cm-draftly-table-th": {
        fontWeight: "600",
        borderBottomWidth: "2px"
      },
      "& .cm-draftly-table-cell-last": {
        borderRight: "none"
      },
      "& .cm-draftly-table-row-last .cm-draftly-table-cell": {
        borderBottom: "none"
      },
      "& .cm-draftly-table-cell-center": {
        textAlign: "center"
      },
      "& .cm-draftly-table-cell-right": {
        textAlign: "right"
      },
      "& .cm-draftly-table-break": {
        display: "inline"
      },
      "& .cm-draftly-table-controls-anchor": {
        position: "absolute",
        inset: "0",
        pointerEvents: "none"
      },
      "& .cm-draftly-table-control": {
        position: "absolute",
        width: "1.75rem",
        height: "1.75rem",
        border: "1px solid var(--color-border, #d7dee7)",
        borderRadius: "999px",
        backgroundColor: "var(--color-background, #ffffff)",
        color: "var(--color-text, #0f172a)",
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: "0",
        pointerEvents: "auto",
        transition: "opacity 120ms ease, transform 120ms ease, background-color 120ms ease"
      },
      "& .cm-draftly-table-control:hover": {
        backgroundColor: "rgba(15, 23, 42, 0.05)"
      },
      "& .cm-draftly-table-control-column": {
        top: "50%",
        right: "-0.95rem",
        transform: "translate(0.35rem, -50%)"
      },
      "& .cm-draftly-table-control-row": {
        left: "50%",
        bottom: "-0.95rem",
        transform: "translate(-50%, 0.35rem)"
      },
      "&:hover .cm-draftly-table-control, &:focus-within .cm-draftly-table-control": {
        opacity: "1"
      },
      "&:hover .cm-draftly-table-control-column, &:focus-within .cm-draftly-table-control-column": {
        transform: "translate(0, -50%)"
      },
      "&:hover .cm-draftly-table-control-row, &:focus-within .cm-draftly-table-control-row": {
        transform: "translate(-50%, 0)"
      }
    }
  },
  dark: {
    ".cm-draftly-table-wrapper, .cm-draftly-table-widget": {
      borderColor: "var(--color-border, #30363d)",
      backgroundColor: "var(--color-background, #0d1117)",
      "& .cm-draftly-table-header-row": {
        backgroundColor: "rgba(255, 255, 255, 0.05)"
      },
      "& .cm-draftly-table-row-even": {
        backgroundColor: "rgba(255, 255, 255, 0.025)"
      },
      "& .cm-draftly-table-cell": {
        borderColor: "var(--color-border, #30363d)"
      },
      "& .cm-draftly-table-control": {
        borderColor: "var(--color-border, #30363d)",
        backgroundColor: "var(--color-background, #161b22)",
        color: "var(--color-text, #e6edf3)",
        boxShadow: "0 12px 28px rgba(0, 0, 0, 0.35)"
      },
      "& .cm-draftly-table-control:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.08)"
      }
    }
  }
});
var htmlMarkDecorations = {
  "html-tag": Decoration.mark({ class: "cm-draftly-html-tag" }),
  "html-comment": Decoration.mark({ class: "cm-draftly-html-comment" })
};
var htmlLineDecorations = {
  "html-block": Decoration.line({ class: "cm-draftly-line-html-block" }),
  "hidden-line": Decoration.line({ class: "cm-draftly-hidden-line" })
};
var HTMLPreviewWidget = class extends WidgetType {
  constructor(html) {
    super();
    this.html = html;
  }
  eq(other) {
    return other.html === this.html;
  }
  toDOM() {
    const div = document.createElement("div");
    div.className = "cm-draftly-html-preview";
    div.innerHTML = DOMPurify.sanitize(this.html);
    return div;
  }
  ignoreEvent() {
    return false;
  }
};
var InlineHTMLPreviewWidget = class extends WidgetType {
  constructor(html) {
    super();
    this.html = html;
  }
  eq(other) {
    return other.html === this.html;
  }
  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-draftly-inline-html-preview";
    span.innerHTML = DOMPurify.sanitize(this.html);
    return span;
  }
  ignoreEvent() {
    return false;
  }
};
function parseHTMLTag(content) {
  const match = content.match(/^<\s*(\/?)([a-zA-Z][a-zA-Z0-9-]*)[^>]*(\/?)>$/);
  if (!match) return null;
  return {
    tagName: match[2].toLowerCase(),
    isClosing: match[1] === "/",
    isSelfClosing: match[3] === "/" || ["br", "hr", "img", "input", "meta", "link", "area", "base", "col", "embed", "source", "track", "wbr"].includes(
      match[2].toLowerCase()
    )
  };
}
var HTMLPlugin = class extends DecorationPlugin {
  name = "html";
  version = "1.0.0";
  decorationPriority = 30;
  constructor() {
    super();
  }
  /**
   * Plugin theme
   */
  get theme() {
    return theme7;
  }
  buildDecorations(ctx) {
    const { view, decorations } = ctx;
    const tree = syntaxTree(view.state);
    const htmlGroups = [];
    const htmlTags = [];
    tree.iterate({
      enter: (node) => {
        const { from, to, name } = node;
        if (name === "Comment") {
          decorations.push(htmlMarkDecorations["html-comment"].range(from, to));
          return;
        }
        if (name === "HTMLTag") {
          const content = view.state.sliceDoc(from, to);
          const parsed = parseHTMLTag(content);
          if (parsed) {
            htmlTags.push({
              from,
              to,
              tagName: parsed.tagName,
              isClosing: parsed.isClosing,
              isSelfClosing: parsed.isSelfClosing
            });
          }
        }
        if (name === "HTMLBlock") {
          const last = htmlGroups[htmlGroups.length - 1];
          if (last) {
            const gap = view.state.sliceDoc(last.to, from);
            if (!gap.trim()) {
              last.to = to;
              return;
            }
          }
          htmlGroups.push({ from, to });
        }
      }
    });
    const inlineElements = [];
    const usedTags = /* @__PURE__ */ new Set();
    for (let i = 0; i < htmlTags.length; i++) {
      if (usedTags.has(i)) continue;
      const openTag = htmlTags[i];
      if (openTag.isClosing) continue;
      if (openTag.isSelfClosing) {
        inlineElements.push({
          from: openTag.from,
          to: openTag.to,
          content: view.state.sliceDoc(openTag.from, openTag.to)
        });
        usedTags.add(i);
        continue;
      }
      const openLine = view.state.doc.lineAt(openTag.from);
      let depth = 1;
      let closeTagIndex = null;
      for (let j = i + 1; j < htmlTags.length && depth > 0; j++) {
        const tag = htmlTags[j];
        if (tag.from > openLine.to) break;
        if (tag.tagName === openTag.tagName) {
          if (tag.isClosing) {
            depth--;
            if (depth === 0) {
              closeTagIndex = j;
            }
          } else if (!tag.isSelfClosing) {
            depth++;
          }
        }
      }
      if (closeTagIndex !== null) {
        const closeTag = htmlTags[closeTagIndex];
        inlineElements.push({
          from: openTag.from,
          to: closeTag.to,
          content: view.state.sliceDoc(openTag.from, closeTag.to)
        });
        for (let k = i; k <= closeTagIndex; k++) {
          usedTags.add(k);
        }
      }
    }
    inlineElements.sort((a, b) => a.from - b.from);
    const filteredElements = [];
    let lastEnd = -1;
    for (const elem of inlineElements) {
      if (elem.from >= lastEnd) {
        filteredElements.push(elem);
        lastEnd = elem.to;
      }
    }
    for (const elem of filteredElements) {
      const cursorInRange = ctx.cursorInRange(elem.from, elem.to);
      if (cursorInRange) {
        for (const tag of htmlTags) {
          if (tag.from >= elem.from && tag.to <= elem.to) {
            decorations.push(htmlMarkDecorations["html-tag"].range(tag.from, tag.to));
          }
        }
      } else {
        decorations.push(
          Decoration.replace({
            widget: new InlineHTMLPreviewWidget(elem.content)
          }).range(elem.from, elem.to)
        );
      }
    }
    for (let i = 0; i < htmlTags.length; i++) {
      if (!usedTags.has(i)) {
        const tag = htmlTags[i];
        decorations.push(htmlMarkDecorations["html-tag"].range(tag.from, tag.to));
      }
    }
    for (const group of htmlGroups) {
      const { from, to } = group;
      const nodeLineStart = view.state.doc.lineAt(from);
      const nodeLineEnd = view.state.doc.lineAt(to);
      const cursorInRange = ctx.cursorInRange(nodeLineStart.from, nodeLineEnd.to);
      if (cursorInRange) {
        for (let i = nodeLineStart.number; i <= nodeLineEnd.number; i++) {
          const line = view.state.doc.line(i);
          decorations.push(htmlLineDecorations["html-block"].range(line.from));
        }
      } else {
        const htmlContent = view.state.sliceDoc(from, to);
        decorations.push(
          Decoration.replace({
            widget: new HTMLPreviewWidget(htmlContent.trim())
          }).range(from, nodeLineStart.to)
        );
        for (let i = nodeLineStart.number + 1; i <= nodeLineEnd.number; i++) {
          const line = view.state.doc.line(i);
          decorations.push(htmlLineDecorations["hidden-line"].range(line.from));
        }
      }
    }
  }
};
var theme7 = createTheme({
  default: {
    ".cm-draftly-html-tag": {
      color: "#6a737d",
      fontFamily: "var(--font-jetbrains-mono, monospace)",
      fontSize: "0.85em"
    },
    ".cm-draftly-html-comment": {
      color: "#6a737d",
      fontStyle: "italic",
      fontFamily: "var(--font-jetbrains-mono, monospace)",
      fontSize: "0.85em",
      opacity: 0.5
    },
    ".cm-draftly-line-html-block": {
      backgroundColor: "rgba(0, 0, 0, 0.02)"
    },
    ".cm-draftly-hidden-line": {
      display: "none"
    },
    ".cm-draftly-html-preview": {
      display: "inline-block",
      width: "100%",
      verticalAlign: "top",
      margin: "0",
      whiteSpace: "normal",
      lineHeight: "1.4"
    },
    ".cm-draftly-html-preview > *:first-child": {
      marginTop: "0"
    },
    ".cm-draftly-html-preview > *:last-child": {
      marginBottom: "0"
    },
    ".cm-draftly-inline-html-preview": {
      display: "inline",
      whiteSpace: "normal"
    }
  }
});
var imageMarkDecorations = {
  "image-block": Decoration.line({ class: "cm-draftly-image-block" }),
  "image-marker": Decoration.mark({ class: "cm-draftly-image-marker" }),
  "image-alt": Decoration.mark({ class: "cm-draftly-image-alt" }),
  "image-url": Decoration.mark({ class: "cm-draftly-image-url" }),
  "image-hidden": Decoration.mark({ class: "cm-draftly-image-hidden" })
};
function parseImageMarkdown(content) {
  const match = content.match(/^!\[([^\]]*)\]\(([^"\s)]+)(?:\s+"([^"]*)")?\s*\)$/);
  if (!match) return null;
  const result = {
    alt: match[1] || "",
    url: match[2]
  };
  if (match[3] !== void 0) {
    result.title = match[3];
  }
  return result;
}
var ImageWidget = class extends WidgetType {
  constructor(url, alt, from, to, title) {
    super();
    this.url = url;
    this.alt = alt;
    this.from = from;
    this.to = to;
    this.title = title;
  }
  eq(other) {
    return other.url === this.url && other.alt === this.alt && other.from === this.from && other.to === this.to && other.title === this.title;
  }
  toDOM(view) {
    const figure = document.createElement("figure");
    figure.className = "cm-draftly-image-figure";
    figure.setAttribute("role", "figure");
    figure.style.cursor = "pointer";
    if (this.title) {
      figure.setAttribute("aria-label", this.title);
    }
    figure.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      view.dispatch({
        selection: { anchor: this.from, head: this.to },
        scrollIntoView: true
      });
      view.focus();
    });
    const img = document.createElement("img");
    img.className = "cm-draftly-image";
    img.src = this.url;
    img.alt = this.alt;
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
    if (this.title) {
      img.title = this.title;
    }
    img.onerror = () => {
      img.style.display = "none";
      const errorSpan = document.createElement("span");
      errorSpan.className = "cm-draftly-image-error";
      errorSpan.setAttribute("role", "alert");
      errorSpan.textContent = `[Image not found: ${this.alt || this.url}]`;
      figure.appendChild(errorSpan);
    };
    figure.appendChild(img);
    if (this.title) {
      const figcaption = document.createElement("figcaption");
      figcaption.className = "cm-draftly-image-caption";
      figcaption.textContent = this.title;
      figure.appendChild(figcaption);
    }
    return figure;
  }
  ignoreEvent(event) {
    return event.type !== "click";
  }
};
var ImagePlugin = class extends DecorationPlugin {
  name = "image";
  version = "1.0.0";
  decorationPriority = 25;
  requiredNodes = ["Image"];
  constructor() {
    super();
  }
  /**
   * Plugin theme
   */
  get theme() {
    return theme8;
  }
  /**
   * Keyboard shortcuts for image formatting
   */
  getKeymap() {
    return [
      {
        key: "Mod-Shift-i",
        run: (view) => this.toggleImage(view),
        preventDefault: true
      }
    ];
  }
  /**
   * URL regex pattern
   */
  urlPattern = /^(https?:\/\/|www\.)[^\s]+$/i;
  /**
   * Toggle image on selection
   * - If text selected and is a URL: ![Alt Text](url) with cursor in brackets
   * - If text selected (not URL): ![text]() with cursor in parentheses
   * - If nothing selected: ![Alt Text]() with cursor in parentheses
   * - If already an image: remove syntax, leave just the URL
   */
  toggleImage(view) {
    const { state } = view;
    const { from, to, empty } = state.selection.main;
    const selectedText = state.sliceDoc(from, to);
    const imageMatch = selectedText.match(/^!\[([^\]]*)\]\(([^)]*)\)$/);
    if (imageMatch) {
      const imageUrl = imageMatch[2] || "";
      view.dispatch({
        changes: { from, to, insert: imageUrl },
        selection: { anchor: from, head: from + imageUrl.length }
      });
      return true;
    }
    const lineStart = state.doc.lineAt(from).from;
    const lineEnd = state.doc.lineAt(to).to;
    const lineText = state.sliceDoc(lineStart, lineEnd);
    const imageRegex = /!\[([^\]]*)\]\(([^)]*)\)/g;
    let match;
    while ((match = imageRegex.exec(lineText)) !== null) {
      const matchFrom = lineStart + match.index;
      const matchTo = matchFrom + match[0].length;
      if (from >= matchFrom && to <= matchTo) {
        const imageUrl = match[2] || "";
        view.dispatch({
          changes: { from: matchFrom, to: matchTo, insert: imageUrl },
          selection: { anchor: matchFrom, head: matchFrom + imageUrl.length }
        });
        return true;
      }
    }
    if (empty) {
      const defaultAlt = "Alt Text";
      const newText = `![${defaultAlt}]()`;
      view.dispatch({
        changes: { from, insert: newText },
        selection: { anchor: from + defaultAlt.length + 4 }
        // After ![Alt Text](
      });
    } else if (this.urlPattern.test(selectedText)) {
      const defaultAlt = "Alt Text";
      const newText = `![${defaultAlt}](${selectedText})`;
      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from + 2, head: from + 2 + defaultAlt.length }
        // Select "Alt Text"
      });
    } else {
      const newText = `![${selectedText}]()`;
      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from + selectedText.length + 4 }
        // After ![text](
      });
    }
    return true;
  }
  buildDecorations(ctx) {
    const { view, decorations } = ctx;
    const tree = syntaxTree(view.state);
    tree.iterate({
      enter: (node) => {
        const { from, to, name } = node;
        if (name === "Image") {
          const content = view.state.sliceDoc(from, to);
          const parsed = parseImageMarkdown(content);
          if (!parsed) return;
          const cursorInRange = ctx.selectionOverlapsRange(from, to);
          decorations.push(imageMarkDecorations["image-block"].range(from));
          decorations.push(
            Decoration.widget({
              widget: new ImageWidget(parsed.url, parsed.alt, from, to, parsed.title),
              side: 1,
              // Place after the position
              block: false
              // Don't create a new line
            }).range(to)
          );
          if (cursorInRange) {
            this.decorateRawImage(node.node, decorations, view);
          } else {
            decorations.push(imageMarkDecorations["image-hidden"].range(from, to));
          }
        }
      }
    });
  }
  /**
   * Decorate raw image markdown when cursor is in range
   */
  decorateRawImage(node, decorations, view) {
    for (let child = node.firstChild; child; child = child.nextSibling) {
      if (child.name === "URL") {
        decorations.push(imageMarkDecorations["image-url"].range(child.from, child.to));
      }
    }
    const content = view.state.sliceDoc(node.from, node.to);
    const bangBracket = node.from;
    if (content.startsWith("![")) {
      decorations.push(imageMarkDecorations["image-marker"].range(bangBracket, bangBracket + 2));
    }
    const altEnd = content.indexOf("](");
    if (altEnd !== -1) {
      const altStart = 2;
      if (altEnd > altStart) {
        decorations.push(imageMarkDecorations["image-alt"].range(node.from + altStart, node.from + altEnd));
      }
      decorations.push(imageMarkDecorations["image-marker"].range(node.from + altEnd, node.from + altEnd + 2));
      decorations.push(imageMarkDecorations["image-marker"].range(node.to - 1, node.to));
    }
  }
  /**
   * Render image to HTML for preview mode using figure/figcaption
   */
  renderToHTML(node, _children, ctx) {
    if (node.name !== "Image") return null;
    const content = ctx.sliceDoc(node.from, node.to);
    const parsed = parseImageMarkdown(content);
    if (!parsed) return null;
    const altAttr = ctx.sanitize(parsed.alt);
    const titleAttr = parsed.title ? ` title="${ctx.sanitize(parsed.title)}"` : "";
    const ariaLabel = parsed.title ? ` aria-label="${ctx.sanitize(parsed.title)}"` : "";
    let html = `<figure class="cm-draftly-image-figure" role="figure"${ariaLabel}>`;
    html += `<img class="cm-draftly-image" src="${ctx.sanitize(parsed.url)}" alt="${altAttr}"${titleAttr} loading="lazy" decoding="async" />`;
    if (parsed.title) {
      html += `<figcaption class="cm-draftly-image-caption">${ctx.sanitize(parsed.title)}</figcaption>`;
    }
    html += `</figure>`;
    return html;
  }
};
var theme8 = createTheme({
  default: {
    ".cm-draftly-image-block br": {
      display: "none"
    },
    // Image markers (! [ ] ( ))
    ".cm-draftly-image-marker": {
      color: "#6a737d",
      fontFamily: "var(--font-jetbrains-mono, monospace)"
    },
    // Alt text
    ".cm-draftly-image-alt": {
      color: "#22863a",
      fontStyle: "italic"
    },
    // URL
    ".cm-draftly-image-url": {
      color: "#0366d6",
      textDecoration: "underline"
    },
    // Hidden markdown syntax (when cursor is not in range)
    ".cm-draftly-image-hidden": {
      display: "none"
    },
    // Figure container
    ".cm-draftly-image-figure": {
      display: "flex",
      flexDirection: "column",
      alignItems: "start",
      maxWidth: "100%",
      padding: "0"
    },
    // Image element
    ".cm-draftly-image": {
      maxWidth: "100%",
      maxHeight: "800px",
      height: "auto",
      borderRadius: "4px"
    },
    // Figcaption
    ".cm-draftly-image-caption": {
      display: "block",
      width: "100%",
      fontSize: "0.875em",
      color: "#6a737d",
      marginTop: "0.5em",
      textAlign: "center",
      fontStyle: "italic"
    },
    // Error state
    ".cm-draftly-image-error": {
      display: "inline-block",
      padding: "0.5em 1em",
      backgroundColor: "rgba(255, 0, 0, 0.1)",
      color: "#d73a49",
      borderRadius: "4px",
      fontSize: "0.875em",
      fontStyle: "italic"
    }
  },
  dark: {
    ".cm-draftly-image-marker": {
      color: "#8b949e"
    },
    ".cm-draftly-image-alt": {
      color: "#7ee787"
    },
    ".cm-draftly-image-url": {
      color: "#58a6ff"
    },
    ".cm-draftly-image-caption": {
      color: "#8b949e"
    },
    ".cm-draftly-image-error": {
      backgroundColor: "rgba(255, 0, 0, 0.15)",
      color: "#f85149"
    }
  }
});
function injectKatexStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("draftly-katex-styles")) return;
  const style = document.createElement("style");
  style.id = "draftly-katex-styles";
  style.textContent = katexCss;
  document.head.appendChild(style);
}
injectKatexStyles();
var DOLLAR = 36;
var mathMarkDecorations = {
  "math-block": Decoration.line({ class: "cm-draftly-math-block" }),
  "math-inline": Decoration.mark({ class: "cm-draftly-math-inline" }),
  "math-marker": Decoration.mark({ class: "cm-draftly-math-marker" }),
  "math-hidden": Decoration.mark({ class: "cm-draftly-math-hidden" })
};
function renderMath(latex, displayMode) {
  try {
    const html = katex.renderToString(latex, {
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
var InlineMathWidget = class extends WidgetType {
  constructor(latex, from, to) {
    super();
    this.latex = latex;
    this.from = from;
    this.to = to;
  }
  eq(other) {
    return other.latex === this.latex && other.from === this.from && other.to === this.to;
  }
  toDOM(view) {
    const span = document.createElement("span");
    span.className = "cm-draftly-math-rendered cm-draftly-math-rendered-inline";
    span.style.cursor = "pointer";
    const { html, error } = renderMath(this.latex, false);
    if (error) {
      span.className += " cm-draftly-math-error";
      span.textContent = `[Math Error: ${error}]`;
    } else {
      span.innerHTML = html;
    }
    span.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      view.dispatch({
        selection: { anchor: this.from, head: this.to },
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
var MathBlockWidget = class extends WidgetType {
  constructor(latex, from, to) {
    super();
    this.latex = latex;
    this.from = from;
    this.to = to;
  }
  eq(other) {
    return other.latex === this.latex && other.from === this.from && other.to === this.to;
  }
  toDOM(view) {
    const div = document.createElement("div");
    div.className = "cm-draftly-math-rendered cm-draftly-math-rendered-block";
    div.style.cursor = "pointer";
    const { html, error } = renderMath(this.latex, true);
    if (error) {
      div.className += " cm-draftly-math-error";
      div.textContent = `[Math Error: ${error}]`;
    } else {
      div.innerHTML = html;
    }
    div.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      view.dispatch({
        selection: { anchor: this.from, head: this.to },
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
    const trimmed = text.slice(line.pos).trimStart();
    if (!trimmed.startsWith("$$")) return false;
    const startLine = cx.lineStart;
    let endPos = -1;
    let lastLineEnd = startLine + line.text.length;
    while (cx.nextLine()) {
      const currentText = line.text;
      lastLineEnd = cx.lineStart + currentText.length;
      if (currentText.trimEnd().endsWith("$$")) {
        endPos = lastLineEnd;
        cx.nextLine();
        break;
      }
    }
    if (endPos === -1) {
      return false;
    }
    const openMark = cx.elt("MathBlockMark", startLine, startLine + text.indexOf("$$") + 2);
    const closeMark = cx.elt("MathBlockMark", endPos - 2, endPos);
    cx.addElement(cx.elt("MathBlock", startLine, endPos, [openMark, closeMark]));
    return true;
  }
};
var MathPlugin = class extends DecorationPlugin {
  name = "math";
  version = "1.0.0";
  decorationPriority = 25;
  requiredNodes = ["InlineMath", "MathBlock", "InlineMathMark", "MathBlockMark"];
  constructor() {
    super();
  }
  /**
   * Plugin theme
   */
  get theme() {
    return theme9;
  }
  /**
   * Intercepts dollar typing to wrap selected text as inline math.
   *
   * If user types '$' while text is selected, wraps each selected range
   * with single dollars (selected -> $selected$).
   */
  getExtensions() {
    return [createWrapSelectionInputHandler({ "$": "$" })];
  }
  /**
   * Return markdown parser extensions for math syntax
   */
  getMarkdownConfig() {
    return {
      defineNodes: [
        { name: "InlineMath", style: tags.emphasis },
        { name: "InlineMathMark", style: tags.processingInstruction },
        { name: "MathBlock", block: true },
        { name: "MathBlockMark", style: tags.processingInstruction }
      ],
      parseInline: [inlineMathParser],
      parseBlock: [mathBlockParser]
    };
  }
  /**
   * Build decorations for math expressions
   */
  buildDecorations(ctx) {
    const { view, decorations } = ctx;
    const tree = syntaxTree(view.state);
    tree.iterate({
      enter: (node) => {
        const { from, to, name } = node;
        if (name === "InlineMath") {
          const content = view.state.sliceDoc(from, to);
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
              Decoration.replace({
                widget: new InlineMathWidget(latex, from, to)
              }).range(from, to)
            );
          }
        }
        if (name === "MathBlock") {
          const content = view.state.sliceDoc(from, to);
          const lines = content.split("\n");
          const latex = lines.slice(1, -1).join("\n").trim();
          const singleLine = !content.includes("\n");
          const latexContent = singleLine ? content.slice(2, -2).trim() : latex;
          const nodeLineStart = view.state.doc.lineAt(from);
          const nodeLineEnd = view.state.doc.lineAt(to);
          const cursorInRange = ctx.selectionOverlapsRange(nodeLineStart.from, nodeLineEnd.to);
          decorations.push(mathMarkDecorations["math-block"].range(from));
          decorations.push(
            Decoration.widget({
              widget: new MathBlockWidget(latexContent, from, to),
              side: 1,
              block: false
            }).range(to)
          );
          for (let i = nodeLineStart.number; i <= nodeLineEnd.number; i++) {
            const line = view.state.doc.line(i);
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
var theme9 = createTheme({
  default: {
    ".cm-draftly-math-block": {
      fontFamily: "var(--font-jetbrains-mono, monospace)"
    },
    ".cm-draftly-math-block br": {
      display: "none"
    },
    // Math markers ($ $$)
    ".cm-draftly-math-marker": {
      color: "#6a737d",
      fontFamily: "var(--font-jetbrains-mono, monospace)"
    },
    // Inline math styling when editing
    ".cm-draftly-math-inline": {
      fontFamily: "var(--font-jetbrains-mono, monospace)",
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
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      borderRadius: "4px",
      overflow: "auto"
    },
    // Math error styling
    ".cm-draftly-math-error": {
      display: "inline-block",
      padding: "0.25em 0.5em",
      backgroundColor: "rgba(255, 0, 0, 0.1)",
      color: "#d73a49",
      borderRadius: "4px",
      fontSize: "0.875em",
      fontStyle: "italic",
      fontFamily: "var(--font-jetbrains-mono, monospace)"
    }
  },
  dark: {
    ".cm-draftly-math-marker": {
      color: "#8b949e"
    },
    ".cm-draftly-math-rendered-block": {
      backgroundColor: "rgba(255, 255, 255, 0.02)"
    },
    ".cm-draftly-math-error": {
      backgroundColor: "rgba(255, 0, 0, 0.15)",
      color: "#f85149"
    }
  }
});
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  suppressErrorRendering: true
});
var mermaidCounter = 0;
async function renderMermaid(definition, options = {}, defaultTheme = "default") {
  try {
    const id = `draftly-mermaid-${mermaidCounter++}`;
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
    const { svg } = await mermaid.render(id, finalDefinition);
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
var mermaidMarkDecorations = {
  "mermaid-block-start": Decoration.line({ class: "cm-draftly-mermaid-block-start" }),
  "mermaid-block-end": Decoration.line({ class: "cm-draftly-mermaid-block-end" }),
  "mermaid-block": Decoration.line({ class: "cm-draftly-mermaid-block" }),
  "mermaid-block-rendered": Decoration.line({ class: "cm-draftly-mermaid-block-rendered" }),
  "mermaid-marker": Decoration.mark({ class: "cm-draftly-mermaid-marker" }),
  "mermaid-hidden": Decoration.mark({ class: "cm-draftly-mermaid-hidden" })
};
var MermaidBlockWidget = class extends WidgetType {
  constructor(definition, attributes, defaultTheme, from, to) {
    super();
    this.definition = definition;
    this.attributes = attributes;
    this.defaultTheme = defaultTheme;
    this.from = from;
    this.to = to;
  }
  eq(other) {
    return other.definition === this.definition && JSON.stringify(other.attributes) === JSON.stringify(this.attributes) && other.defaultTheme === this.defaultTheme && other.from === this.from && other.to === this.to;
  }
  toDOM(view) {
    const div = document.createElement("div");
    div.className = "cm-draftly-mermaid-rendered";
    div.style.cursor = "pointer";
    div.innerHTML = `<div class="cm-draftly-mermaid-loading">Rendering diagram\u2026</div>`;
    renderMermaid(this.definition, this.attributes, this.defaultTheme).then(({ svg, error }) => {
      if (error) {
        div.className += " cm-draftly-mermaid-error";
        div.innerHTML = `<span>[Mermaid Error: ${error}]</span>`;
      } else {
        div.innerHTML = svg;
      }
    });
    div.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      view.dispatch({
        selection: { anchor: this.from, head: this.to },
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
var MermaidPlugin = class extends DecorationPlugin {
  name = "mermaid";
  version = "1.0.0";
  decorationPriority = 25;
  requiredNodes = ["MermaidBlock", "MermaidBlockMark"];
  constructor() {
    super();
  }
  /**
   * Plugin theme
   */
  get theme() {
    return theme10;
  }
  /**
   * Return markdown parser extensions for mermaid syntax
   */
  getMarkdownConfig() {
    return {
      defineNodes: [
        { name: "MermaidBlock", block: true },
        { name: "MermaidBlockMark", style: tags.processingInstruction }
      ],
      parseBlock: [mermaidBlockParser]
    };
  }
  /**
   * Build decorations for mermaid blocks
   */
  buildDecorations(ctx) {
    const { view, decorations } = ctx;
    const tree = syntaxTree(view.state);
    const config = this.context?.config;
    const currentTheme = config?.theme === "dark" /* DARK */ ? "dark" : "default";
    tree.iterate({
      enter: (node) => {
        const { from, to, name } = node;
        if (name === "MermaidBlock") {
          const content = view.state.sliceDoc(from, to);
          const lines = content.split("\n");
          const definition = lines.slice(1, -1).join("\n").trim();
          const docLines = content.split("\n");
          const fenceLine = docLines[0] || "";
          const attributes = parseAttributes(fenceLine);
          const nodeLineStart = view.state.doc.lineAt(from);
          const nodeLineEnd = view.state.doc.lineAt(to);
          const cursorInRange = ctx.selectionOverlapsRange(nodeLineStart.from, nodeLineEnd.to);
          const totalCodeLines = nodeLineEnd.number - nodeLineStart.number - 1;
          const lineNumWidth = String(totalCodeLines).length;
          let codeLineIndex = 1;
          for (let i = nodeLineStart.number; i <= nodeLineEnd.number; i++) {
            const line = view.state.doc.line(i);
            const isFenceLine = i === nodeLineStart.number || i === nodeLineEnd.number;
            const relativeLineNum = codeLineIndex;
            decorations.push(mermaidMarkDecorations["mermaid-block"].range(line.from));
            if (!cursorInRange) decorations.push(mermaidMarkDecorations["mermaid-block-rendered"].range(line.from));
            if (i === nodeLineStart.number)
              decorations.push(mermaidMarkDecorations["mermaid-block-start"].range(line.from));
            if (i === nodeLineEnd.number)
              decorations.push(mermaidMarkDecorations["mermaid-block-end"].range(line.from));
            if (!isFenceLine) {
              decorations.push(
                Decoration.line({
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
          decorations.push(
            Decoration.widget({
              widget: new MermaidBlockWidget(definition, attributes, currentTheme, from, to),
              side: 1,
              block: false
            }).range(to)
          );
          if (cursorInRange) {
            for (let child = node.node.firstChild; child; child = child.nextSibling) {
              if (child.name === "MermaidBlockMark") {
                decorations.push(mermaidMarkDecorations["mermaid-marker"].range(child.from, child.to));
              }
            }
          } else {
            decorations.push(mermaidMarkDecorations["mermaid-hidden"].range(from, to));
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
var theme10 = createTheme({
  default: {
    // Raw mermaid block lines (monospace)
    ".cm-draftly-mermaid-block:not(.cm-draftly-mermaid-block-rendered)": {
      "--radius": "0.375rem",
      position: "relative",
      fontFamily: "var(--font-jetbrains-mono, monospace)",
      fontSize: "0.9rem",
      backgroundColor: "rgba(0, 0, 0, 0.03)",
      padding: "0 1rem !important",
      paddingLeft: "calc(var(--line-num-width, 2ch) + 1rem) !important",
      lineHeight: "1.5",
      borderLeft: "1px solid var(--color-border)",
      borderRight: "1px solid var(--color-border)"
    },
    ".cm-draftly-mermaid-block-start:not(.cm-draftly-mermaid-block-rendered)": {
      overflow: "hidden",
      borderTopLeftRadius: "var(--radius)",
      borderTopRightRadius: "var(--radius)",
      borderTop: "1px solid var(--color-border)"
    },
    ".cm-draftly-mermaid-block-end:not(.cm-draftly-mermaid-block-rendered)": {
      overflow: "hidden",
      borderBottomLeftRadius: "var(--radius)",
      borderBottomRightRadius: "var(--radius)",
      borderBottom: "1px solid var(--color-border)"
    },
    ".cm-draftly-mermaid-block:not(.cm-draftly-mermaid-block-rendered)::before": {
      content: "attr(data-line-num)",
      position: "absolute",
      left: "0.5rem",
      top: "0.2rem",
      width: "var(--line-num-width, 2ch)",
      textAlign: "right",
      color: "#6a737d",
      opacity: "0.6",
      fontFamily: "var(--font-jetbrains-mono, monospace)",
      fontSize: "0.85rem",
      userSelect: "none"
    },
    ".cm-draftly-mermaid-block.cm-draftly-mermaid-block-rendered br": {
      display: "none"
    },
    // Mermaid markers (```mermaid / ```)
    ".cm-draftly-mermaid-marker": {
      color: "#6a737d",
      fontFamily: "var(--font-jetbrains-mono, monospace)"
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
      color: "#6a737d",
      fontSize: "0.875em",
      fontStyle: "italic",
      fontFamily: "var(--font-jetbrains-mono, monospace)"
    },
    // Error styling
    ".cm-draftly-mermaid-error": {
      display: "inline-block",
      padding: "0.25em 0.5em",
      backgroundColor: "rgba(255, 0, 0, 0.1)",
      color: "#d73a49",
      borderRadius: "4px",
      fontSize: "0.875em",
      fontStyle: "italic",
      fontFamily: "var(--font-jetbrains-mono, monospace)"
    }
  },
  dark: {
    ".cm-draftly-mermaid-block:not(.cm-draftly-mermaid-block-rendered)": {
      backgroundColor: "rgba(255, 255, 255, 0.03)"
    },
    ".cm-draftly-mermaid-marker": {
      color: "#8b949e"
    },
    ".cm-draftly-mermaid-loading": {
      color: "#8b949e"
    },
    ".cm-draftly-mermaid-error": {
      backgroundColor: "rgba(255, 0, 0, 0.15)",
      color: "#f85149"
    }
  }
});

// src/plugins/code-plugin.theme.ts
var codePluginTheme = createTheme({
  default: {
    // Inline code
    ".cm-draftly-code-inline": {
      fontFamily: "var(--font-jetbrains-mono, monospace)",
      fontSize: "0.9rem",
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      padding: "0.1rem 0.25rem",
      border: "1px solid var(--color-border)",
      borderRadius: "3px"
    },
    // Fenced code block lines
    ".cm-draftly-code-block-line": {
      "--radius": "0.375rem",
      fontFamily: "var(--font-jetbrains-mono, monospace)",
      fontSize: "0.9rem",
      backgroundColor: "rgba(0, 0, 0, 0.03)",
      padding: "0 1rem !important",
      lineHeight: "1.5",
      borderLeft: "1px solid var(--color-border)",
      borderRight: "1px solid var(--color-border)"
    },
    // First line of code block
    ".cm-draftly-code-block-line-start": {
      borderTopLeftRadius: "var(--radius)",
      borderTopRightRadius: "var(--radius)",
      position: "relative",
      overflow: "hidden",
      borderTop: "1px solid var(--color-border)",
      paddingBottom: "0.5rem !important"
    },
    // Remove top radius when header is present
    ".cm-draftly-code-block-has-header": {
      padding: "0 !important",
      paddingBottom: "0.5rem !important"
    },
    // Code block header widget
    ".cm-draftly-code-header": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.25rem 1rem",
      backgroundColor: "rgba(0, 0, 0, 0.06)",
      fontFamily: "var(--font-jetbrains-mono, monospace)",
      fontSize: "0.85rem",
      ".cm-draftly-code-header-left": {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        ".cm-draftly-code-header-title": {
          color: "var(--color-text, inherit)",
          fontWeight: "500"
        },
        ".cm-draftly-code-header-lang": {
          color: "#6a737d",
          opacity: "0.8"
        }
      },
      ".cm-draftly-code-header-right": {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        ".cm-draftly-code-copy-btn": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.25rem",
          backgroundColor: "transparent",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          color: "#6a737d",
          transition: "color 0.2s, background-color 0.2s",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            color: "var(--color-text, inherit)"
          },
          "&.copied": {
            color: "#22c55e"
          }
        }
      }
    },
    // Caption (below code block)
    ".cm-draftly-code-block-has-caption": {
      padding: "0 !important",
      paddingTop: "0.5rem !important"
    },
    ".cm-draftly-code-caption": {
      textAlign: "center",
      fontSize: "0.85rem",
      color: "#6a737d",
      fontStyle: "italic",
      padding: "0.25rem 1rem",
      backgroundColor: "rgba(0, 0, 0, 0.06)"
    },
    // Last line of code block
    ".cm-draftly-code-block-line-end": {
      borderBottomLeftRadius: "var(--radius)",
      borderBottomRightRadius: "var(--radius)",
      borderBottom: "1px solid var(--color-border)",
      paddingTop: "0.5rem !important",
      "& br": {
        display: "none"
      }
    },
    // Fence markers (```)
    ".cm-draftly-code-fence": {
      color: "#6a737d",
      fontFamily: "var(--font-jetbrains-mono, monospace)"
    },
    // Line numbers
    ".cm-draftly-code-line-numbered": {
      paddingLeft: "calc(var(--line-num-width, 2ch) + 1rem) !important",
      position: "relative",
      "&::before": {
        content: "attr(data-line-num)",
        position: "absolute",
        left: "0.5rem",
        top: "0.2rem",
        width: "var(--line-num-width, 2ch)",
        textAlign: "right",
        color: "#6a737d",
        opacity: "0.6",
        fontFamily: "var(--font-jetbrains-mono, monospace)",
        fontSize: "0.85rem",
        userSelect: "none"
      }
    },
    ".cm-draftly-code-line-numbered-diff": {
      paddingLeft: "calc(var(--line-num-old-width, 2ch) + var(--line-num-new-width, 2ch) + 2.75rem) !important",
      position: "relative",
      "&::before": {
        content: "attr(data-line-num-old)",
        position: "absolute",
        left: "0.5rem",
        top: "0.2rem",
        width: "var(--line-num-old-width, 2ch)",
        textAlign: "right",
        color: "#6a737d",
        opacity: "0.6",
        fontFamily: "var(--font-jetbrains-mono, monospace)",
        fontSize: "0.85rem",
        userSelect: "none"
      },
      "&::after": {
        content: 'attr(data-line-num-new) " " attr(data-diff-marker)',
        position: "absolute",
        left: "calc(0.5rem + var(--line-num-old-width, 2ch) + 0.75rem)",
        top: "0.2rem",
        width: "calc(var(--line-num-new-width, 2ch) + 2ch)",
        textAlign: "right",
        color: "#6a737d",
        opacity: "0.6",
        fontFamily: "var(--font-jetbrains-mono, monospace)",
        fontSize: "0.85rem",
        userSelect: "none"
      },
      "&.cm-draftly-code-line-diff-gutter": {
        paddingLeft: "calc(var(--line-num-width, 2ch) + 2rem) !important",
        "&::after": {
          content: "attr(data-diff-marker)",
          position: "absolute",
          left: "calc(0.5rem + var(--line-num-width, 2ch) + 0.35rem)",
          top: "0.1rem",
          width: "1ch",
          textAlign: "right",
          fontFamily: "var(--font-jetbrains-mono, monospace)",
          fontSize: "0.85rem",
          fontWeight: "700",
          userSelect: "none"
        }
      }
    },
    // Preview: code lines (need block display for full-width highlights)
    ".cm-draftly-code-line": {
      display: "block",
      position: "relative",
      paddingLeft: "1rem",
      paddingRight: "1rem",
      lineHeight: "1.5",
      borderLeft: "3px solid transparent"
    },
    // Line highlight
    ".cm-draftly-code-line-highlight": {
      backgroundColor: "rgba(255, 220, 100, 0.2) !important",
      borderLeft: "3px solid #f0b429 !important"
    },
    ".cm-draftly-code-line-diff-add": {
      color: "inherit",
      backgroundColor: "rgba(34, 197, 94, 0.12) !important",
      borderLeft: "3px solid #22c55e !important",
      "&.cm-draftly-code-line-diff-gutter::after": {
        color: "#16a34a"
      }
    },
    ".cm-draftly-code-line-diff-del": {
      color: "inherit",
      backgroundColor: "rgba(239, 68, 68, 0.12) !important",
      borderLeft: "3px solid #ef4444 !important",
      "&.cm-draftly-code-line-diff-gutter::after": {
        color: "#dc2626"
      }
    },
    ".cm-draftly-code-diff-sign-add": {
      color: "#16a34a",
      fontWeight: "700"
    },
    ".cm-draftly-code-diff-sign-del": {
      color: "#dc2626",
      fontWeight: "700"
    },
    ".cm-draftly-code-diff-mod-add": {
      color: "inherit",
      backgroundColor: "rgba(34, 197, 94, 0.25)",
      borderRadius: "2px",
      padding: "0.1rem 0"
    },
    ".cm-draftly-code-diff-mod-del": {
      color: "inherit",
      backgroundColor: "rgba(239, 68, 68, 0.25)",
      borderRadius: "2px",
      padding: "0.1rem 0"
    },
    // Text highlight
    ".cm-draftly-code-text-highlight": {
      color: "inherit",
      backgroundColor: "rgba(255, 220, 100, 0.4)",
      borderRadius: "2px",
      padding: "0.1rem 0"
    },
    // Preview: container wrapper
    ".cm-draftly-code-container": {
      margin: "1rem 0",
      borderRadius: "var(--radius)",
      overflow: "hidden",
      border: "1px solid var(--color-border)",
      ".cm-draftly-code-header": {
        borderRadius: "0",
        border: "none",
        borderBottom: "1px solid var(--color-border)"
      },
      ".cm-draftly-code-block": {
        margin: "0",
        borderRadius: "0",
        border: "none",
        whiteSpace: "pre-wrap"
      },
      ".cm-draftly-code-caption": {
        borderTop: "1px solid var(--color-border)"
      }
    },
    // Preview: standalone code block (not in container)
    ".cm-draftly-code-block": {
      fontFamily: "var(--font-jetbrains-mono, monospace)",
      fontSize: "0.9rem",
      backgroundColor: "rgba(0, 0, 0, 0.03)",
      padding: "1rem",
      overflow: "auto",
      position: "relative",
      borderRadius: "var(--radius)",
      border: "1px solid var(--color-border)",
      "&.cm-draftly-code-block-has-header": {
        borderTopLeftRadius: "0",
        borderTopRightRadius: "0",
        borderTop: "none",
        margin: "0",
        paddingTop: "0.5rem !important"
      },
      "&.cm-draftly-code-block-has-caption": {
        borderBottomLeftRadius: "0",
        borderBottomRightRadius: "0",
        borderBottom: "none",
        paddingBottom: "0.5rem !important"
      }
    }
  },
  dark: {
    ".cm-draftly-code-inline": {
      backgroundColor: "rgba(255, 255, 255, 0.1)"
    },
    ".cm-draftly-code-block-line": {
      backgroundColor: "rgba(255, 255, 255, 0.05)"
    },
    ".cm-draftly-code-fence": {
      color: "#8b949e"
    },
    ".cm-draftly-code-block": {
      backgroundColor: "rgba(255, 255, 255, 0.05)"
    },
    ".cm-draftly-code-header": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      ".cm-draftly-code-header-lang": {
        color: "#8b949e"
      },
      ".cm-draftly-code-copy-btn": {
        color: "#8b949e",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)"
        }
      }
    },
    ".cm-draftly-code-caption": {
      backgroundColor: "rgba(255, 255, 255, 0.05)"
    },
    ".cm-draftly-code-line-numbered": {
      "&::before": {
        color: "#8b949e"
      }
    },
    ".cm-draftly-code-line-numbered-diff": {
      "&::before": {
        color: "#8b949e"
      },
      "&::after": {
        color: "#8b949e"
      }
    },
    ".cm-draftly-code-line-diff-gutter": {
      "&::after": {
        color: "#8b949e"
      }
    },
    ".cm-draftly-code-line-highlight": {
      backgroundColor: "rgba(255, 220, 100, 0.15) !important",
      borderLeft: "3px solid #d9a520 !important"
    },
    ".cm-draftly-code-line-diff-add": {
      backgroundColor: "rgba(34, 197, 94, 0.15) !important",
      borderLeft: "3px solid #22c55e !important",
      "&.cm-draftly-code-line-diff-gutter::after": {
        color: "#4ade80"
      }
    },
    ".cm-draftly-code-line-diff-del": {
      backgroundColor: "rgba(239, 68, 68, 0.15) !important",
      borderLeft: "3px solid #ef4444 !important",
      "&.cm-draftly-code-line-diff-gutter::after": {
        color: "#f87171"
      }
    },
    ".cm-draftly-code-diff-sign-add": {
      color: "#4ade80"
    },
    ".cm-draftly-code-diff-sign-del": {
      color: "#f87171"
    },
    ".cm-draftly-code-diff-mod-add": {
      backgroundColor: "rgba(34, 197, 94, 0.3)"
    },
    ".cm-draftly-code-diff-mod-del": {
      backgroundColor: "rgba(239, 68, 68, 0.3)"
    },
    ".cm-draftly-code-text-highlight": {
      backgroundColor: "rgba(255, 220, 100, 0.3)"
    }
  }
});

// src/plugins/code-plugin.ts
var COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
var CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
var COPY_RESET_DELAY = 2e3;
var CODE_FENCE = "```";
var QUOTED_INFO_PATTERN = /(\w+)="([^"]*)"/g;
var TEXT_HIGHLIGHT_PATTERN = /\/([^/]+)\/(?:(\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*))?/g;
var codeMarkDecorations = {
  // Inline code
  "inline-code": Decoration.mark({ class: "cm-draftly-code-inline" }),
  "inline-mark": Decoration.replace({}),
  // Fenced code block
  "code-block-line": Decoration.line({ class: "cm-draftly-code-block-line" }),
  "code-block-line-start": Decoration.line({ class: "cm-draftly-code-block-line-start" }),
  "code-block-line-end": Decoration.line({ class: "cm-draftly-code-block-line-end" }),
  "code-fence": Decoration.mark({ class: "cm-draftly-code-fence" }),
  "code-hidden": Decoration.replace({}),
  // Highlights
  "code-line-highlight": Decoration.line({ class: "cm-draftly-code-line-highlight" }),
  "code-text-highlight": Decoration.mark({ class: "cm-draftly-code-text-highlight" }),
  // Diff preview
  "diff-line-add": Decoration.line({ class: "cm-draftly-code-line-diff-add" }),
  "diff-line-del": Decoration.line({ class: "cm-draftly-code-line-diff-del" }),
  "diff-sign-add": Decoration.mark({ class: "cm-draftly-code-diff-sign-add" }),
  "diff-sign-del": Decoration.mark({ class: "cm-draftly-code-diff-sign-del" }),
  "diff-mod-add": Decoration.mark({ class: "cm-draftly-code-diff-mod-add" }),
  "diff-mod-del": Decoration.mark({ class: "cm-draftly-code-diff-mod-del" }),
  "diff-escape-hidden": Decoration.replace({})
};
var CodeBlockHeaderWidget = class extends WidgetType {
  constructor(props, codeContent) {
    super();
    this.props = props;
    this.codeContent = codeContent;
  }
  /** Creates the header DOM element with title/language and optional copy button. */
  toDOM() {
    const header = document.createElement("div");
    header.className = "cm-draftly-code-header";
    const leftSide = document.createElement("div");
    leftSide.className = "cm-draftly-code-header-left";
    if (this.props.title) {
      const title = document.createElement("span");
      title.className = "cm-draftly-code-header-title";
      title.textContent = this.props.title;
      leftSide.appendChild(title);
    } else if (this.props.language) {
      const lang = document.createElement("span");
      lang.className = "cm-draftly-code-header-lang";
      lang.textContent = this.props.language;
      leftSide.appendChild(lang);
    }
    header.appendChild(leftSide);
    if (this.props.copy !== false) {
      const rightSide = document.createElement("div");
      rightSide.className = "cm-draftly-code-header-right";
      const copyBtn = document.createElement("button");
      copyBtn.className = "cm-draftly-code-copy-btn";
      copyBtn.type = "button";
      copyBtn.title = "Copy code";
      copyBtn.innerHTML = COPY_ICON;
      copyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(this.codeContent).then(() => {
          copyBtn.classList.add("copied");
          copyBtn.innerHTML = CHECK_ICON;
          setTimeout(() => {
            copyBtn.classList.remove("copied");
            copyBtn.innerHTML = COPY_ICON;
          }, COPY_RESET_DELAY);
        });
      });
      rightSide.appendChild(copyBtn);
      header.appendChild(rightSide);
    }
    return header;
  }
  /** Checks equality for widget reuse optimization. */
  eq(other) {
    return this.props.title === other.props.title && this.props.language === other.props.language && this.props.copy === other.props.copy && this.codeContent === other.codeContent;
  }
  /** Allow click events to propagate for copy button interaction. */
  ignoreEvent() {
    return false;
  }
};
var CodeBlockCaptionWidget = class extends WidgetType {
  constructor(caption) {
    super();
    this.caption = caption;
  }
  /** Creates the caption DOM element. */
  toDOM() {
    const captionEl = document.createElement("div");
    captionEl.className = "cm-draftly-code-caption";
    captionEl.textContent = this.caption;
    return captionEl;
  }
  /** Checks equality for widget reuse optimization. */
  eq(other) {
    return this.caption === other.caption;
  }
  /** Allow click events to propagate for caption interaction. */
  ignoreEvent() {
    return false;
  }
};
var CodePlugin = class extends DecorationPlugin {
  name = "code";
  version = "1.0.0";
  decorationPriority = 25;
  requiredNodes = ["InlineCode", "FencedCode", "CodeMark", "CodeInfo", "CodeText"];
  parserCache = /* @__PURE__ */ new Map();
  /**
   * Plugin theme
   */
  get theme() {
    return codePluginTheme;
  }
  /**
   * Keyboard shortcuts for code formatting
   */
  getKeymap() {
    return [
      {
        key: "Mod-e",
        run: toggleMarkdownStyle("`"),
        preventDefault: true
      },
      {
        key: "Mod-Shift-e",
        run: (view) => this.toggleCodeBlock(view),
        preventDefault: true
      }
    ];
  }
  /**
   * Intercepts backtick typing to wrap selected text as inline code.
   *
   * If user types '`' while text is selected, wraps each selected range
   * with backticks (selected -> `selected`).
   */
  getExtensions() {
    return [createWrapSelectionInputHandler({ "`": "`" })];
  }
  /**
   * Toggle code block on current line or selected lines
   */
  toggleCodeBlock(view) {
    const { state } = view;
    const { from, to } = state.selection.main;
    const startLine = state.doc.lineAt(from);
    const endLine = state.doc.lineAt(to);
    const prevLineNum = startLine.number > 1 ? startLine.number - 1 : startLine.number;
    const nextLineNum = endLine.number < state.doc.lines ? endLine.number + 1 : endLine.number;
    const prevLine = state.doc.line(prevLineNum);
    const nextLine = state.doc.line(nextLineNum);
    const isWrapped = prevLine.text.trim().startsWith(CODE_FENCE) && nextLine.text.trim() === CODE_FENCE && prevLineNum !== startLine.number && nextLineNum !== endLine.number;
    if (isWrapped) {
      view.dispatch({
        changes: [
          { from: prevLine.from, to: prevLine.to + 1, insert: "" },
          // Remove opening fence + newline
          { from: nextLine.from - 1, to: nextLine.to, insert: "" }
          // Remove newline + closing fence
        ]
      });
    } else {
      const openFence = `${CODE_FENCE}
`;
      const closeFence = `
${CODE_FENCE}`;
      view.dispatch({
        changes: [
          { from: startLine.from, insert: openFence },
          { from: endLine.to, insert: closeFence }
        ],
        selection: { anchor: startLine.from + openFence.length, head: endLine.to + openFence.length }
      });
    }
    return true;
  }
  /**
   * Parse CodeInfo string into structured properties
   *
   * @param codeInfo - The raw CodeInfo string (e.g., "tsx line-numbers{5} title=\"hello.tsx\" copy {2-4,5} /Hello/3-5")
   * @returns Parsed CodeBlockProperties object
   *
   * @example
   * ```typescript
   * parseCodeInfo("tsx line-numbers{5} title=\"hello.tsx\" copy {2-4,5} /Hello/3-5")
   * ```
   *
   * Returns:
   * ```json
   * {
   *   language: "tsx",
   *   lineNumbers: 5,
   *   title: "hello.tsx",
   *   copy: true,
   *   diff: false,
   *   highlightLines: [2,3,4,5],
   *   highlightText: [{ pattern: "Hello", instances: [3,4,5] }]
   * }
   * ```
   */
  parseCodeInfo(codeInfo) {
    const props = { language: "" };
    if (!codeInfo || !codeInfo.trim()) {
      return props;
    }
    let remaining = codeInfo.trim();
    const firstTokenMatch = remaining.match(/^([^\s]+)/);
    if (firstTokenMatch && firstTokenMatch[1]) {
      const firstToken = firstTokenMatch[1];
      const normalizedToken = firstToken.toLowerCase();
      const isLineNumberDirective = /^(?:line-numbers|linenumbers|showlinenumbers)(?:\{\d+\})?$/.test(
        normalizedToken
      );
      const isKnownDirective = isLineNumberDirective || normalizedToken === "copy" || normalizedToken === "diff" || normalizedToken.startsWith("{") || normalizedToken.startsWith("/");
      if (!isKnownDirective) {
        props.language = firstToken;
        remaining = remaining.slice(firstToken.length).trim();
      }
    }
    let quotedMatch;
    while ((quotedMatch = QUOTED_INFO_PATTERN.exec(remaining)) !== null) {
      const key = quotedMatch[1]?.toLowerCase();
      const value = quotedMatch[2];
      if (key === "title" && value !== void 0) {
        props.title = value;
      } else if (key === "caption" && value !== void 0) {
        props.caption = value;
      }
    }
    remaining = remaining.replace(QUOTED_INFO_PATTERN, "").trim();
    const lineNumbersMatch = remaining.match(/\b(?:line-numbers|lineNumbers|showLineNumbers)(?:\{(\d+)\})?/i);
    if (lineNumbersMatch) {
      if (lineNumbersMatch[1]) {
        props.showLineNumbers = parseInt(lineNumbersMatch[1], 10);
      } else {
        props.showLineNumbers = true;
      }
      remaining = remaining.replace(lineNumbersMatch[0], "").trim();
    }
    if (/\bcopy\b/.test(remaining)) {
      props.copy = true;
      remaining = remaining.replace(/\bcopy\b/, "").trim();
    }
    if (/\bdiff\b/.test(remaining)) {
      props.diff = true;
      remaining = remaining.replace(/\bdiff\b/, "").trim();
    }
    const lineHighlightMatch = remaining.match(/\{([^}]+)\}/);
    if (lineHighlightMatch && lineHighlightMatch[1]) {
      const highlightLines = this.parseNumberList(lineHighlightMatch[1]);
      if (highlightLines.length > 0) {
        props.highlightLines = highlightLines;
      }
      remaining = remaining.replace(lineHighlightMatch[0], "").trim();
    }
    let textMatch;
    const highlightText = [];
    while ((textMatch = TEXT_HIGHLIGHT_PATTERN.exec(remaining)) !== null) {
      if (!textMatch[1]) continue;
      const highlight = {
        pattern: textMatch[1]
      };
      if (textMatch[2]) {
        const instances = this.parseNumberList(textMatch[2]);
        if (instances.length > 0) {
          highlight.instances = instances;
        }
      }
      highlightText.push(highlight);
    }
    if (highlightText.length > 0) {
      props.highlightText = highlightText;
    }
    return props;
  }
  /**
   * Build decorations for inline code and fenced code blocks.
   * Handles line numbers, highlights, header/caption widgets, and fence visibility.
   */
  buildDecorations(ctx) {
    const tree = syntaxTree(ctx.view.state);
    tree.iterate({
      enter: (node) => {
        if (node.name === "InlineCode") {
          this.decorateInlineCode(node, ctx);
          return;
        }
        if (node.name === "FencedCode") {
          this.decorateFencedCode(node, ctx);
        }
      }
    });
  }
  decorateInlineCode(node, ctx) {
    const { from, to } = node;
    ctx.decorations.push(codeMarkDecorations["inline-code"].range(from, to));
    if (ctx.selectionOverlapsRange(from, to)) {
      return;
    }
    for (let child = node.node.firstChild; child; child = child.nextSibling) {
      if (child.name === "CodeMark") {
        ctx.decorations.push(codeMarkDecorations["inline-mark"].range(child.from, child.to));
      }
    }
  }
  decorateFencedCode(node, ctx) {
    const { view, decorations } = ctx;
    const nodeLineStart = view.state.doc.lineAt(node.from);
    const nodeLineEnd = view.state.doc.lineAt(node.to);
    const cursorInRange = ctx.selectionOverlapsRange(nodeLineStart.from, nodeLineEnd.to);
    let infoProps = { language: "" };
    let codeContent = "";
    for (let child = node.node.firstChild; child; child = child.nextSibling) {
      if (child.name === "CodeInfo") {
        infoProps = this.parseCodeInfo(view.state.sliceDoc(child.from, child.to).trim());
      }
      if (child.name === "CodeText") {
        codeContent = view.state.sliceDoc(child.from, child.to);
      }
    }
    const codeLines = [];
    for (let i = nodeLineStart.number + 1; i <= nodeLineEnd.number - 1; i++) {
      const codeLine = view.state.doc.line(i);
      codeLines.push(view.state.sliceDoc(codeLine.from, codeLine.to));
    }
    const totalCodeLines = nodeLineEnd.number - nodeLineStart.number - 1;
    const startLineNum = typeof infoProps.showLineNumbers === "number" ? infoProps.showLineNumbers : 1;
    const maxLineNum = startLineNum + totalCodeLines - 1;
    const lineNumWidth = Math.max(String(maxLineNum).length, String(startLineNum).length);
    const highlightInstanceCounters = new Array(infoProps.highlightText?.length ?? 0).fill(0);
    const diffStates = infoProps.diff ? this.analyzeDiffLines(codeLines) : [];
    const diffDisplayLineNumbers = infoProps.diff ? this.computeDiffDisplayLineNumbers(diffStates, startLineNum) : [];
    const displayLineNumbers = infoProps.diff ? diffDisplayLineNumbers.map((numbers, index) => numbers.newLine ?? numbers.oldLine ?? startLineNum + index) : codeLines.map((_, index) => startLineNum + index);
    const diffHighlightLineNumbers = infoProps.diff ? this.computeDiffDisplayLineNumbers(diffStates, startLineNum).map(
      (numbers, index) => numbers.newLine ?? numbers.oldLine ?? startLineNum + index
    ) : [];
    const maxOldDiffLineNum = diffDisplayLineNumbers.reduce((max, numbers) => {
      const oldLine = numbers.oldLine ?? 0;
      return oldLine > max ? oldLine : max;
    }, startLineNum);
    const maxNewDiffLineNum = diffDisplayLineNumbers.reduce((max, numbers) => {
      const newLine = numbers.newLine ?? 0;
      return newLine > max ? newLine : max;
    }, startLineNum);
    const diffOldLineNumWidth = Math.max(String(startLineNum).length, String(maxOldDiffLineNum).length);
    const diffNewLineNumWidth = Math.max(String(startLineNum).length, String(maxNewDiffLineNum).length);
    const shouldShowHeader = !cursorInRange && (infoProps.title || infoProps.copy || infoProps.language);
    const shouldShowCaption = !cursorInRange && !!infoProps.caption;
    if (shouldShowHeader) {
      decorations.push(
        Decoration.widget({
          widget: new CodeBlockHeaderWidget(infoProps, codeContent),
          block: false,
          side: -1
        }).range(nodeLineStart.from)
      );
    }
    let codeLineIndex = 0;
    for (let lineNumber = nodeLineStart.number; lineNumber <= nodeLineEnd.number; lineNumber++) {
      const line = view.state.doc.line(lineNumber);
      const isFenceLine = lineNumber === nodeLineStart.number || lineNumber === nodeLineEnd.number;
      const relativeLineNum = displayLineNumbers[codeLineIndex] ?? startLineNum + codeLineIndex;
      decorations.push(codeMarkDecorations["code-block-line"].range(line.from));
      if (lineNumber === nodeLineStart.number) {
        decorations.push(codeMarkDecorations["code-block-line-start"].range(line.from));
        if (shouldShowHeader) {
          decorations.push(Decoration.line({ class: "cm-draftly-code-block-has-header" }).range(line.from));
        }
      }
      if (lineNumber === nodeLineEnd.number) {
        decorations.push(codeMarkDecorations["code-block-line-end"].range(line.from));
        if (shouldShowCaption) {
          decorations.push(Decoration.line({ class: "cm-draftly-code-block-has-caption" }).range(line.from));
        }
      }
      if (!isFenceLine && infoProps.showLineNumbers && !infoProps.diff) {
        decorations.push(
          Decoration.line({
            class: "cm-draftly-code-line-numbered",
            attributes: {
              "data-line-num": String(relativeLineNum),
              style: `--line-num-width: ${lineNumWidth}ch`
            }
          }).range(line.from)
        );
      }
      if (!isFenceLine && infoProps.showLineNumbers && infoProps.diff) {
        const diffLineNumbers = diffDisplayLineNumbers[codeLineIndex];
        const diffState = diffStates[codeLineIndex];
        const diffMarker = diffState?.kind === "addition" ? "+" : diffState?.kind === "deletion" ? "-" : " ";
        decorations.push(
          Decoration.line({
            class: "cm-draftly-code-line-numbered-diff",
            attributes: {
              "data-line-num-old": diffLineNumbers?.oldLine != null ? String(diffLineNumbers.oldLine) : "",
              "data-line-num-new": diffLineNumbers?.newLine != null ? String(diffLineNumbers.newLine) : "",
              "data-diff-marker": diffMarker,
              style: `--line-num-old-width: ${diffOldLineNumWidth}ch; --line-num-new-width: ${diffNewLineNumWidth}ch`
            }
          }).range(line.from)
        );
      }
      if (!isFenceLine && infoProps.diff) {
        this.decorateDiffLine(
          line,
          codeLineIndex,
          diffStates,
          cursorInRange,
          !infoProps.showLineNumbers,
          decorations
        );
      }
      if (!isFenceLine && infoProps.highlightLines) {
        const highlightLineNumber = infoProps.diff ? diffHighlightLineNumbers[codeLineIndex] ?? codeLineIndex + 1 : startLineNum + codeLineIndex;
        if (infoProps.highlightLines.includes(highlightLineNumber)) {
          decorations.push(codeMarkDecorations["code-line-highlight"].range(line.from));
        }
      }
      if (!isFenceLine && infoProps.highlightText?.length) {
        this.decorateTextHighlights(
          line.from,
          view.state.sliceDoc(line.from, line.to),
          infoProps.highlightText,
          highlightInstanceCounters,
          decorations
        );
      }
      if (!isFenceLine) {
        codeLineIndex++;
      }
    }
    this.decorateFenceMarkers(node.node, cursorInRange, decorations);
    if (!cursorInRange && infoProps.caption) {
      decorations.push(
        Decoration.widget({
          widget: new CodeBlockCaptionWidget(infoProps.caption),
          block: false,
          side: 1
        }).range(nodeLineEnd.to)
      );
    }
  }
  decorateFenceMarkers(node, cursorInRange, decorations) {
    for (let child = node.firstChild; child; child = child.nextSibling) {
      if (child.name === "CodeMark" || child.name === "CodeInfo") {
        decorations.push(
          (cursorInRange ? codeMarkDecorations["code-fence"] : codeMarkDecorations["code-hidden"]).range(
            child.from,
            child.to
          )
        );
      }
    }
  }
  decorateDiffLine(line, codeLineIndex, diffStates, cursorInRange, showDiffMarkerGutter, decorations) {
    const diffState = diffStates[codeLineIndex];
    const diffMarker = diffState?.kind === "addition" ? "+" : diffState?.kind === "deletion" ? "-" : " ";
    if (showDiffMarkerGutter) {
      decorations.push(
        Decoration.line({
          class: "cm-draftly-code-line-diff-gutter",
          attributes: {
            "data-diff-marker": diffMarker
          }
        }).range(line.from)
      );
    }
    if (diffState?.kind === "addition") {
      decorations.push(codeMarkDecorations["diff-line-add"].range(line.from));
      if (cursorInRange && line.to > line.from) {
        decorations.push(codeMarkDecorations["diff-sign-add"].range(line.from, line.from + 1));
      }
    }
    if (diffState?.kind === "deletion") {
      decorations.push(codeMarkDecorations["diff-line-del"].range(line.from));
      if (cursorInRange && line.to > line.from) {
        decorations.push(codeMarkDecorations["diff-sign-del"].range(line.from, line.from + 1));
      }
    }
    if (!cursorInRange && line.to > line.from && (diffState?.escapedMarker || diffState?.kind === "addition" || diffState?.kind === "deletion")) {
      decorations.push(codeMarkDecorations["diff-escape-hidden"].range(line.from, line.from + 1));
    }
    if (diffState?.modificationRanges?.length) {
      for (const [start, end] of diffState.modificationRanges) {
        const rangeFrom = line.from + diffState.contentOffset + start;
        const rangeTo = line.from + diffState.contentOffset + end;
        if (rangeTo > rangeFrom) {
          decorations.push(
            (diffState.kind === "addition" ? codeMarkDecorations["diff-mod-add"] : codeMarkDecorations["diff-mod-del"]).range(rangeFrom, rangeTo)
          );
        }
      }
    }
  }
  decorateTextHighlights(lineFrom, lineText, highlights, instanceCounters, decorations) {
    for (const [highlightIndex, textHighlight] of highlights.entries()) {
      try {
        const regex = new RegExp(textHighlight.pattern, "g");
        let match;
        while ((match = regex.exec(lineText)) !== null) {
          instanceCounters[highlightIndex] = (instanceCounters[highlightIndex] ?? 0) + 1;
          const globalMatchIndex = instanceCounters[highlightIndex];
          const shouldHighlight = !textHighlight.instances || textHighlight.instances.includes(globalMatchIndex);
          if (shouldHighlight) {
            const matchFrom = lineFrom + match.index;
            const matchTo = matchFrom + match[0].length;
            decorations.push(codeMarkDecorations["code-text-highlight"].range(matchFrom, matchTo));
          }
        }
      } catch {
      }
    }
  }
  /**
   * Render code elements to HTML for static preview.
   * Applies syntax highlighting using @lezer/highlight.
   */
  async renderToHTML(node, _children, ctx) {
    if (node.name === "CodeMark") {
      return "";
    }
    if (node.name === "InlineCode") {
      let content = ctx.sliceDoc(node.from, node.to);
      const match = content.match(/^`+(.+?)`+$/s);
      if (match && match[1]) {
        content = match[1];
      }
      return `<code class="cm-draftly-code-inline" style="padding: 0.1rem 0.25rem">${this.escapeHtml(content)}</code>`;
    }
    if (node.name === "FencedCode") {
      const content = ctx.sliceDoc(node.from, node.to);
      const lines = content.split("\n");
      const firstLine = lines[0] || "";
      const infoMatch = firstLine.match(/^```(.*)$/);
      const infoString = infoMatch?.[1]?.trim() || "";
      const props = this.parseCodeInfo(infoString);
      const codeLines = lines.slice(1, -1);
      const code = codeLines.join("\n");
      let html = "";
      html += `<div class="cm-draftly-code-container">`;
      const showHeader = props.title || props.copy || props.language;
      if (showHeader) {
        html += `<div class="cm-draftly-code-header">`;
        html += `<div class="cm-draftly-code-header-left">`;
        if (props.title) {
          html += `<span class="cm-draftly-code-header-title">${this.escapeHtml(props.title)}</span>`;
        } else if (props.language) {
          html += `<span class="cm-draftly-code-header-lang">${this.escapeHtml(props.language)}</span>`;
        }
        html += `</div>`;
        if (props.copy !== false) {
          html += `<div class="cm-draftly-code-header-right">`;
          const encodedCode = typeof btoa !== "undefined" ? btoa(encodeURIComponent(code)) : Buffer.from(code).toString("base64");
          html += `<button class="cm-draftly-code-copy-btn" type="button" title="Copy code" data-code="${encodedCode}" data-encoded="true">`;
          html += `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
          html += `</button>`;
          html += `</div>`;
        }
        html += `</div>`;
      }
      const startLineNum = typeof props.showLineNumbers === "number" ? props.showLineNumbers : 1;
      const previewHighlightCounters = new Array(props.highlightText?.length ?? 0).fill(0);
      const diffStates = props.diff ? this.analyzeDiffLines(codeLines) : [];
      const previewDiffLineNumbers = props.diff ? this.computeDiffDisplayLineNumbers(diffStates, startLineNum) : [];
      const previewLineNumbers = props.diff ? previewDiffLineNumbers.map((numbers, index) => numbers.newLine ?? numbers.oldLine ?? startLineNum + index) : codeLines.map((_, index) => startLineNum + index);
      const previewHighlightLineNumbers = props.diff ? this.computeDiffDisplayLineNumbers(diffStates, startLineNum).map(
        (numbers, index) => numbers.newLine ?? numbers.oldLine ?? startLineNum + index
      ) : [];
      const lineNumWidth = String(Math.max(...previewLineNumbers, startLineNum)).length;
      const previewOldLineNumWidth = String(
        Math.max(
          ...previewDiffLineNumbers.map((numbers) => numbers.oldLine ?? 0),
          startLineNum
        )
      ).length;
      const previewNewLineNumWidth = String(
        Math.max(
          ...previewDiffLineNumbers.map((numbers) => numbers.newLine ?? 0),
          startLineNum
        )
      ).length;
      const previewContentLines = props.diff ? diffStates.map((state) => state.content) : codeLines;
      const highlightedLines = await this.highlightCodeLines(
        previewContentLines.join("\n"),
        props.language || "",
        ctx.syntaxHighlighters
      );
      const hasHeader = showHeader ? " cm-draftly-code-block-has-header" : "";
      const hasCaption = props.caption ? " cm-draftly-code-block-has-caption" : "";
      html += `<pre class="cm-draftly-code-block${hasHeader}${hasCaption}"${props.language ? ` data-lang="${this.escapeAttribute(props.language)}"` : ""}>`;
      html += `<code>`;
      codeLines.forEach((line, index) => {
        const lineNum = previewLineNumbers[index] ?? startLineNum + index;
        const highlightLineNumber = props.diff ? previewHighlightLineNumbers[index] ?? startLineNum + index : startLineNum + index;
        const isHighlighted = props.highlightLines?.includes(highlightLineNumber);
        const diffState = props.diff ? diffStates[index] : void 0;
        const diffLineNumbers = props.diff ? previewDiffLineNumbers[index] : void 0;
        const lineClasses = ["cm-draftly-code-line"];
        if (isHighlighted) lineClasses.push("cm-draftly-code-line-highlight");
        if (props.showLineNumbers) {
          lineClasses.push(props.diff ? "cm-draftly-code-line-numbered-diff" : "cm-draftly-code-line-numbered");
        }
        if (diffState?.kind === "addition") lineClasses.push("cm-draftly-code-line-diff-add");
        if (diffState?.kind === "deletion") lineClasses.push("cm-draftly-code-line-diff-del");
        const lineAttrs = [`class="${lineClasses.join(" ")}"`];
        if (props.showLineNumbers && !props.diff) {
          lineAttrs.push(`data-line-num="${lineNum}"`);
          lineAttrs.push(`style="--line-num-width: ${lineNumWidth}ch"`);
        }
        if (props.diff) {
          const diffMarker = diffState?.kind === "addition" ? "+" : diffState?.kind === "deletion" ? "-" : " ";
          if (props.showLineNumbers) {
            lineAttrs.push(`data-line-num-old="${diffLineNumbers?.oldLine != null ? diffLineNumbers.oldLine : ""}"`);
            lineAttrs.push(`data-line-num-new="${diffLineNumbers?.newLine != null ? diffLineNumbers.newLine : ""}"`);
            lineAttrs.push(`data-diff-marker="${diffMarker}"`);
            lineAttrs.push(
              `style="--line-num-old-width: ${previewOldLineNumWidth}ch; --line-num-new-width: ${previewNewLineNumWidth}ch"`
            );
          } else {
            lineAttrs.push(`data-diff-marker="${diffMarker}"`);
            lineClasses.push("cm-draftly-code-line-diff-gutter");
            lineAttrs[0] = `class="${lineClasses.join(" ")}"`;
          }
        }
        const highlightedLine = highlightedLines[index] ?? this.escapeHtml(previewContentLines[index] ?? line);
        let lineContent = highlightedLine;
        if (diffState) {
          lineContent = this.renderDiffPreviewLine(diffState, highlightedLine);
        }
        if (props.highlightText && props.highlightText.length > 0) {
          lineContent = this.applyTextHighlights(lineContent, props.highlightText, previewHighlightCounters);
        }
        html += `<span ${lineAttrs.join(" ")}>${lineContent || " "}</span>`;
      });
      html += `</code></pre>`;
      if (props.caption) {
        html += `<div class="cm-draftly-code-caption">${this.escapeHtml(props.caption)}</div>`;
      }
      html += `</div>`;
      return html;
    }
    if (node.name === "CodeInfo" || node.name === "CodeText") {
      return "";
    }
    return null;
  }
  /** Parse comma-separated numbers and ranges (e.g. "1,3-5") into [1,3,4,5]. */
  parseNumberList(value) {
    const result = [];
    for (const part of value.split(",")) {
      const trimmed = part.trim();
      const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
      if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        for (let i = start; i <= end; i++) {
          result.push(i);
        }
        continue;
      }
      if (/^\d+$/.test(trimmed)) {
        result.push(parseInt(trimmed, 10));
      }
    }
    return result;
  }
  /**
   * Highlight a single line of code using the language's Lezer parser.
   * Falls back to sanitized plain text if the language is not supported.
   */
  async highlightCodeLines(code, lang, syntaxHighlighters) {
    const rawLines = code.split("\n");
    if (!lang || !code) {
      return rawLines.map((line) => this.escapeHtml(line));
    }
    const parser = await this.resolveLanguageParser(lang);
    if (!parser) {
      return rawLines.map((line) => this.escapeHtml(line));
    }
    try {
      const tree = parser.parse(code);
      const highlightedLines = [""];
      highlightCode(
        code,
        tree,
        syntaxHighlighters && syntaxHighlighters.length > 0 ? syntaxHighlighters : [],
        (text, classes2) => {
          const chunk = classes2 ? `<span class="${this.escapeAttribute(classes2)}">${this.escapeHtml(text)}</span>` : this.escapeHtml(text);
          highlightedLines[highlightedLines.length - 1] += chunk;
        },
        () => {
          highlightedLines.push("");
        }
      );
      return rawLines.map((line, index) => highlightedLines[index] || this.escapeHtml(line));
    } catch {
      return rawLines.map((line) => this.escapeHtml(line));
    }
  }
  async resolveLanguageParser(lang) {
    const normalizedLang = this.normalizeLanguage(lang);
    if (!normalizedLang) return null;
    const cached = this.parserCache.get(normalizedLang);
    if (cached) return cached;
    const parserPromise = (async () => {
      const langDesc = LanguageDescription.matchLanguageName(languages, normalizedLang, true);
      if (!langDesc) return null;
      if (langDesc.support) {
        return langDesc.support.language.parser;
      }
      if (typeof langDesc.load === "function") {
        try {
          const support = await langDesc.load();
          return support.language.parser;
        } catch {
          return null;
        }
      }
      return null;
    })();
    this.parserCache.set(normalizedLang, parserPromise);
    return parserPromise;
  }
  normalizeLanguage(lang) {
    const normalized = lang.trim().toLowerCase();
    if (!normalized) return "";
    const normalizedMap = {
      "c++": "cpp",
      "c#": "csharp",
      "f#": "fsharp",
      py: "python",
      js: "javascript",
      ts: "typescript",
      sh: "shell"
    };
    return normalizedMap[normalized] ?? normalized;
  }
  escapeHtml(value) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  escapeAttribute(value) {
    return this.escapeHtml(value).replace(/`/g, "&#96;");
  }
  analyzeDiffLines(lines) {
    const states = lines.map((line) => this.parseDiffLineState(line));
    let index = 0;
    while (index < states.length) {
      if (states[index]?.kind !== "deletion") {
        index++;
        continue;
      }
      const deletionStart = index;
      while (index < states.length && states[index]?.kind === "deletion") {
        index++;
      }
      const deletionEnd = index;
      const additionStart = index;
      while (index < states.length && states[index]?.kind === "addition") {
        index++;
      }
      const additionEnd = index;
      if (additionStart === additionEnd) {
        continue;
      }
      const pairCount = Math.min(deletionEnd - deletionStart, additionEnd - additionStart);
      for (let pairIndex = 0; pairIndex < pairCount; pairIndex++) {
        const deletionState = states[deletionStart + pairIndex];
        const additionState = states[additionStart + pairIndex];
        if (!deletionState || !additionState) {
          continue;
        }
        const ranges = this.computeChangedRanges(deletionState.content, additionState.content);
        if (ranges.oldRanges.length > 0) {
          deletionState.modificationRanges = ranges.oldRanges;
        }
        if (ranges.newRanges.length > 0) {
          additionState.modificationRanges = ranges.newRanges;
        }
      }
    }
    return states;
  }
  computeDiffDisplayLineNumbers(states, startLineNum) {
    const numbers = [];
    let oldLineNumber = startLineNum;
    let newLineNumber = startLineNum;
    for (const state of states) {
      if (state.kind === "deletion") {
        numbers.push({ oldLine: oldLineNumber, newLine: null });
        oldLineNumber++;
        continue;
      }
      if (state.kind === "addition") {
        numbers.push({ oldLine: null, newLine: newLineNumber });
        newLineNumber++;
        continue;
      }
      numbers.push({ oldLine: oldLineNumber, newLine: newLineNumber });
      oldLineNumber++;
      newLineNumber++;
    }
    return numbers;
  }
  parseDiffLineState(line) {
    const escapedMarker = line.startsWith("\\+") || line.startsWith("\\-");
    if (escapedMarker) {
      return {
        kind: "normal",
        content: line.slice(1),
        contentOffset: 1,
        escapedMarker: true
      };
    }
    if (line.startsWith("+")) {
      return {
        kind: "addition",
        content: line.slice(1),
        contentOffset: 1,
        escapedMarker: false
      };
    }
    if (line.startsWith("-")) {
      return {
        kind: "deletion",
        content: line.slice(1),
        contentOffset: 1,
        escapedMarker: false
      };
    }
    return {
      kind: "normal",
      content: line,
      contentOffset: 0,
      escapedMarker: false
    };
  }
  computeChangedRanges(oldText, newText) {
    let prefix = 0;
    while (prefix < oldText.length && prefix < newText.length && oldText[prefix] === newText[prefix]) {
      prefix++;
    }
    let oldSuffix = oldText.length;
    let newSuffix = newText.length;
    while (oldSuffix > prefix && newSuffix > prefix && oldText[oldSuffix - 1] === newText[newSuffix - 1]) {
      oldSuffix--;
      newSuffix--;
    }
    const oldRanges = [];
    const newRanges = [];
    if (oldSuffix > prefix) {
      oldRanges.push([prefix, oldSuffix]);
    }
    if (newSuffix > prefix) {
      newRanges.push([prefix, newSuffix]);
    }
    return { oldRanges, newRanges };
  }
  renderDiffPreviewLine(diffState, highlightedContent) {
    const modClass = diffState.kind === "addition" ? "cm-draftly-code-diff-mod-add" : diffState.kind === "deletion" ? "cm-draftly-code-diff-mod-del" : "";
    const baseHighlightedContent = highlightedContent || this.escapeHtml(diffState.content);
    const contentHtml = diffState.modificationRanges && modClass ? this.applyRangesToHighlightedHTML(baseHighlightedContent, diffState.modificationRanges, modClass) : baseHighlightedContent;
    return contentHtml || " ";
  }
  applyRangesToHighlightedHTML(htmlContent, ranges, className) {
    const normalizedRanges = ranges.map(([start, end]) => [Math.max(0, start), Math.max(0, end)]).filter(([start, end]) => end > start).sort((a, b) => a[0] - b[0]);
    if (normalizedRanges.length === 0 || !htmlContent) {
      return htmlContent;
    }
    const isInsideRange = (position) => {
      for (const [start, end] of normalizedRanges) {
        if (position >= start && position < end) return true;
        if (position < start) return false;
      }
      return false;
    };
    let result = "";
    let htmlIndex = 0;
    let textPosition = 0;
    let markOpen = false;
    while (htmlIndex < htmlContent.length) {
      const char = htmlContent[htmlIndex];
      if (char === "<") {
        const tagEnd = htmlContent.indexOf(">", htmlIndex);
        if (tagEnd === -1) {
          result += htmlContent.slice(htmlIndex);
          break;
        }
        result += htmlContent.slice(htmlIndex, tagEnd + 1);
        htmlIndex = tagEnd + 1;
        continue;
      }
      let token = char;
      if (char === "&") {
        const entityEnd = htmlContent.indexOf(";", htmlIndex);
        if (entityEnd !== -1) {
          token = htmlContent.slice(htmlIndex, entityEnd + 1);
          htmlIndex = entityEnd + 1;
        } else {
          htmlIndex += 1;
        }
      } else {
        htmlIndex += 1;
      }
      const shouldMark = isInsideRange(textPosition);
      if (shouldMark && !markOpen) {
        result += `<mark class="${className}">`;
        markOpen = true;
      }
      if (!shouldMark && markOpen) {
        result += "</mark>";
        markOpen = false;
      }
      result += token;
      textPosition += 1;
    }
    if (markOpen) {
      result += "</mark>";
    }
    return result;
  }
  /**
   * Apply text highlights (regex patterns) to already syntax-highlighted HTML.
   * Wraps matched patterns in `<mark>` elements.
   */
  applyTextHighlights(htmlContent, highlights, instanceCounters) {
    let result = htmlContent;
    for (const [highlightIndex, highlight] of highlights.entries()) {
      try {
        const regex = new RegExp(`(${highlight.pattern})`, "g");
        let matchCount = instanceCounters?.[highlightIndex] ?? 0;
        result = result.replace(regex, (match) => {
          matchCount++;
          const shouldHighlight = !highlight.instances || highlight.instances.includes(matchCount);
          if (shouldHighlight) {
            return `<mark class="cm-draftly-code-text-highlight">${match}</mark>`;
          }
          return match;
        });
        if (instanceCounters) {
          instanceCounters[highlightIndex] = matchCount;
        }
      } catch {
      }
    }
    return result;
  }
};
var quoteMarkDecorations = {
  /** Decoration for the > marker */
  "quote-mark": Decoration.replace({}),
  /** Decoration for the quote content */
  "quote-content": Decoration.mark({ class: "cm-draftly-quote-content" })
};
var quoteLineDecorations = {
  /** Decoration for blockquote lines */
  "quote-line": Decoration.line({ class: "cm-draftly-quote-line" })
};
var QuotePlugin = class extends DecorationPlugin {
  name = "quote";
  version = "1.0.0";
  decorationPriority = 10;
  requiredNodes = ["Blockquote", "QuoteMark"];
  /**
   * Constructor - calls super constructor
   */
  constructor() {
    super();
  }
  /**
   * Plugin theme
   */
  get theme() {
    return theme11;
  }
  /**
   * Build blockquote decorations by iterating the syntax tree
   */
  buildDecorations(ctx) {
    const { view, decorations } = ctx;
    const tree = syntaxTree(view.state);
    tree.iterate({
      enter: (node) => {
        const { from, to, name } = node;
        if (name !== "Blockquote") {
          return;
        }
        const startLine = view.state.doc.lineAt(from);
        const endLine = view.state.doc.lineAt(to);
        for (let lineNum = startLine.number; lineNum <= endLine.number; lineNum++) {
          const line = view.state.doc.line(lineNum);
          decorations.push(quoteLineDecorations["quote-line"].range(line.from));
        }
        decorations.push(quoteMarkDecorations["quote-content"].range(from, to));
        const cursorInNode = ctx.selectionOverlapsRange(from, to);
        if (!cursorInNode) {
          this.hideQuoteMarks(node.node, decorations, view);
        }
      }
    });
  }
  /**
   * Recursively find and hide quote marks
   */
  hideQuoteMarks(node, decorations, view) {
    let child = node.firstChild;
    while (child) {
      if (child.name === "QuoteMark") {
        const line = view.state.doc.lineAt(child.from);
        const markEnd = Math.min(child.to + 1, line.to);
        decorations.push(quoteMarkDecorations["quote-mark"].range(child.from, markEnd));
      }
      if (child.name === "Blockquote") {
        this.hideQuoteMarks(child, decorations, view);
      }
      child = child.nextSibling;
    }
  }
  renderToHTML(node, children) {
    if (node.name === "QuoteMark") {
      return "";
    }
    if (node.name !== "Blockquote") {
      return null;
    }
    return `<blockquote class="cm-draftly-quote-line"><div class="cm-draftly-quote-content">${children}</div></blockquote>
`;
  }
};
var theme11 = createTheme({
  default: {
    // Line styling with left border
    ".cm-draftly-quote-line": {
      borderLeft: "3px solid currentColor",
      paddingLeft: "1em !important",
      paddingTop: "0.25em !important",
      paddingBottom: "0.25em !important",
      marginLeft: "0.25em",
      opacity: "0.85"
    },
    // Quote content styling
    ".cm-draftly-quote-content": {
      fontStyle: "italic"
    }
  }
});
var hrLineDecoration = Decoration.line({ class: "cm-draftly-hr-line" });
var hrMarkDecoration = Decoration.replace({});
var HRPlugin = class extends DecorationPlugin {
  name = "hr";
  version = "1.0.0";
  decorationPriority = 10;
  requiredNodes = ["HorizontalRule"];
  /**
   * Constructor - calls super constructor
   */
  constructor() {
    super();
  }
  /**
   * Plugin theme
   */
  get theme() {
    return theme12;
  }
  /**
   * Build horizontal rule decorations by iterating the syntax tree
   */
  buildDecorations(ctx) {
    const { view, decorations } = ctx;
    const tree = syntaxTree(view.state);
    tree.iterate({
      enter: (node) => {
        const { from, to, name } = node;
        if (name !== "HorizontalRule") {
          return;
        }
        const line = view.state.doc.lineAt(from);
        decorations.push(hrLineDecoration.range(line.from));
        const cursorInNode = ctx.selectionOverlapsRange(from, to);
        if (!cursorInNode) {
          const markEnd = Math.min(to, line.to);
          decorations.push(hrMarkDecoration.range(from, markEnd));
        }
      }
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  renderToHTML(node, _children) {
    if (node.name !== "HorizontalRule") {
      return null;
    }
    return `<hr class="cm-draftly-hr-line" />
`;
  }
};
var theme12 = createTheme({
  default: {
    // Line styling — displays a centered horizontal line
    ".cm-draftly-hr-line": {
      display: "flex",
      alignItems: "center",
      paddingTop: "0.75em",
      paddingBottom: "0.75em",
      border: "none",
      "&::after": {
        content: '""',
        flex: "1",
        height: "2px",
        background: "currentColor",
        opacity: "0.3"
      }
    }
  }
});
function shortcodeToEmoji(raw) {
  const rendered = emoji.emojify(raw);
  return rendered !== raw ? rendered : null;
}
var EmojiWidget = class extends WidgetType {
  constructor(rendered) {
    super();
    this.rendered = rendered;
  }
  eq(other) {
    return other.rendered === this.rendered;
  }
  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-draftly-emoji";
    span.textContent = this.rendered;
    return span;
  }
  ignoreEvent() {
    return false;
  }
};
var emojiMarkDecorations = {
  "emoji-source": Decoration.mark({ class: "cm-draftly-emoji-source" })
};
var EmojiPlugin = class extends DecorationPlugin {
  name = "emoji";
  version = "1.0.0";
  decorationPriority = 20;
  requiredNodes = ["Emoji", "EmojiMark"];
  constructor() {
    super();
  }
  /**
   * Plugin theme
   */
  get theme() {
    return theme13;
  }
  /**
   * Build emoji decorations by iterating the syntax tree
   */
  buildDecorations(ctx) {
    const { view, decorations } = ctx;
    const tree = syntaxTree(view.state);
    tree.iterate({
      enter: (node) => {
        const { from, to, name } = node;
        if (name !== "Emoji") {
          return;
        }
        const raw = view.state.sliceDoc(from, to);
        const rendered = shortcodeToEmoji(raw);
        if (!rendered) {
          return;
        }
        const cursorInNode = ctx.selectionOverlapsRange(from, to);
        if (cursorInNode) {
          decorations.push(emojiMarkDecorations["emoji-source"].range(from, to));
          return;
        }
        decorations.push(
          Decoration.replace({
            widget: new EmojiWidget(rendered)
          }).range(from, to)
        );
      }
    });
  }
  renderToHTML(node, children, ctx) {
    if (node.name === "EmojiMark") {
      return "";
    }
    if (node.name !== "Emoji") {
      return null;
    }
    const raw = ctx.sliceDoc(node.from, node.to);
    const rendered = shortcodeToEmoji(raw);
    if (!rendered) {
      return `<span class="cm-draftly-emoji-source">${children}</span>`;
    }
    return `<span class="cm-draftly-emoji">${rendered}</span>`;
  }
};
var theme13 = createTheme({
  default: {
    ".cm-draftly-emoji": {
      fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif',
      fontVariantEmoji: "emoji",
      lineHeight: "1.2"
    },
    ".cm-draftly-emoji-source": {
      fontFamily: "inherit",
      lineHeight: "inherit"
    }
  }
});

// src/plugins/index.ts
var essentialPlugins = [
  new ParagraphPlugin(),
  new HeadingPlugin(),
  new InlinePlugin(),
  new LinkPlugin(),
  new ListPlugin(),
  new TablePlugin(),
  new HTMLPlugin(),
  new ImagePlugin(),
  new MathPlugin(),
  new MermaidPlugin(),
  new CodePlugin(),
  new QuotePlugin(),
  new HRPlugin(),
  new EmojiPlugin()
];
var allPlugins = [...essentialPlugins];

export { CodePlugin, EmojiPlugin, HRPlugin, HTMLPlugin, HeadingPlugin, ImagePlugin, InlinePlugin, LinkPlugin, ListPlugin, MathPlugin, MermaidPlugin, ParagraphPlugin, QuotePlugin, TablePlugin, allPlugins, essentialPlugins };
//# sourceMappingURL=chunk-G2FKUGV7.js.map
//# sourceMappingURL=chunk-G2FKUGV7.js.map