import * as _codemirror_state from '@codemirror/state';
import { Extension, Range } from '@codemirror/state';
import { EditorView, KeyBinding, Decoration, ViewUpdate } from '@codemirror/view';
import { MarkdownConfig } from '@lezer/markdown';
import * as _lezer_highlight from '@lezer/highlight';
import { SyntaxNodeRef, SyntaxNode } from '@lezer/common';
import { StyleSpec } from 'style-mod';

/**
 * Deep merge two objects.
 *
 * **Never mutates either argument** — every level allocates a fresh object.
 * `createTheme` depends on this contract to stay pure, so it is part of the
 * function's API rather than an implementation detail.
 *
 * Inherited keys and the prototype-pollution keys are skipped.
 *
 * @param a - Base object; its values are the fallback
 * @param b - Overlay object; its values win where both define a key
 * @returns A new object; neither input is modified
 */
declare function deepMerge<T>(a: T, b?: T): T;
/**
 * Theme style
 */
type ThemeStyle = {
    [selector: string]: StyleSpec;
};
/**
 * Theme Enum
 */
declare enum ThemeEnum {
    DARK = "dark",
    LIGHT = "light",
    AUTO = "auto"
}
/**
 * Function to create the themes
 *
 * @param defaultTheme - Default theme -- Always applied
 * @param darkTheme - Dark theme -- Applied when theme is "dark" or "auto" and system is dark
 * @param lightTheme - Light theme -- Applied when theme is "light" or "auto" and system is light
 * @returns Theme function
 */
declare function createTheme({ default: defaultTheme, dark: darkTheme, light: lightTheme, }: {
    default: ThemeStyle;
    dark?: ThemeStyle;
    light?: ThemeStyle;
}): (theme: ThemeEnum) => ThemeStyle;
/**
 * Flatten a nested theme tree into a flat `selector -> StyleSpec` map.
 *
 * Nested objects become descendant selectors and comma-separated keys are split
 * into one entry each, so `EditorView.theme()` and `generateCSS()` both receive
 * the single-level shape they expect.
 *
 * @param themeStyles - Theme tree, possibly nested and comma-separated
 * @param parentSelector - Accumulated ancestor selector during recursion
 * @returns A flat map with one entry per resolved selector
 */
declare function flattenThemeStyles(themeStyles: ThemeStyle, parentSelector?: string): ThemeStyle;
/**
 * Collapse the nesting `&` into its parent selector.
 *
 * `flattenThemeStyles` always joins with a space before recursing, so a child
 * written as `&.active` arrives here as `.parent &.active` and the space plus
 * `&` are what have to go.
 *
 * @param selector - Joined selector, possibly containing ` &`
 * @returns The selector with the nesting marker removed
 */
declare function fixSelector(selector: string): string;
/**
 * Check if cursor is within the given range
 */
declare function cursorInRange(view: EditorView, from: number, to: number): boolean;
/**
 * Check if any selection overlaps with the given range
 */
declare function selectionOverlapsRange(view: EditorView, from: number, to: number): boolean;
/**
 * Toggle markdown style on selection or insert markers at cursor
 * @param marker - The markdown marker (e.g., "**" for bold, "*" for italic)
 * @returns Command function for EditorView
 */
declare function toggleMarkdownStyle(marker: string): (view: EditorView) => boolean;

/**
 * A CodeMirror {@link KeyBinding} carrying the metadata a shortcut reference needs.
 *
 * Plugins return these from {@link DraftlyPlugin.getKeymap}, and because the type
 * only adds fields, CodeMirror consumes them unmodified. The fields are required
 * so that a shortcut cannot ship without a name a user can read.
 */
interface DescribedKeyBinding extends KeyBinding {
    /** Short action name, e.g. `"Bold"`. */
    name: string;
    /** One line describing what the shortcut does. */
    description: string;
    /**
     * Where the binding applies, when it is not global -- e.g. `"Inside a table"`.
     *
     * Context-scoped bindings often rebind keys that mean something else elsewhere
     * (`Tab`, `Enter`), so a reference that lists them flat is misleading.
     */
    context?: string;
}
/**
 * Context passed to plugin lifecycle methods
 */
interface PluginContext {
    /** Current configuration */
    readonly config: DraftlyConfig;
}
/**
 * Plugin configuration schema
 */
interface PluginConfig {
    [key: string]: unknown;
}
/**
 * Spec for {@link DecorationContext.iterateVisible}.
 *
 * Mirrors the subset of Lezer's `iterate` options a decoration builder needs; `from`
 * and `to` are supplied by the context, which is the entire point.
 */
