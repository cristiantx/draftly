import * as _codemirror_state from '@codemirror/state';
import { Extension, Range } from '@codemirror/state';
import { EditorView, KeyBinding, Decoration, ViewUpdate } from '@codemirror/view';
import { MarkdownConfig } from '@lezer/markdown';
import * as _lezer_highlight from '@lezer/highlight';
import { SyntaxNode } from '@lezer/common';
import { StyleSpec } from 'style-mod';

/**
 * Deep merge two objects
 * @param a - First object
 * @param b - Second object
 * @returns Merged object
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
declare function flattenThemeStyles(themeStyles: ThemeStyle, parentSelector?: string): ThemeStyle;
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
 * Decoration context passed to plugin decoration builders
 * Provides access to view state and decoration collection
 */
interface DecorationContext {
    /** The EditorView instance (readonly) */
    readonly view: EditorView;
    /** Array to push decorations into (will be sorted automatically) */
    readonly decorations: Range<Decoration>[];
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
 */
declare abstract class DraftlyPlugin {
    /** Unique plugin identifier (abstract - must be implemented) */
    abstract readonly name: string;
    /** Plugin version (abstract - must be implemented) */
    abstract readonly version: string;
    /** Decoration priority (higher = applied later) */
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
    /** Plugin theme */
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
     */
    getKeymap(): KeyBinding[];
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
     * Called when plugin is unregistered
     * Override to perform cleanup
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
     * @param node - The syntax node to render
     * @param children - Pre-rendered children HTML
     * @param ctx - Preview context with document and utilities
     * @returns HTML string to use, or null to use default rendering
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

export { type DecorationContext as D, type PluginConfig as P, SyntaxPlugin as S, ThemeEnum as T, DecorationPlugin as a, type DraftlyConfig as b, type DraftlyNode as c, DraftlyPlugin as d, type PluginContext as e, type ThemeStyle as f, createTheme as g, cursorInRange as h, deepMerge as i, draftly as j, fixSelector as k, flattenThemeStyles as l, selectionOverlapsRange as s, toggleMarkdownStyle as t };
