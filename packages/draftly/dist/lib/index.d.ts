import { Extension } from '@codemirror/state';

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

export { type WrapSelectionMarkerMap, createWrapSelectionInputHandler };
