import { d as DraftlyPlugin, T as ThemeEnum, f as ThemeStyle, a as DecorationPlugin, D as DecorationContext, e as PluginContext } from '../draftly-BBL-AdOl.js';
import { SyntaxNode } from '@lezer/common';
import { Extension } from '@codemirror/state';
import * as _codemirror_view from '@codemirror/view';
import { KeyBinding, EditorView } from '@codemirror/view';
import { MarkdownConfig } from '@lezer/markdown';
import * as _lezer_highlight from '@lezer/highlight';
import { Highlighter } from '@lezer/highlight';
import 'style-mod';

/**
 * ParagraphPlugin - Adds top and bottom padding to paragraphs in preview
 *
 * Applies visual spacing to markdown paragraphs for better readability
 */
declare class ParagraphPlugin extends DraftlyPlugin {
    readonly name = "paragraph";
    readonly version = "1.0.0";
    readonly requiredNodes: readonly ["Paragraph"];
    /**
     * Plugin theme for preview styling
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    renderToHTML(node: SyntaxNode, children: string): string | null;
}

/**
 * HeadingPlugin - Decorates markdown headings
 *
 * Adds visual styling to ATX headings (# through ######)
 * - Line decorations for the entire heading line
 * - Mark decorations for heading content
 * - Hides # markers when cursor is not in the heading
 */
declare class HeadingPlugin extends DecorationPlugin {
    readonly name = "heading";
    readonly version = "1.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["ATXHeading1", "ATXHeading2", "ATXHeading3", "ATXHeading4", "ATXHeading5", "ATXHeading6", "HeaderMark"];
    /**
     * Constructor - calls super constructor
     */
    constructor();
    /**
     * Plugin theme
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /**
     * Build heading decorations by iterating the syntax tree
     */
    buildDecorations(ctx: DecorationContext): void;
    renderToHTML(node: SyntaxNode, children: string): string | null;
}

/**
 * InlinePlugin - Decorates inline markdown formatting
 *
 * Adds visual styling to inline elements:
 * - Emphasis (italic) - *text* or _text_
 * - Strong (bold) - **text** or __text__
 * - Strikethrough - ~~text~~
 * - Subscript - ~text~
 * - Superscript - ^text^
 * - Highlight - ==text==
 *
 * Hides formatting markers when cursor is not in the element
 */
declare class InlinePlugin extends DecorationPlugin {
    readonly name = "inline";
    readonly version = "1.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["Emphasis", "StrongEmphasis", "Strikethrough", "Subscript", "Superscript", "Highlight", "EmphasisMark", "StrikethroughMark", "SubscriptMark", "SuperscriptMark", "HighlightMark"];
    marks: string[];
    constructor();
    /**
     * Plugin theme
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /**
     * Keyboard shortcuts for inline formatting
     */
    getKeymap(): KeyBinding[];
    /**
     * Intercepts inline marker typing to wrap selected text.
     *
     * If user types inline markers while text is selected, wraps each selected
     * range with the appropriate marker:
     * - * _ ~ ^ -> marker + selected + marker
     * - = -> ==selected==
     */
    getExtensions(): Extension[];
    /**
     * Return markdown parser extensions for highlight syntax (==text==)
     */
    getMarkdownConfig(): MarkdownConfig;
    /**
     * Build inline decorations by iterating the syntax tree
     */
    buildDecorations(ctx: DecorationContext): void;
    /**
     * Get the marker node names for a given inline type
     */
    private getMarkerNames;
    renderToHTML(node: SyntaxNode, children: string): string | null;
}

/**
 * LinkPlugin - Decorates and provides interactivity for markdown links
 *
 * Supports the full link syntax: [text](url) and [text](url "title")
 * - Click: reveals raw markdown (selects/focuses the link syntax)
 * - Ctrl+Click: opens the link URL in a new browser tab
 * - Hover: shows tooltip with the link URL
 * - Hides the markdown syntax when cursor is not in range
 * - Shows raw markdown when cursor is within the link range
 */
declare class LinkPlugin extends DecorationPlugin {
    readonly name = "link";
    readonly version = "1.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["Link"];
    constructor();
    /**
     * Plugin theme
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /**
     * Keyboard shortcuts for link formatting
     */
    getKeymap(): KeyBinding[];
    /**
     * URL regex pattern
     */
    private readonly urlPattern;
    /**
     * Toggle link on selection
     * - If text is selected and is a URL: [](url) with cursor in brackets
     * - If text is selected (not URL): [text]() with cursor in parentheses
     * - If nothing selected: []() with cursor in brackets
     * - If already a link: remove syntax, leave plain text
     */
    private toggleLink;
    buildDecorations(ctx: DecorationContext): void;
    /**
     * Decorate raw link markdown when cursor is in range
     */
    private decorateRawLink;
    /**
     * Render link to HTML for preview mode
     */
    renderToHTML(node: SyntaxNode, _children: string, ctx: {
        sliceDoc(from: number, to: number): string;
        sanitize(html: string): string;
    }): string | null;
}

/**
 * Decorates markdown lists with custom styling.
 *
 * Supports:
 * - **Unordered lists** — Replaces `*`, `-`, `+` markers with styled bullets
 * - **Ordered lists** — Styles numbered markers (`1.`, `2.`, etc.)
 * - **Task lists** — Renders `[ ]`/`[x]` as interactive checkboxes
 */
declare class ListPlugin extends DecorationPlugin {
    readonly name = "list";
    readonly version = "1.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["BulletList", "OrderedList", "ListItem", "ListMark", "Task", "TaskMarker"];
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /**
     * Keyboard shortcuts for list formatting
     */
    getKeymap(): KeyBinding[];
    /**
     * Toggle list marker on current line or selected lines
     */
    private toggleListOnLines;
    buildDecorations(ctx: DecorationContext): void;
    /** Add line decoration for list items with nesting depth */
    private decorateListItem;
    /** Check if a ListItem node has a Task child */
    private hasTaskChild;
    /** Decorate list markers (bullets for UL, numbers for OL) */
    private decorateListMark;
    /** Decorate task markers - show checkbox widget or raw text based on cursor */
    private decorateTaskMarker;
    /** Render list nodes to HTML */
    renderToHTML(node: SyntaxNode, children: string, ctx: {
        sliceDoc(from: number, to: number): string;
        sanitize(html: string): string;
    }): string | null;
}

interface PreviewContextLike {
    sliceDoc(from: number, to: number): string;
    sanitize(html: string): string;
}
declare class TablePlugin extends DecorationPlugin {
    readonly name = "table";
    readonly version = "2.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["Table", "TableHeader", "TableDelimiter", "TableRow", "TableCell"];
    private draftlyConfig;
    private pendingNormalizationView;
    private pendingPaddingView;
    private pendingSelectionRepairView;
    /** Stores the editor config for preview rendering and shared behavior. */
    onRegister(context: PluginContext): void;
    /** Exposes the plugin theme used for editor and preview styling. */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /** Enables GFM table parsing for the editor and preview renderer. */
    getMarkdownConfig(): MarkdownConfig;
    /** Registers block wrappers and atomic ranges for the table UI. */
    getExtensions(): Extension[];
    /** Provides the table-specific keyboard shortcuts and navigation. */
    getKeymap(): KeyBinding[];
    /** Builds the high-priority key bindings used inside tables. */
    private buildTableKeymap;
    /** Schedules an initial normalization pass once the view is ready. */
    onViewReady(view: EditorView): void;
    /** Re-schedules normalization after user-driven document changes. */
    onViewUpdate(update: _codemirror_view.ViewUpdate): void;
    /** Intercepts table-specific DOM key handling before browser defaults run. */
    private handleDomKeydown;
    /** Builds the visual table decorations for every parsed table block. */
    buildDecorations(ctx: DecorationContext): void;
    /** Renders the full table node to semantic preview HTML. */
    renderToHTML(node: SyntaxNode, _children: string, ctx: PreviewContextLike): Promise<string | null>;
    /** Computes the block wrapper ranges used to group table lines. */
    private computeBlockWrappers;
    /** Computes atomic ranges for delimiters and inline break tags. */
    private computeAtomicRanges;
    /** Applies row, cell, and control decorations for a single table. */
    private decorateTable;
    /** Applies the visual cell decorations for a single table row line. */
    private decorateLine;
    /** Normalizes every parsed table block back into canonical markdown. */
    private normalizeTables;
    /** Defers table normalization until the current update cycle is finished. */
    private scheduleNormalization;
    /** Adds missing spacer lines above and below tables after edits. */
    private ensureTablePadding;
    /** Schedules a padding-only pass after the current update cycle finishes. */
    private schedulePadding;
    /** Repairs carets that land in hidden table markup instead of editable cell content. */
    private ensureTableSelection;
    /** Schedules table selection repair after the current update finishes. */
    private scheduleSelectionRepair;
    /** Rewrites a table block and restores the caret to a target cell position. */
    private replaceTable;
    /** Inserts an empty body row below the given logical row index. */
    private insertRowBelow;
    /** Inserts a starter table near the current cursor line. */
    private insertTable;
    /** Adds a new empty body row to the active table. */
    private addRow;
    /** Appends a row and keeps the caret in the requested column. */
    private appendRow;
    /** Inserts a new column after the current column. */
    private addColumn;
    /** Appends a new column at the far right of the table. */
    private appendColumn;
    /** Removes the current body row or clears the last remaining row. */
    private removeRow;
    /** Removes the current column when the table has more than one column. */
    private removeColumn;
    /** Moves to the next or previous logical cell with Tab navigation. */
    private handleTab;
    /** Moves horizontally between adjacent cells when the caret hits an edge. */
    private handleArrowHorizontal;
    /** Moves vertically between rows while keeping the current column. */
    private handleArrowVertical;
    /** Advances downward on Enter and manages the trailing empty row behavior. */
    private handleEnter;
    /** Inserts a canonical `<br />` token inside the current table cell. */
    private insertBreakTag;
    /** Deletes a whole `<br />` token when backspace or delete hits it. */
    private handleBreakDeletion;
    /** Moves the current selection anchor into a target cell. */
    private moveSelectionToCell;
    /** Returns the table currently containing the editor cursor. */
    private getTableAtCursor;
    /** Returns the active cell under the current selection head. */
    private getCurrentCell;
}

/**
 * HTMLPlugin - Decorates and Renders HTML in markdown
 */
declare class HTMLPlugin extends DecorationPlugin {
    readonly name = "html";
    readonly version = "1.0.0";
    decorationPriority: number;
    constructor();
    /**
     * Plugin theme
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    buildDecorations(ctx: DecorationContext): void;
}

/**
 * ImagePlugin - Decorates and renders images in markdown
 *
 * Supports the full image syntax: ![alt text](url "optional title")
 * - Shows image widget below the node when cursor is not in range
 * - Hides the markdown syntax when cursor is not in range
 * - Shows raw markdown when cursor is in the image syntax
 * - Uses figure/figcaption for semantic HTML with accessibility attributes
 */
declare class ImagePlugin extends DecorationPlugin {
    readonly name = "image";
    readonly version = "1.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["Image"];
    constructor();
    /**
     * Plugin theme
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /**
     * Keyboard shortcuts for image formatting
     */
    getKeymap(): KeyBinding[];
    /**
     * URL regex pattern
     */
    private readonly urlPattern;
    /**
     * Toggle image on selection
     * - If text selected and is a URL: ![Alt Text](url) with cursor in brackets
     * - If text selected (not URL): ![text]() with cursor in parentheses
     * - If nothing selected: ![Alt Text]() with cursor in parentheses
     * - If already an image: remove syntax, leave just the URL
     */
    private toggleImage;
    buildDecorations(ctx: DecorationContext): void;
    /**
     * Decorate raw image markdown when cursor is in range
     */
    private decorateRawImage;
    /**
     * Render image to HTML for preview mode using figure/figcaption
     */
    renderToHTML(node: SyntaxNode, _children: string, ctx: {
        sliceDoc(from: number, to: number): string;
        sanitize(html: string): string;
    }): string | null;
}

/**
 * MathPlugin - Renders LaTeX math expressions using KaTeX
 *
 * Supports:
 * - Inline math: $E = mc^2$
 * - Block math (display mode):
 *   $$
 *   \int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
 *   $$
 *
 * Behavior:
 * - Inline math: Show rendered output when cursor outside, raw LaTeX when inside
 * - Block math: Always show rendered output below, hide raw when cursor outside (like ImagePlugin)
 */
declare class MathPlugin extends DecorationPlugin {
    readonly name = "math";
    readonly version = "1.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["InlineMath", "MathBlock", "InlineMathMark", "MathBlockMark"];
    constructor();
    /**
     * Plugin theme
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /**
     * Intercepts dollar typing to wrap selected text as inline math.
     *
     * If user types '$' while text is selected, wraps each selected range
     * with single dollars (selected -> $selected$).
     */
    getExtensions(): Extension[];
    /**
     * Return markdown parser extensions for math syntax
     */
    getMarkdownConfig(): MarkdownConfig;
    /**
     * Build decorations for math expressions
     */
    buildDecorations(ctx: DecorationContext): void;
    /**
     * Render math to HTML for preview mode
     */
    renderToHTML(node: SyntaxNode, _children: string, ctx: {
        sliceDoc(from: number, to: number): string;
        sanitize(html: string): string;
    }): string | null;
}

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
declare class MermaidPlugin extends DecorationPlugin {
    readonly name = "mermaid";
    readonly version = "1.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["MermaidBlock", "MermaidBlockMark"];
    constructor();
    /**
     * Plugin theme
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /**
     * Return markdown parser extensions for mermaid syntax
     */
    getMarkdownConfig(): MarkdownConfig;
    /**
     * Build decorations for mermaid blocks
     */
    buildDecorations(ctx: DecorationContext): void;
    /**
     * Render mermaid to HTML for preview mode
     *
     * Renders the actual mermaid diagram to SVG HTML
     */
    renderToHTML(node: SyntaxNode, _children: string, ctx: {
        sliceDoc(from: number, to: number): string;
        sanitize(html: string): string;
    }): Promise<string | null>;
}

interface PreviewRenderContext {
    sliceDoc(from: number, to: number): string;
    sanitize(html: string): string;
    syntaxHighlighters?: readonly Highlighter[];
}
/**
 * Text highlight definition
 * Matches text or regex patterns with optional instance selection
 */
interface TextHighlight {
    /** The pattern to match (regex without slashes) */
    pattern: string;
    /** Specific instances to highlight (e.g., [3,5] or range [3,4,5]) */
    instances?: number[];
}
/**
 * Properties extracted from CodeInfo string
 *
 * Example: ```tsx line-numbers{5} title="hello.tsx" caption="Example" copy {2-4,5} /Hello/3-5
 */
interface CodeBlockProperties {
    /** Language identifier (first token) */
    language: string;
    /** Show line numbers, optionally starting from a specific number */
    showLineNumbers?: number | boolean;
    /** Title to display */
    title?: string;
    /** Caption to display */
    caption?: string;
    /** Show copy button */
    copy?: boolean;
    /** Enable diff preview mode */
    diff?: boolean;
    /** Lines to highlight (e.g., [2,3,4,5,9]) */
    highlightLines?: number[];
    /** Text patterns to highlight with optional instance selection */
    highlightText?: TextHighlight[];
}
/**
 * CodePlugin - Handles inline code and fenced code blocks.
 *
 * **Inline code:** `code`
 * Hides backticks when cursor is not in range.
 *
 * **Fenced code blocks:**
 * Supports syntax highlighting, line numbers, line/text highlighting,
 * title, caption, and copy button via CodeInfo properties.
 *
 * @example
 * ```tsx line-numbers{5} title="example.tsx" {2-4} /pattern/
 * const x = 1;
 * ```
 */
declare class CodePlugin extends DecorationPlugin {
    readonly name = "code";
    readonly version = "1.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["InlineCode", "FencedCode", "CodeMark", "CodeInfo", "CodeText"];
    private readonly parserCache;
    /**
     * Plugin theme
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /**
     * Keyboard shortcuts for code formatting
     */
    getKeymap(): KeyBinding[];
    /**
     * Intercepts backtick typing to wrap selected text as inline code.
     *
     * If user types '`' while text is selected, wraps each selected range
     * with backticks (selected -> `selected`).
     */
    getExtensions(): Extension[];
    /**
     * Toggle code block on current line or selected lines
     */
    private toggleCodeBlock;
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
    parseCodeInfo(codeInfo: string): CodeBlockProperties;
    /**
     * Build decorations for inline code and fenced code blocks.
     * Handles line numbers, highlights, header/caption widgets, and fence visibility.
     */
    buildDecorations(ctx: DecorationContext): void;
    private decorateInlineCode;
    private decorateFencedCode;
    private decorateFenceMarkers;
    private decorateDiffLine;
    private decorateTextHighlights;
    /**
     * Render code elements to HTML for static preview.
     * Applies syntax highlighting using @lezer/highlight.
     */
    renderToHTML(node: SyntaxNode, _children: string, ctx: PreviewRenderContext): Promise<string | null>;
    /** Parse comma-separated numbers and ranges (e.g. "1,3-5") into [1,3,4,5]. */
    private parseNumberList;
    /**
     * Highlight a single line of code using the language's Lezer parser.
     * Falls back to sanitized plain text if the language is not supported.
     */
    private highlightCodeLines;
    private resolveLanguageParser;
    private normalizeLanguage;
    private escapeHtml;
    private escapeAttribute;
    private analyzeDiffLines;
    private computeDiffDisplayLineNumbers;
    private parseDiffLineState;
    private computeChangedRanges;
    private renderDiffPreviewLine;
    private applyRangesToHighlightedHTML;
    /**
     * Apply text highlights (regex patterns) to already syntax-highlighted HTML.
     * Wraps matched patterns in `<mark>` elements.
     */
    private applyTextHighlights;
}

/**
 * QuotePlugin - Decorates markdown blockquotes
 *
 * Adds visual styling to blockquotes (> prefixed lines)
 * - Line decorations for indicating quote blocks with a left border
 * - Mark decorations for quote content
 * - Hides > markers when cursor is not in the blockquote
 */
declare class QuotePlugin extends DecorationPlugin {
    readonly name = "quote";
    readonly version = "1.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["Blockquote", "QuoteMark"];
    /**
     * Constructor - calls super constructor
     */
    constructor();
    /**
     * Plugin theme
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /**
     * Build blockquote decorations by iterating the syntax tree
     */
    buildDecorations(ctx: DecorationContext): void;
    /**
     * Recursively find and hide quote marks
     */
    private hideQuoteMarks;
    renderToHTML(node: SyntaxNode, children: string): string | null;
}

/**
 * HRPlugin - Decorates markdown horizontal rules
 *
 * Adds visual styling to thematic breaks (---, ***, ___)
 * - Line decoration that renders a centered horizontal line
 * - Hides raw marker characters when the cursor is not on the line
 */
declare class HRPlugin extends DecorationPlugin {
    readonly name = "hr";
    readonly version = "1.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["HorizontalRule"];
    /**
     * Constructor - calls super constructor
     */
    constructor();
    /**
     * Plugin theme
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /**
     * Build horizontal rule decorations by iterating the syntax tree
     */
    buildDecorations(ctx: DecorationContext): void;
    renderToHTML(node: SyntaxNode, _children: string): string | null;
}

/**
 * EmojiPlugin - Decorates markdown emojis
 *
 * Parses and decorates emoji shortcodes like :smile:
 * - Converts valid shortcodes to Unicode emoji when cursor is outside
 * - Keeps raw shortcode visible while editing (cursor inside token)
 */
declare class EmojiPlugin extends DecorationPlugin {
    readonly name = "emoji";
    readonly version = "1.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["Emoji", "EmojiMark"];
    constructor();
    /**
     * Plugin theme
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /**
     * Build emoji decorations by iterating the syntax tree
     */
    buildDecorations(ctx: DecorationContext): void;
    renderToHTML(node: SyntaxNode, children: string, ctx: {
        sliceDoc(from: number, to: number): string;
        sanitize(html: string): string;
        syntaxHighlighters?: readonly _lezer_highlight.Highlighter[];
    }): string | null;
}

/**
 * Default plugins
 *
 * This is the set of essential plugins
 */
declare const essentialPlugins: DraftlyPlugin[];
/**
 * All plugins
 *
 * This is the set of all plugins available with draftly
 */
declare const allPlugins: DraftlyPlugin[];

export { CodePlugin, EmojiPlugin, HRPlugin, HTMLPlugin, HeadingPlugin, ImagePlugin, InlinePlugin, LinkPlugin, ListPlugin, MathPlugin, MermaidPlugin, ParagraphPlugin, QuotePlugin, TablePlugin, allPlugins, essentialPlugins };
