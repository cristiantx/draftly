import { e as DraftlyPlugin, T as ThemeEnum, g as ThemeStyle, D as DecorationContext, a as DecorationPlugin, b as DescribedKeyBinding, f as PluginContext } from '../draftly-CnHU7TMl.cjs';
import { SyntaxNode } from '@lezer/common';
import { Extension } from '@codemirror/state';
import { MarkdownConfig } from '@lezer/markdown';
import * as _codemirror_view from '@codemirror/view';
import { EditorView } from '@codemirror/view';
import { Highlighter } from '@lezer/highlight';
import 'style-mod';

/**
 * ParagraphPlugin - Applies paragraph spacing on both surfaces
 *
 * The preview wraps paragraphs in `<p class="cm-draftly-paragraph">`, but the
 * editor has no element to hang that class on — the document is a flat list of
 * lines. Marking each line of a paragraph with the same class is what keeps the
 * two surfaces spaced alike.
 */
declare class ParagraphPlugin extends DraftlyPlugin {
    readonly name = "paragraph";
    readonly version = "1.0.0";
    readonly requiredNodes: readonly ["Paragraph"];
    /**
     * Plugin theme for preview styling
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /**
     * Pad the first and last line of every visible paragraph.
     *
     * @param ctx - Decoration context
     * @returns Nothing; decorations are pushed into `ctx.decorations`
     */
    buildDecorations(ctx: DecorationContext): void;
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
    getKeymap(): DescribedKeyBinding[];
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
    getKeymap(): DescribedKeyBinding[];
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
    getKeymap(): DescribedKeyBinding[];
    /**
     * Toggle the checked state of every task on the selected lines.
     *
     * Mirrors what clicking the checkbox does, for every line the selection touches.
     * Mixed selections are normalised to checked, matching how checkbox groups behave
     * elsewhere: if anything is unchecked, check everything; otherwise uncheck everything.
     *
     * @param view - The editor view
     * @returns `true` if any task was toggled, so the keymap can fall through otherwise
     */
    private toggleTaskOnLines;
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
/** Controls automatic source rewrites independently from explicit table commands. */
interface TablePluginOptions {
    /** Preserve the historical normalization on mount unless disabled by the host. */
    normalizeOnOpen?: boolean;
    /** Insert table spacer lines after document edits unless disabled by the host. */
    normalizeOnChange?: boolean;
}
/** Renders and edits GFM tables without changing their source model. */
declare class TablePlugin extends DecorationPlugin {
    private readonly options;
    /** @param options Host choices for automatic source formatting. */
    constructor(options?: TablePluginOptions);
    readonly name = "table";
    readonly version = "2.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["Table", "TableHeader", "TableDelimiter", "TableRow", "TableCell"];
    private draftlyConfig;
    private pendingNormalizationView;
    private pendingPaddingView;
    private pendingSelectionRepairView;
    /**
     * Set of views CodeMirror has torn down.
     *
     * `EditorView` exposes no public "destroyed" flag, so a queued microtask cannot ask the
     * view whether it is still alive. Weak, so an entry disappears with the view rather
     * than becoming its own leak.
     */
    private readonly destroyedViews;
    /** Stores the editor config for preview rendering and shared behavior. */
    onRegister(context: PluginContext): void;
    /** Exposes the plugin theme used for editor and preview styling. */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /** Enables GFM table parsing for the editor and preview renderer. */
    getMarkdownConfig(): MarkdownConfig;
    /** Registers block wrappers and atomic ranges for the table UI. */
    getExtensions(): Extension[];
    /**
     * Nothing to register here: the table's bindings rebind keys the editor already
     * uses, so they go in at `Prec.highest()` via {@link buildTableKeymap} and each
     * one declines unless the cursor is actually in a table.
     */
    getKeymap(): DescribedKeyBinding[];
    /**
     * Documented separately from {@link getKeymap} because these bindings are
     * registered through the precedence-wrapped extension rather than the plugin
     * keymap, and a user still needs to be able to discover them.
     *
     * @returns The table shortcuts, all scoped to being inside a table
     */
    getShortcuts(): DescribedKeyBinding[];
    /** Builds the high-priority key bindings used inside tables. */
    private buildTableKeymap;
    /** Schedules an initial normalization pass once the view is ready. */
    onViewReady(view: EditorView): void;
    /** Re-schedules normalization after user-driven document changes. */
    /**
     * Releases everything scoped to a destroyed view.
     *
     * Clearing the pending fields drops the strong reference; recording the view as
     * destroyed makes any microtask that is already queued bail rather than dispatching
     * into a dead editor.
     */
    onViewDestroy(view: EditorView): void;
    onViewUpdate(update: _codemirror_view.ViewUpdate): void;
    /** Intercepts table-specific DOM key handling before browser defaults run. */
    private handleDomKeydown;
    /**
     * Builds the visual table decorations for every parsed table block in the viewport.
     *
     * Scoped to `ctx.iterateVisible`, unlike `computeBlockWrappers` and
     * `computeAtomicRanges` below, which stay document-wide deliberately — they feed
     * CodeMirror facets rather than the decoration set, and a wrapper or atomic range that
     * disappears when a table scrolls out of view would break layout and cursor motion.
     * A `Table` node straddling the viewport edge is still entered in full, so a partly
     * visible table decorates correctly.
     */
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
    readonly requiredNodes: readonly ["HTMLBlock", "HTMLTag", "Comment", "CommentBlock"];
    constructor();
    /**
     * Plugin theme
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    buildDecorations(ctx: DecorationContext): void;
    /**
     * Render raw HTML nodes to preview HTML.
     *
     * Without this the nodes reached the renderer's leaf fallback and were emitted
     * verbatim, so `<script>alert(1)</script>` written in a document became a live script
     * tag in the output regardless of the `sanitize` setting. This is the parity fix for
     * `HTMLPreviewWidget`, which has always sanitized on the editor surface.
     *
     * @param node - The syntax node to render
     * @param _children - Unused; HTML nodes are leaves as far as the markdown tree is concerned
     * @param ctx - Preview context, for `sliceDoc` and `sanitize`
     * @returns HTML to emit, or `null` to decline
     */
    renderToHTML(node: SyntaxNode, _children: string, ctx: {
        sliceDoc(from: number, to: number): string;
        sanitize(html: string): string;
    }): string | null;
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
    getKeymap(): DescribedKeyBinding[];
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
    getKeymap(): DescribedKeyBinding[];
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
 * Build a fresh set of the essential plugins — the built-in markdown features Draftly
 * enables by default.
 *
 * **Call this once per editor.** Plugin instances carry per-view state (`_context`, and in
 * `TablePlugin`'s case the deferred-work re-entrancy locks), so two editors sharing one
 * set overwrite each other's configuration and silently cancel each other's scheduled
 * work. A factory makes that impossible to get wrong by accident; the deprecated
 * {@link essentialPlugins} array does not.
 *
 * Excludes the three plugins with heavy dependencies. For everything, use
 * `createAllPlugins()` from `draftly/plugins/all`, or add the ones you want:
 *
 * ```ts
 * import { createEssentialPlugins } from "draftly/plugins";
 * import { MermaidPlugin } from "draftly/plugins/mermaid";
 *
 * const plugins = [...createEssentialPlugins(), new MermaidPlugin()];
 * ```
 *
 * The order is the registration order, which is *not* the decoration order — plugins are
 * sorted by `decorationPriority` downstream.
 *
 * @returns A new array of newly-constructed plugin instances, owned by the caller
 *
 * @example
 * ```ts
 * import { draftly } from "draftly";
 * import { createEssentialPlugins } from "draftly/plugins";
 *
 * const extensions = draftly({ plugins: createEssentialPlugins() });
 * ```
 */
declare function createEssentialPlugins(): DraftlyPlugin[];

export { CodePlugin, HRPlugin, HTMLPlugin, HeadingPlugin, ImagePlugin, InlinePlugin, LinkPlugin, ListPlugin, ParagraphPlugin, QuotePlugin, TablePlugin, type TablePluginOptions, createEssentialPlugins };
