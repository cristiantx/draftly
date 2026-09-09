import { Extension } from '@codemirror/state';
export { e as escapeHtml } from '../escape-html-Dmalb2FV.js';
import { EditorView } from '@codemirror/view';

/**
 * Mapping of typed input characters to surrounding markers.
 *
 * Example:
 * { "*": "*", "=": "==" }
 */
type WrapSelectionMarkerMap = Record<string, string>;
/**
 * Creates an input handler that wraps non-empty selections with markdown markers
 * when a mapped character is typed.
 */
declare function createWrapSelectionInputHandler(markersByInput: WrapSelectionMarkerMap): Extension;

/**
 * URL scheme validation shared by the editor and preview surfaces.
 *
 * Pure and CodeMirror-free by design: both surfaces must reject the same schemes,
 * and the only way to guarantee that is for both to call the same function.
 *
 * @packageDocumentation
 */
/**
 * Options for {@link isSafeUrl} and {@link safeUrl}.
 */
interface SafeUrlOptions {
    /**
     * Permit `data:` URLs with a raster image media type.
     *
     * Set for an `<img src>`, where inline images are a legitimate and common
     * markdown idiom. Leave unset for `<a href>`, where a `data:` URL is a
     * navigation target and gains nothing but risk.
     *
     * @defaultValue false
     */
    allowDataImages?: boolean;
}
/**
 * Test whether a URL is safe to place in an `href` or `src`.
 *
 * A URL with no scheme -- relative, protocol-relative, a fragment, a query -- is
 * always safe; it inherits the hosting document's own scheme. A URL *with* a
 * scheme must name one in the allowlist.
 *
 * @param url - The raw URL as written in the markdown source
 * @param options - Scheme policy; see {@link SafeUrlOptions}
 * @returns `true` if the URL may be emitted as-is
 *
 * @example
 * ```ts
 * isSafeUrl("https://example.com");   // true
 * isSafeUrl("./relative/path.md");    // true
 * isSafeUrl("javascript:alert(1)");   // false
 * isSafeUrl("data:image/png;base64,AA", { allowDataImages: true }); // true
 * ```
 */
declare function isSafeUrl(url: string, options?: SafeUrlOptions): boolean;
/**
 * Return the URL if it is safe, or an empty string if it is not.
 *
 * The empty string is chosen over dropping the attribute entirely so callers stay
 * simple: an `href=""` is inert, and the surrounding markup does not change shape
 * depending on the input.
 *
 * @param url - The raw URL as written in the markdown source
 * @param options - Scheme policy; see {@link SafeUrlOptions}
 * @returns The original URL, or `""` when its scheme is not permitted
 */
declare function safeUrl(url: string, options?: SafeUrlOptions): string;

/**
 * Development-only diagnostics.
 *
 * Draftly's failure modes are unusually quiet — a plugin can be silently absent from
 * preview, and decoration errors are swallowed on purpose. These helpers make those
 * cases say something during development while staying out of production bundles.
 *
 * @packageDocumentation
 */
/**
 * Whether development diagnostics should run.
 *
 * Reads `process.env.NODE_ENV` defensively: the library ships to browsers where
 * `process` may not exist at all, and to bundlers that replace this expression with a
 * literal so the guarded branch is dropped entirely.
 *
 * @returns `true` outside a production build
 */
declare function isDevMode(): boolean;
/**
 * Emit a development-only warning, prefixed so it is attributable.
 *
 * @param message - What went wrong, in one line
 * @param details - Optional extra values to log alongside it
 */
declare function devWarn(message: string, ...details: unknown[]): void;

/**
 * Resolving a widget's document range at event time.
 *
 * @packageDocumentation
 */
/**
 * A resolved document range.
 */
interface WidgetRange {
    readonly from: number;
    readonly to: number;
}
/**
 * Resolve the document range of the construct a widget belongs to, **at event time**.
 *
 * Widgets must not carry their `from`/`to` into `eq()` — positions shift on any edit
 * earlier in the document, so a position-comparing `eq` never reports equality and
 * CodeMirror rebuilds the widget on every keystroke. But the click handlers genuinely
 * need a range. This resolves one from the live DOM instead of a snapshot, which is also
 * more correct: a snapshot taken at build time is already stale after an edit above it.
 *
 * Both sides of the position are tried, because Draftly places widgets two ways — as a
 * `Decoration.replace` over the construct (position lands at its start) and as a
 * `Decoration.widget` with `side: 1` at the construct's end (position lands at its end).
 *
 * @param view - The EditorView the widget is mounted in
 * @param dom - The widget's own DOM element, as returned from `toDOM`
 * @param nodeNames - Node names that count as the enclosing construct
 * @returns The construct's current range, or `null` if it cannot be resolved
 *
 * @example
 * ```ts
 * const range = resolveWidgetRange(view, span, ["Link"]) ?? { from: this.from, to: this.to };
 * view.dispatch({ selection: { anchor: range.from, head: range.to } });
 * ```
 */
declare function resolveWidgetRange(view: EditorView, dom: HTMLElement, nodeNames: readonly string[]): WidgetRange | null;
/**
 * Compare two flat string maps by content.
 *
 * `JSON.stringify` was the previous idiom for this in `MermaidBlockWidget`; it is
 * key-order dependent and allocates two strings on every comparison — in a function
 * whose whole job is to be cheap enough to run per keystroke.
 *
 * @param a - First map
 * @param b - Second map
 * @returns `true` if both have the same keys with the same values
 */
declare function shallowEqualRecord(a: Record<string, string>, b: Record<string, string>): boolean;

/**
 * Monospace display width of a string, measured in terminal-style columns.
 *
 * Pure, dependency-free and CodeMirror-free. `String.length` counts UTF-16 code units,
 * which is the wrong measure for anything the user is likely to put in a table cell: a
 * CJK glyph occupies two columns and counts as one, an emoji counts as two and occupies
 * two, a combining accent counts as one and occupies none, and a ZWJ family emoji counts
 * as seven and occupies two.
 *
 * @packageDocumentation
 */
/**
 * Measure the monospace display width of a string, in columns.
 *
 * Pure ASCII returns exactly `text.length`, so existing documents see no padding churn.
 *
 * Where `Intl.Segmenter` is unavailable the function falls back to iterating code points,
 * which still handles CJK, emoji and combining marks correctly and only misgroups ZWJ
 * sequences — degrading to a slight over-estimate rather than to `String.length`.
 *
 * @param text - The string to measure
 * @returns Width in monospace columns
 *
 * @example
 * ```ts
 * displayWidth("abc");   // 3
 * displayWidth("日本語"); // 6
 * displayWidth("é"); // 1 -- 'e' plus a combining acute
 * ```
 */
declare function displayWidth(text: string): number;

export { type SafeUrlOptions, type WidgetRange, type WrapSelectionMarkerMap, createWrapSelectionInputHandler, devWarn, displayWidth, isDevMode, isSafeUrl, resolveWidgetRange, safeUrl, shallowEqualRecord };
