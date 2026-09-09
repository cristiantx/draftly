import { Decoration } from "@codemirror/view";
import { type DecorationContext, DecorationPlugin } from "../editor/plugin";
import { createTheme, ThemeEnum } from "../editor";
import type { SyntaxNode } from "@lezer/common";
import { tags } from "@lezer/highlight";
import type { MarkdownConfig, BlockParser, Line, BlockContext } from "@lezer/markdown";
import { createMermaidBlocks } from "./mermaid/blocks";
import { parseAttributes, renderMermaid } from "./mermaid/render";

/**
 * Mark decorations for mermaid syntax elements
 */
const mermaidMarkDecorations = {
  "mermaid-block-start": Decoration.line({ class: "cm-draftly-mermaid-block-start" }),
  "mermaid-block-end": Decoration.line({ class: "cm-draftly-mermaid-block-end" }),
  "mermaid-block": Decoration.line({ class: "cm-draftly-mermaid-block" }),
  "mermaid-block-rendered": Decoration.line({ class: "cm-draftly-mermaid-block-rendered" }),
  "mermaid-marker": Decoration.mark({ class: "cm-draftly-mermaid-marker" }),
  "mermaid-hidden": Decoration.mark({ class: "cm-draftly-mermaid-hidden" }),
};

/**
 * Block parser for mermaid blocks:
 * ```mermaid
 * graph TD
 *   A --> B
 * ```
 */
const mermaidBlockParser: BlockParser = {
  name: "MermaidBlock",
  before: "FencedCode",
  parse(cx: BlockContext, line: Line) {
    const text = line.text;
    const trimmed = text.slice(line.pos).trimStart();

    // Must start with ```mermaid
    if (!trimmed.startsWith("```mermaid")) return false;

    // Ensure nothing meaningful after ```mermaid (allow trailing whitespace)
    // We now allow attributes, so we don't strictly check for empty rest
    // const rest = trimmed.slice(10);
    // if (rest.trim().length > 0) return false;

    const startLine = cx.lineStart;
    let endPos = -1;
    let closeBacktickStart = -1;

    // Move past the opening line and find the closing ```
    while (cx.nextLine()) {
      const currentText = line.text;
      const currentLineStart = cx.lineStart;
      const lastLineEnd = currentLineStart + currentText.length;

      // Check if this line is a closing ``` (only backticks, possibly with whitespace)
      const trimmedLine = currentText.trim();
      if (trimmedLine === "```") {
        endPos = lastLineEnd;
        closeBacktickStart = currentLineStart + currentText.indexOf("```");
        // Move past the closing line so subsequent markdown gets parsed
        cx.nextLine();
        break;
      }
    }

    if (endPos === -1) {
      // No closing found, treat as regular text
      return false;
    }

    // Create the mermaid block element with markers
    const openMarkEnd = startLine + text.indexOf("```mermaid") + 10;
    const openMark = cx.elt("MermaidBlockMark", startLine, openMarkEnd);
    const closeMark = cx.elt("MermaidBlockMark", closeBacktickStart, closeBacktickStart + 3);

    cx.addElement(cx.elt("MermaidBlock", startLine, endPos, [openMark, closeMark]));

    return true;
  },
};

/**
 * MermaidPlugin - Renders mermaid diagrams in the editor
 *
 * Supports block mermaid syntax:
 *   ```mermaid
 *   graph TD
 *     A --> B
 *   ```
 *
 * Behavior:
 * - Always show rendered diagram below the block
 * - Hide raw definition when cursor is outside the block
 * - Show raw definition with styled markers when cursor is inside
 */
/** Host choice when activating a rendered diagram; legacy selection is the default. */
export interface MermaidPluginOptions {
  /** Select the whole source or place a caret at the start of the diagram body. */
  activation?: "select" | "caret";
}

/** Renders Mermaid source using measured block decorations. */
export class MermaidPlugin extends DecorationPlugin {
  readonly name = "mermaid";
  readonly version = "1.0.0";
  override decorationPriority = 25;
  override readonly requiredNodes = ["MermaidBlock", "MermaidBlockMark"] as const;

  constructor(private readonly options: MermaidPluginOptions = {}) {
    super();
  }

  /** Supplies height-changing decorations before CodeMirror calculates its viewport. */
  override getExtensions() {
    return [createMermaidBlocks(this.options.activation ?? "select")];
  }

  /**
   * Plugin theme
   */
  override get theme() {
    return theme;
  }

  /**
   * Return markdown parser extensions for mermaid syntax
   */
  override getMarkdownConfig(): MarkdownConfig {
    return {
      defineNodes: [
        { name: "MermaidBlock", block: true },
        { name: "MermaidBlockMark", style: tags.processingInstruction },
      ],
      parseBlock: [mermaidBlockParser],
    };
  }