interface VisibleIterateSpec {
    /**
     * Called on entering a node. Return `false` to skip its subtree.
     */
    enter(node: SyntaxNodeRef): boolean | void;
    /**
     * Called on leaving a node whose `enter` did not return `false`.
     */
    leave?(node: SyntaxNodeRef): void;
}
/**
 * Decoration context passed to plugin decoration builders
 * Provides access to view state and decoration collection
 */
interface DecorationContext {
    /** The EditorView instance (readonly) */
    readonly view: EditorView;
    /** Array to push decorations into (will be sorted automatically) */
    readonly decorations: Range<Decoration>[];
    /**
     * The document ranges CodeMirror has actually rendered.
     *
     * Falls back to the whole document when the view has not measured yet, so this is
     * never empty.
     */
    readonly visibleRanges: readonly {
        readonly from: number;
        readonly to: number;
    }[];
    /**
     * Walk the syntax tree, **scoped to the viewport**.
     *
     * Use this instead of `syntaxTree(view.state).iterate(...)`. An unbounded walk makes
     * every update cost O(document) — including a plain cursor move, which rebuilds
     * decorations just like an edit does. With 14 plugins that was 14 full-document walks
     * per keystroke.
     *
     * Nodes that merely *overlap* a visible range are still entered, so a construct half
     * off-screen is decorated in full. When the viewport is split into several ranges,
     * a node spanning the gap is entered once, not once per range.
     *
     * @param spec - `enter`, and optionally `leave`
     */
    iterateVisible(spec: VisibleIterateSpec): void;
    /** Check if selection overlaps with a range (to show raw markdown) */
    selectionOverlapsRange(from: number, to: number): boolean;
    /** Check if cursor is within a range */
    cursorInRange(from: number, to: number): boolean;
}
/**
 * Abstract base class for all draftly plugins
 *
 * Implements OOP principles:
 * - Abstraction: abstract name/version must be implemented by subclasses
 * - Encapsulation: private _config, protected _context
 * - Inheritance: specialized plugin classes can extend this
 *
 * ## Instance lifetime, and the rule that follows from it
 *
 * **One plugin instance belongs to one editor.** `createEssentialPlugins()` and
 * `createAllPlugins()` construct a fresh set per call precisely so that a consumer cannot
 * accidentally share one.
 *
 * **A plugin must not hold state that belongs to a view.** Anything derived from a
 * specific `EditorView` — a pending timer, a scheduled microtask's target, a cached
 * measurement, the view itself — either keys off the view (a `WeakMap` or a CodeMirror
 * `StateField`) or is released in {@link DraftlyPlugin.onViewDestroy}. Two things go wrong
 * otherwise, and both are silent: with a shared instance, one editor overwrites another's
 * state, and with any instance, a retained view retains its document for the lifetime of
 * the page.
 *
 * `_config` and `_context` are the one sanctioned exception, and only because they are
 * written once at composition time by {@link DraftlyPlugin.onRegister}. They are still
 * per-editor state, which is why the factories exist.
 */
