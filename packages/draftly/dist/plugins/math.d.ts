import { Extension } from '@codemirror/state';
import { MarkdownConfig } from '@lezer/markdown';
import { a as DecorationPlugin, T as ThemeEnum, g as ThemeStyle, D as DecorationContext } from '../draftly-CnHU7TMl.js';
import { Parser, SyntaxNode } from '@lezer/common';
import { tags } from '@lezer/highlight';
import '@codemirror/view';
import 'style-mod';

/**
 * Options for {@link MathPlugin}.
 */
interface MathPluginOptions {
    /**
     * A LaTeX parser to overlay on math content, for syntax highlighting of the raw
     * source while the cursor is inside a formula.
     *
     * Injected rather than bundled. The obvious candidate, `codemirror-lang-latex`,
     * is AGPL-3.0-or-later, and draftly is MIT — depending on it would push its
     * terms onto every consumer. Passing the parser in leaves that decision where
     * it belongs.
     *
     * @example
     * ```ts
     * import { latexLanguage } from "codemirror-lang-latex";
     * import { styleTags } from "@lezer/highlight";
     * import { MathPlugin, latexHighlightTags } from "draftly/plugins";
     *
     * new MathPlugin({
     *   mathParser: latexLanguage.parser.configure({
     *     props: [styleTags(latexHighlightTags)],
     *   }),
     * });
     * ```
     */
    mathParser?: Parser;
    /**
     * Inject KaTeX's stylesheet — fonts included — into the document head.
     *
     * Defaults to `false`, which means Draftly ships no math CSS at all and the consumer
     * imports `katex/dist/katex.min.css` themselves. That is the cheap path: the stylesheet
     * plus its 20 inlined font faces is ~360 KB, and a build that already handles CSS and
     * font assets does it better.
     *
     * Set it to `true` when there is no such build step — a `<script>` tag, a CDN, an
     * embedded editor — and Draftly will inject the whole thing once per document. The
     * fonts are `data:` URIs rather than relative `fonts/KaTeX_*` paths, which is what makes
     * a `<style>` element viable at all: KaTeX's own rules resolve against the *page* URL
     * and 404 for every consumer who does not happen to serve the fonts from there.
     *
     * The stylesheet lives behind a dynamic `import()` and tsup emits it as its own chunk on
     * both formats, so leaving this at `false` costs nothing.
     *
     * @defaultValue false
     */
    injectStyles?: boolean;
}
/**
 * Style tags for LaTeX node types that `codemirror-lang-latex` leaves untagged.
 *
 * Its parser specializes many control sequences (`\text`, `\hbox`, `\href`,
 * sectioning, list, table and colour macros) into named node types that its own
 * `styleTags` does not cover, so they highlight as plain text next to the generic
 * `CtrlSeq` token. This is the missing half; pass it to `styleTags()` when
 * configuring a parser for {@link MathPluginOptions.mathParser}.
 *
 * Node type names only — no code from that package is reproduced here.
 */
declare const latexHighlightTags: Record<string, typeof tags.keyword>;
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
    /** A LaTeX parser overlaid on math content, when the host supplied one. */
    private readonly mathParser;
    /**
     * @param options - LaTeX parser for highlighting raw math source, and whether to inject
     * KaTeX's stylesheet; see {@link MathPluginOptions}
     */
    constructor(options?: MathPluginOptions);
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
     * Overlay a LaTeX parser onto math node contents.
     *
     * The overlay spans the `$`/`$$` markers rather than stopping short of them, so
     * the LaTeX parser enters math mode and tokenises operators and identifiers as
     * math rather than as prose.
     *
     * @param parser - The LaTeX parser to overlay
     * @returns A mixed-parser wrapper for the markdown parser
     */
    private buildMathOverlay;
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

export { MathPlugin, type MathPluginOptions, latexHighlightTags };
