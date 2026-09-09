import * as _codemirror_state from '@codemirror/state';
import * as _codemirror_view from '@codemirror/view';
import { MarkdownConfig } from '@lezer/markdown';
import { a as DecorationPlugin, T as ThemeEnum, g as ThemeStyle, D as DecorationContext } from '../draftly-CnHU7TMl.cjs';
import { SyntaxNode } from '@lezer/common';
import '@lezer/highlight';
import 'style-mod';

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
interface MermaidPluginOptions {
    /** Select the whole source or place a caret at the start of the diagram body. */
    activation?: "select" | "caret";
}
/** Renders Mermaid source using measured block decorations. */
declare class MermaidPlugin extends DecorationPlugin {
    private readonly options;
    readonly name = "mermaid";
    readonly version = "1.0.0";
    decorationPriority: number;
    readonly requiredNodes: readonly ["MermaidBlock", "MermaidBlockMark"];
    constructor(options?: MermaidPluginOptions);
    /** Supplies height-changing decorations before CodeMirror calculates its viewport. */
    getExtensions(): _codemirror_state.StateField<{
        diagrams: {
            from: number;
            to: number;
            definition: string;
            attributes: Record<string, string>;
        }[];
        decorations: _codemirror_view.DecorationSet;
    }>[];
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

export { MermaidPlugin, type MermaidPluginOptions };