  /**
   * Build decorations for mermaid blocks
   */
  buildDecorations(ctx: DecorationContext): void {
    const { view, decorations } = ctx;
    // Scoped to the viewport: an unbounded walk makes every update -- including a
    // plain cursor move -- cost O(document). See DecorationContext.iterateVisible.
    ctx.iterateVisible({
      enter: (node) => {
        const { from, to, name } = node;

        if (name === "MermaidBlock") {
          const nodeLineStart = view.state.doc.lineAt(from);
          const nodeLineEnd = view.state.doc.lineAt(to);
          const cursorInRange = ctx.selectionOverlapsRange(nodeLineStart.from, nodeLineEnd.to);
          if (!cursorInRange) return false;

          // Calculate line number width for mermaid block
          const totalCodeLines = nodeLineEnd.number - nodeLineStart.number - 1;
          const lineNumWidth = String(totalCodeLines).length;
          let codeLineIndex = 1;

          // Add line decorations for mermaid block
          for (let i = nodeLineStart.number; i <= nodeLineEnd.number; i++) {
            const line = view.state.doc.line(i);
            const isFenceLine = i === nodeLineStart.number || i === nodeLineEnd.number;
            const relativeLineNum = codeLineIndex;

            decorations.push(mermaidMarkDecorations["mermaid-block"].range(line.from));

            if (i === nodeLineStart.number)
              decorations.push(mermaidMarkDecorations["mermaid-block-start"].range(line.from));

            if (i === nodeLineEnd.number)
              decorations.push(mermaidMarkDecorations["mermaid-block-end"].range(line.from));

            if (!isFenceLine) {
              decorations.push(
                Decoration.line({
                  attributes: {
                    "data-line-num": String(relativeLineNum),
                    style: `--line-num-width: ${lineNumWidth}ch`,
                  },
                }).range(line.from)
              );
            }

            // Increment code line index (only for non-fence lines)
            if (!isFenceLine) {
              codeLineIndex++;
            }
          }

          if (cursorInRange) {
            // Cursor in range: show raw definition with styled markers
            for (let child = node.node.firstChild; child; child = child.nextSibling) {
              if (child.name === "MermaidBlockMark") {
                decorations.push(mermaidMarkDecorations["mermaid-marker"].range(child.from, child.to));
              }
            }
          }
        }
      },
    });
  }

  /**
   * Render mermaid to HTML for preview mode
   *
   * Renders the actual mermaid diagram to SVG HTML
   */
  override async renderToHTML(
    node: SyntaxNode,
    _children: string,
    ctx: { sliceDoc(from: number, to: number): string; sanitize(html: string): string }
  ): Promise<string | null> {
    if (node.name === "MermaidBlock") {
      const content = ctx.sliceDoc(node.from, node.to);
      const lines = content.split("\n");
      const definition = lines.length > 1 ? lines.slice(1, -1).join("\n").trim() : "";

      const fenceLine = lines[0] || "";
      const attributes = parseAttributes(fenceLine);

      const config = this.context?.config;
      const currentTheme = config?.theme === ThemeEnum.DARK ? "dark" : "default";

      const { svg, error } = await renderMermaid(definition, attributes, currentTheme);

      if (error) {
        return `<div class="cm-draftly-mermaid-error">${ctx.sanitize(`[Mermaid Error: ${error}]`)}</div>`;
      }

      return `<div class="cm-draftly-mermaid-rendered">${svg}</div>`;
    }

    // Hide mermaid markers in preview
    if (node.name === "MermaidBlockMark") {
      return "";
    }

    return null;
  }
}

/**
 * Theme for mermaid styling
 */
const theme = createTheme({
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
      borderRight: "1px solid var(--draftly-color-border)",
    },

    ".cm-draftly-mermaid-block-start:not(.cm-draftly-mermaid-block-rendered)": {
      overflow: "hidden",
      borderTopLeftRadius: "var(--radius)",
      borderTopRightRadius: "var(--radius)",
      borderTop: "1px solid var(--draftly-color-border)",
    },

    ".cm-draftly-mermaid-block-end:not(.cm-draftly-mermaid-block-rendered)": {
      overflow: "hidden",
      borderBottomLeftRadius: "var(--radius)",
      borderBottomRightRadius: "var(--radius)",
      borderBottom: "1px solid var(--draftly-color-border)",
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
      userSelect: "none",
    },

    ".cm-draftly-mermaid-block.cm-draftly-mermaid-block-rendered br": {
      display: "none",
    },

    // Mermaid markers (```mermaid / ```)
    ".cm-draftly-mermaid-marker": {
      color: "var(--draftly-color-muted)",
      fontFamily: "var(--draftly-font-mono)",
    },

    // Hidden mermaid syntax (when cursor is not in range)
    ".cm-draftly-mermaid-hidden": {
      display: "none",
    },

    // Rendered mermaid container
    ".cm-draftly-mermaid-rendered": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "1em 0",
      borderRadius: "4px",
      overflow: "auto",
    },

    // SVG inside rendered container
    ".cm-draftly-mermaid-rendered svg": {
      maxWidth: "100%",
      height: "auto",
      aspectRatio: "auto",
    },

    // Loading state
    ".cm-draftly-mermaid-loading": {
      display: "inline-block",
      padding: "0.5em 1em",
      color: "var(--draftly-color-muted)",
      fontSize: "0.875em",
      fontStyle: "italic",
      fontFamily: "var(--draftly-font-mono)",
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
      fontFamily: "var(--draftly-font-mono)",
    },
  },
});
