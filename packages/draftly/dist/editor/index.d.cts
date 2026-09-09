import { T as ThemeEnum, g as ThemeStyle, e as DraftlyPlugin, b as DescribedKeyBinding } from '../draftly-CnHU7TMl.cjs';
export { D as DecorationContext, a as DecorationPlugin, c as DraftlyConfig, d as DraftlyNode, P as PluginConfig, f as PluginContext, S as SyntaxPlugin, V as VisibleIterateSpec, h as createTheme, i as cursorInRange, j as deepMerge, k as draftly, l as fixSelector, m as flattenThemeStyles, s as selectionOverlapsRange, t as toggleMarkdownStyle } from '../draftly-CnHU7TMl.cjs';
import { Extension } from '@codemirror/state';
import '@codemirror/view';
import '@lezer/markdown';
import '@lezer/highlight';
import '@lezer/common';
import 'style-mod';

/**
 * Resolve the surface-agnostic base styles, including the token block, for a theme.
 *
 * Exported so `generateCSS()` can emit the same tokens the editor uses; without
 * them every `var(--draftly-*)` in a plugin's preview CSS falls back to nothing.
 *
 * @param theme - Which theme layer to apply
 * @returns Flattened base styles with tokens declared on the surface root
 */
declare const resolveBaseStyles: (theme: ThemeEnum) => ThemeStyle;
/**
 * Resolve the editor's full base theme, tokens included.
 *
 * @param theme - Which theme layer to apply
 * @returns Base styles plus the editor-only rules
 */
declare function resolveEditorBaseStyles(theme: ThemeEnum): ThemeStyle;
/**
 * Base theme for draftly styling
 * Note: Layout styles are scoped under .cm-draftly which is added by the view plugin
 *
 * @param theme - Which theme layer to apply
 * @returns A CodeMirror theme extension; the same instance for the same theme
 */
declare function draftlyBaseTheme(theme: ThemeEnum): Extension;
declare const markdownResetExtension: Extension;

/**
 * Collect every documented shortcut from a set of plugins.
 *
 * Draftly's shortcuts live on the plugins that implement them, which is what
 * keeps a feature's keymap next to its decorations and its renderer. The cost is
 * that a host has nowhere single to read them from in order to render a shortcut
 * reference — this is that place.
 *
 * @param plugins - The plugins passed to `draftly()`
 * @returns Every shortcut, in plugin order, deduplicated by key and context
 *
 * @example
 * ```ts
 * import { collectShortcuts } from "draftly";
 * import { essentialPlugins } from "draftly/plugins";
 *
 * for (const shortcut of collectShortcuts(essentialPlugins)) {
 *   console.log(shortcut.key, shortcut.name, shortcut.context ?? "Global");
 * }
 * ```
 */
declare function collectShortcuts(plugins: readonly DraftlyPlugin[]): DescribedKeyBinding[];

export { DescribedKeyBinding, DraftlyPlugin, ThemeEnum, ThemeStyle, collectShortcuts, draftlyBaseTheme, markdownResetExtension, resolveBaseStyles, resolveEditorBaseStyles };