declare abstract class DraftlyPlugin {
    /** Unique plugin identifier (abstract - must be implemented) */
    abstract readonly name: string;
    /** Plugin version (abstract - must be implemented) */
    abstract readonly version: string;
    /**
     * Priority of this plugin relative to others, on **both** surfaces.
     *
     * - **Editor:** plugins are sorted *ascending* and all of them run. Later decorations
     *   layer over earlier ones, so a higher number wins visually.
     * - **Preview:** candidates for a node are tried in *descending* order and the first
     *   non-null `renderToHTML` result wins. So a higher number wins here too.
     *
     * The sorts point opposite ways because the composition models differ — layering
     * versus precedence — and that is exactly what makes one number mean the same thing
     * on both surfaces. Two plugins claiming the same node at the same priority is
     * ambiguous and warns in development.
     *
     * Pick a value inside an existing band; see `artifacts/architecture/plugin-system.md`.
     */
    readonly decorationPriority: number;
    /** Plugin dependencies - names of required plugins */
    readonly dependencies: string[];
    /** Node types this plugin handles for decorations and preview rendering */
    readonly requiredNodes: readonly string[];
    /** Private configuration storage */
    private _config;
    /** Protected context - accessible to subclasses */
    protected _context: PluginContext | null;
    /** Get plugin configuration */
    get config(): PluginConfig;
    /** Set plugin configuration */
    set config(value: PluginConfig);
    /** Get plugin context */
    get context(): PluginContext | null;
    /**
     * Plugin theme resolver.
     *
     * Overrides must return a **module-level constant**, not a fresh `createTheme(...)`
     * per access — the resolved styles and the `EditorView.theme()` extension are both
     * memoized per `(plugin, ThemeEnum)` pair, and an unstable getter defeats that.
     */
    get theme(): (theme: ThemeEnum) => ThemeStyle;
    /**
     * Return CodeMirror extensions for this plugin
     * Override to provide custom extensions
     */
    getExtensions(): Extension[];
    /**
     * Return markdown parser extensions
     * Override to extend markdown parsing
     */
    getMarkdownConfig(): MarkdownConfig | null;
    /**
     * Return keybindings for this plugin
     * Override to add custom keyboard shortcuts
     *
     * @returns Bindings to register, each carrying its own documentation
     */
    getKeymap(): DescribedKeyBinding[];
    /**
     * Return every shortcut this plugin wants listed in a shortcut reference.
     *
     * Defaults to {@link getKeymap}. Override when a plugin registers bindings some
     * other way -- `TablePlugin` wraps its bindings in `Prec.highest()` and scopes
     * them to a table, so they never pass through `getKeymap()` even though a user
     * still needs to know they exist.
     *
     * @returns Documented shortcuts, registered or otherwise
     */
    getShortcuts(): DescribedKeyBinding[];
    /**
     * Build decorations for the current view state
     * Override to contribute decorations to the editor
     *
     * @param ctx - Decoration context with view and decoration array
     */
    buildDecorations(_ctx: DecorationContext): void;
    /**
     * Called when plugin is registered with draftly
     * Override to perform initialization
     *
     * @param context - Plugin context with configuration
     */
    onRegister(context: PluginContext): void | Promise<void>;
    /**
     * Called when plugin is unregistered.
     *
     * @deprecated **Nothing calls this.** `onRegister` runs from `draftly()`, and there is
     * no corresponding teardown of an extension bundle to hang an unregister off.
     *
     * T-017 removed the *second* reason it could not be wired to view destruction — with
     * per-editor instances from `createEssentialPlugins()`, clearing `_context` no longer
     * breaks other editors. It remains uncalled because the first reason stands: plugin
     * registration is not scoped to a view, so there is no event to fire it on. A consumer
     * still holding the deprecated shared arrays would also still be broken by it.
     *
     * Use {@link onViewDestroy} to release view-scoped state. This hook is kept rather than
     * removed because it is public API.
     */
    onUnregister(): void;
    /**
     * Called when EditorView is created and ready
     * Override to perform view-specific initialization
     *
     * @param view - The EditorView instance
     */
    onViewReady(_view: EditorView): void;
    /**
     * Called on view updates (document changes, selection changes, etc.)
     * Override to react to editor changes
     *
     * @param update - The ViewUpdate with change information
     */
    onViewUpdate(_update: ViewUpdate): void;
    /**
     * Called when the `EditorView` is torn down. Symmetric with {@link onViewReady}.
     *
     * **Any plugin holding view-scoped state must release it here.** Plugin instances are
     * module-level singletons that outlive every view, so a retained `EditorView` retains
     * its DOM, its state and the whole document for the lifetime of the page. Pending
     * timers and microtasks holding a view are the usual culprits.
     *
     * Called from the view plugin's own `destroy()`, so it fires for every reconfigure as
     * well as for a real teardown — hosts that rebuild their extension array do this
     * routinely.
     *
     * @param view - The view being destroyed
     */
    onViewDestroy(_view: EditorView): void;
    /**
     * Helper to get current editor state
     * @param view - The EditorView instance
     */
    protected getState(view: EditorView): _codemirror_state.EditorState;
    /**
     * Helper to get current document
     * @param view - The EditorView instance
     */
    protected getDocument(view: EditorView): _codemirror_state.Text;
    /**
     * Render a syntax node to HTML for preview mode
     * Override to provide custom HTML rendering for specific node types
     *
     * Returning `null` **declines**: the next candidate plugin for this node is tried,
     * then the default renderer, then the escaped leaf fallback. Returning `""` is not the
     * same thing — it renders the node as nothing, which is how syntax markers are dropped
     * from static output.
     *
     * @param node - The syntax node to render
     * @param children - Pre-rendered children HTML
     * @param ctx - Preview context with document and utilities
     * @returns HTML to use, `""` to render nothing, or `null` to decline
     */
    renderToHTML?(node: SyntaxNode, children: string, ctx: {
        sliceDoc(from: number, to: number): string;
        sanitize(html: string): string;
        syntaxHighlighters?: readonly _lezer_highlight.Highlighter[];
    }): string | null | Promise<string | null>;
    /**
     * Get CSS styles for preview mode
     * Override to provide custom CSS for preview rendering
     *
     * @param theme - Current theme enum
     * @returns CSS string for preview styles
     */
    getPreviewStyles(theme: ThemeEnum, wrapperClass: string): string;
    /**
     * Transform ThemeStyle object to CSS string for preview
     * Uses cssClassMap to convert CM selectors to semantic selectors
     */
    protected transformToCss(themeStyles: ThemeStyle, wrapperClass: string): string;
}
/**
 * Base class for plugins that primarily contribute decorations
 * Extends DraftlyPlugin with decoration-focused defaults
 */
