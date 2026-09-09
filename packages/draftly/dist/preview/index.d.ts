import * as _lezer_markdown from '@lezer/markdown';
import { MarkdownConfig } from '@lezer/markdown';
import { e as DraftlyPlugin, T as ThemeEnum } from '../draftly-CnHU7TMl.js';
import * as _lezer_highlight from '@lezer/highlight';
import * as _codemirror_state from '@codemirror/state';
import * as _codemirror_language from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';
export { e as escapeHtml } from '../escape-html-Dmalb2FV.js';
import '@codemirror/view';
import 'style-mod';

type SyntaxThemeInput = _codemirror_language.HighlightStyle | _codemirror_state.Extension | readonly _codemirror_state.Extension[];
/**
 * Context passed to plugin preview methods
 */
interface PreviewContext {
    /** Full document text */
    readonly doc: string;
    /** Current theme */
    readonly theme: ThemeEnum;
    /** Slice document text between positions */
    sliceDoc(from: number, to: number): string;
    /** Sanitize HTML content (for HTMLBlock/HTMLTag) */
    sanitize(html: string): string;
    /** Render children of a node to HTML */
    renderChildren(node: SyntaxNode): Promise<string>;
    /** Active syntax highlighters used for code rendering */
    readonly syntaxHighlighters?: readonly _lezer_highlight.Highlighter[];
}
/**
 * Configuration for the preview renderer
 */
interface PreviewConfig {
    /** Plugins to use for rendering */
    plugins?: DraftlyPlugin[];
    /** Markdown extensions to use for rendering */
    markdown?: _lezer_markdown.MarkdownConfig[];
    /** CSS class for the wrapper element */
    wrapperClass?: string;
    /** HTML tag for the wrapper element */
    wrapperTag?: "article" | "div" | "section";
    /** Whether to sanitize HTML blocks (default: true) */
    sanitize?: boolean;
    /**
     * Sanitizer to use instead of the bundled DOMPurify.
     *
     * **Required for server-side rendering.** DOMPurify needs a DOM, so outside a browser
     * the bundled sanitizer cannot run and `sanitize: true` protects nothing. Draftly does
     * not depend on jsdom — it is heavy, and forcing it on every consumer to serve the
     * server-rendering subset is the wrong trade — so supply your own here:
     *
     * ```ts
     * import createDOMPurify from "isomorphic-dompurify";
     * preview(md, { sanitizer: (html) => createDOMPurify.sanitize(html) });
     * ```
     *
     * Ignored when `sanitize` is `false`.
     */
    sanitizer?: (html: string) => string;
    /** Theme to use */
    theme?: ThemeEnum;
    /** CodeMirror syntax theme input used for static preview highlighting */
    syntaxTheme?: SyntaxThemeInput | SyntaxThemeInput[];
}
/**
 * Result of CSS generation
 */
interface GenerateCSSConfig {
    /** Plugins to extract styles from */
    plugins?: DraftlyPlugin[];
    /** Theme to use */
    theme?: ThemeEnum;
    /** Wrapper class for scoping (default: "draftly-preview") */
    wrapperClass?: string;
    /** Include base styles */
    includeBase?: boolean;
    /** CodeMirror syntax theme input used for static preview syntax highlighting */
    syntaxTheme?: SyntaxThemeInput | SyntaxThemeInput[];
}
/**
 * Node renderer function type
 */
type NodeRenderer = (node: SyntaxNode, children: string, ctx: PreviewContext) => string;
/**
 * Map of node names to their renderers
 */
type NodeRendererMap = Record<string, NodeRenderer>;

/**
 * Render markdown to semantic HTML
 *
 * @param markdown - Markdown string to render
 * @param config - Preview configuration
 * @returns HTML string
 *
 * @example
 * ```ts
 * import { preview } from 'draftly/preview';
 * import { HeadingPlugin, ListPlugin } from 'draftly/plugins';
 *
 * const html = preview('# Hello World', {
 *   plugins: [new HeadingPlugin(), new ListPlugin()],
 *   wrapperClass: 'draftly-preview',
 * });
 * ```
 */
declare function preview(markdown: string, config?: PreviewConfig): Promise<string>;

/**
 * Generate CSS for preview rendering
 *
 * @param config - CSS generation configuration
 * @returns CSS string
 *
 * @example
 * ```ts
 * import { generateCSS } from 'draftly/preview';
 * import { HeadingPlugin, ListPlugin } from 'draftly/plugins';
 *
 * const css = generateCSS({
 *   plugins: [new HeadingPlugin(), new ListPlugin()],
 *   theme: ThemeEnum.AUTO,
 *   includeBase: true,
 * });
 * ```
 */
declare function generateCSS(config?: GenerateCSSConfig): string;

/**
 * Extract syntax highlight CSS from resolved CodeMirror HighlightStyle modules.
 *
 * The rules are scoped to `wrapperClass` before being returned. CodeMirror emits
 * bare `.tok-*` selectors, and preview CSS lands in the host page's global
 * stylesheet — unscoped, the preview's syntax theme also restyles the editor.
 *
 * @param syntaxTheme - Highlight style(s) to extract rules from
 * @param wrapperClass - Preview wrapper class every rule is scoped under
 * @returns Scoped CSS, or an empty string when there is nothing to emit
 */
declare function generateSyntaxThemeCSS(syntaxTheme: SyntaxThemeInput | SyntaxThemeInput[] | undefined, wrapperClass: string): string;

/**
 * Default node renderers for all markdown node types
 */
declare const defaultRenderers: NodeRendererMap;

/**
 * Renderer class that walks the syntax tree and produces HTML
 */
declare class PreviewRenderer {
    private doc;
    private theme;
    private plugins;
    private markdown;
    private sanitizeHtml;
    private syntaxTheme;
    private renderers;
    private ctx;
    private nodeToPlugins;
    constructor(doc: string, plugins: DraftlyPlugin[] | undefined, markdown: MarkdownConfig[], theme?: ThemeEnum, sanitize?: boolean, syntaxTheme?: SyntaxThemeInput | SyntaxThemeInput[], sanitizer?: (html: string) => string);
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
    private buildNodePluginMap;
    /**
     * Render the document to HTML
     */
    render(): Promise<string>;
    /**
     * Render a single node to HTML
     */
    private renderNode;
    /**
     * Render all children of a node, including text between nodes
     */
    private renderChildren;
}

export { type GenerateCSSConfig, type NodeRenderer, type NodeRendererMap, type PreviewConfig, type PreviewContext, PreviewRenderer, type SyntaxThemeInput, defaultRenderers, generateCSS, generateSyntaxThemeCSS, preview };
