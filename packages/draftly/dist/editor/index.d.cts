export { D as DecorationContext, a as DecorationPlugin, b as DraftlyConfig, c as DraftlyNode, d as DraftlyPlugin, P as PluginConfig, e as PluginContext, S as SyntaxPlugin, T as ThemeEnum, f as ThemeStyle, g as createTheme, h as cursorInRange, i as deepMerge, j as draftly, k as fixSelector, l as flattenThemeStyles, s as selectionOverlapsRange, t as toggleMarkdownStyle } from '../draftly-BBL-AdOl.cjs';
import * as _codemirror_state from '@codemirror/state';
import '@codemirror/view';
import '@lezer/markdown';
import '@lezer/highlight';
import '@lezer/common';
import 'style-mod';

/**
 * Base theme for draftly styling
 * Note: Layout styles are scoped under .cm-draftly which is added by the view plugin
 */
declare const draftlyBaseTheme: _codemirror_state.Extension;
declare const markdownResetExtension: _codemirror_state.Extension;

export { draftlyBaseTheme, markdownResetExtension };