declare abstract class DecorationPlugin extends DraftlyPlugin {
    /**
     * Decoration priority - lower than default for decoration plugins
     * Override to customize
     */
    decorationPriority: number;
    /**
     * Subclasses must implement this to provide decorations
     * @param ctx - Decoration context
     */
    abstract buildDecorations(ctx: DecorationContext): void;
}
/**
 * Base class for plugins that add syntax/parser extensions
 * Extends DraftlyPlugin with syntax-focused requirements
 */
declare abstract class SyntaxPlugin extends DraftlyPlugin {
    /**
     * Subclasses must implement this to provide markdown config
     */
    abstract getMarkdownConfig(): MarkdownConfig;
}

/**
 * DraftlyNode: represents a node in the markdown tree
 *
 * Useful for debugging and development
 */
type DraftlyNode = {
    from: number;
    to: number;
    name: string;
    children: DraftlyNode[];
    isSelected: boolean;
};
/**
 * Configuration options for the draftly editor
 */
interface DraftlyConfig {
    /** Theme */
    theme?: ThemeEnum;
    /** Weather to load base styles */
    baseStyles?: boolean;
    /** Plugins to load */
    plugins?: DraftlyPlugin[];
    /** Additional markdown extensions for the parser */
    markdown?: MarkdownConfig[];
    /** Additional CodeMirror extensions */
    extensions?: Extension[];
    /** Additional keybindings */
    keymap?: KeyBinding[];
    /** Disable the built-in view plugin (for raw markdown mode) */
    disableViewPlugin?: boolean;
    /** Enable default keybindings */
    defaultKeybindings?: boolean;
    /** Enable history */
    history?: boolean;
    /** Enable indent with tab */
    indentWithTab?: boolean;
    /** Highlight active line */
    highlightActiveLine?: boolean;
    /** Line wrapping in raw markdown mode */
    lineWrapping?: boolean;
    /** Callback to receive the nodes on every update */
    onNodesChange?: (nodes: DraftlyNode[]) => void;
    /**
     * Called when a plugin's `buildDecorations` throws.
     *
     * Decoration errors are swallowed by design — Lezer exposes partially-built trees
     * mid-parse and node access throws until the parse settles — but that also hides
     * genuine plugin bugs behind exactly the same symptom: the decoration silently does
     * not appear.
     *
     * Errors raised while the syntax tree is still parsing are treated as transient and
     * never reported. Everything else reaches this callback, **once per distinct
     * plugin-and-message**, so a persistent bug does not flood the console.
     *
     * Without a handler, Draftly logs to `console.error` outside production and stays
     * silent in it.
     *
     * @param plugin - Name of the plugin that threw
     * @param error - The thrown value
     */
    onPluginError?: (plugin: string, error: unknown) => void;
}
/**
 * Creates a draftly editor extension bundle for CodeMirror 6
 *
 * @param config - Configuration options for the editor
 * @returns CodeMirror Extension that can be added to EditorState
 *
 * @example
 * ```ts
 * import { EditorView } from '@codemirror/view';
 * import { EditorState } from '@codemirror/state';
 * import { draftly } from 'draftly';
 *
 * const view = new EditorView({
 *   state: EditorState.create({
 *     doc: '# Hello draftly',
 *     extensions: [draftly()]
 *   }),
 *   parent: document.getElementById('editor')
 * });
 * ```
 */
declare function draftly(config?: DraftlyConfig): Extension[];

export { type DecorationContext as D, type PluginConfig as P, SyntaxPlugin as S, ThemeEnum as T, type VisibleIterateSpec as V, DecorationPlugin as a, type DescribedKeyBinding as b, type DraftlyConfig as c, type DraftlyNode as d, DraftlyPlugin as e, type PluginContext as f, type ThemeStyle as g, createTheme as h, cursorInRange as i, deepMerge as j, draftly as k, fixSelector as l, flattenThemeStyles as m, selectionOverlapsRange as s, toggleMarkdownStyle as t };
