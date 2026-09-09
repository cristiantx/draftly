import * as _lezer_highlight from '@lezer/highlight';
import { a as DecorationPlugin, T as ThemeEnum, g as ThemeStyle, D as DecorationContext } from '../draftly-CnHU7TMl.cjs';
import { SyntaxNode } from '@lezer/common';
import '@codemirror/state';
import '@codemirror/view';
import '@lezer/markdown';
import 'style-mod';

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

export { EmojiPlugin };
