import { EditorSelection, Prec, type SelectionRange } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

/**
 * Table cells use CSS table layout rather than CodeMirror's inline line layout.
 * Ask the browser which text was hit, then map that DOM boundary to source.
 * @param view The editor containing the gesture.
 * @param event The current pointer coordinates.
 * @returns A source caret with its visual side, or null when no editable boundary was hit.
 */
function pointerPosition(view: EditorView, event: MouseEvent): SelectionRange | null {
  const document = view.contentDOM.ownerDocument;
  const hit = document.elementFromPoint(event.clientX, event.clientY);
  const cell = hit?.closest(".cm-draftly-table-cell");
  if (cell && !cell.textContent?.trim()) {
    const from = view.posAtDOM(cell, 0);
    const to = view.posAtDOM(cell, cell.childNodes.length);
    return EditorSelection.cursor(Math.floor((from + to) / 2), 1);
  }
  let x = event.clientX;
  let y = event.clientY;
  // Pick the visual line before choosing text within it. Euclidean distance can
  // favor a longer line above a click in the blank tail of a short wrapped line.
  if (cell) {
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    let text = walker.nextNode();
    let nearest: DOMRect | null = null;
    let horizontalDistance = Infinity;
    let verticalDistance = Infinity;
    while (text) {
      if (text.textContent?.length) {
        const textRange = document.createRange();
        textRange.selectNodeContents(text);
        for (const rect of textRange.getClientRects()) {
          if (!rect.width || !rect.height) continue;
          const dx = Math.max(rect.left - x, 0, x - rect.right);
          const dy = Math.max(rect.top - y, 0, y - rect.bottom);
          if (dy < verticalDistance || (dy === verticalDistance && dx < horizontalDistance)) {
            nearest = rect;
            verticalDistance = dy;
            horizontalDistance = dx;
          }
        }
      }
      text = walker.nextNode();
    }
    if (nearest && (verticalDistance > 0 || horizontalDistance > 0)) {
      x = Math.max(nearest.left + 0.1, Math.min(x, nearest.right - 0.1));
      y = Math.max(nearest.top + 0.1, Math.min(y, nearest.bottom - 0.1));
    }
  }
  const range = document.caretRangeFromPoint(x, y);
  if (range && view.contentDOM.contains(range.startContainer) && (!cell || cell.contains(range.startContainer))) {
    let assoc = 1;
    if (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
      const before = document.createRange();
      before.setStart(range.startContainer, range.startOffset - 1);
      before.setEnd(range.startContainer, range.startOffset);
      // Keep a line-tail caret beside the preceding glyph, not the next wrapped
      // line or hidden cell padding. At a wrapped line's start, use the next glyph.
      if (Array.from(before.getClientRects()).some((rect) => rect.height && y >= rect.top && y <= rect.bottom)) {
        assoc = -1;
      }
    }
    return EditorSelection.cursor(view.posAtDOM(range.startContainer, range.startOffset), assoc);
  }
  if (cell && view.contentDOM.contains(cell)) {
    const rect = cell.getBoundingClientRect();
    const end = event.clientX > (rect.left + rect.right) / 2;
    return EditorSelection.cursor(view.posAtDOM(cell, end ? cell.childNodes.length : 0), end ? -1 : 1);
  }
  try {
    const position = view.posAtCoords({ x: event.clientX, y: event.clientY });
    return position === null ? null : EditorSelection.cursor(position);
  } catch {
    return null;
  }
}

/**
 * Keeps the native hit boundary stable when revealing Markdown changes layout.
 * CodeMirror still owns drag tracking, autoscroll, and transaction dispatch.
 */
export const tablePointerSelection = Prec.highest(
  EditorView.mouseSelectionStyle.of((view, event) => {
    if (
      event.button !== 0 ||
      !(event.target instanceof Element) ||
      !event.target.closest(".cm-draftly-table-cell") ||
      event.target.closest("button, a, [contenteditable=false]")
    ) {
      return null;
    }
    const hit = pointerPosition(view, event);
    if (hit === null) return null;
    let start = hit;
    let original = view.state.selection;
    const initialX = event.clientX;
    const initialY = event.clientY;
    const granularity = Math.min(event.detail, 3);
    const rangeAt = (position: SelectionRange): SelectionRange => {
      if (granularity === 2) return view.state.wordAt(position.head) ?? position;
      if (granularity === 3) {
        const line = view.state.doc.lineAt(position.head);
        return EditorSelection.range(line.from, line.to);
      }
      return position;
    };
    return {
      get(current, extend, multiple) {
        const moved = current.clientX !== initialX || current.clientY !== initialY;
        const position = moved ? (pointerPosition(view, current) ?? start) : start;
        const first = rangeAt(start);
        const last = rangeAt(position);
        const anchor = extend ? original.main.anchor : position.head < start.head ? first.to : first.from;
        const head = position.head < start.head ? last.from : last.to;
        const selection =
          anchor === head ? EditorSelection.cursor(head, last.assoc) : EditorSelection.range(anchor, head);
        return multiple ? original.addRange(selection) : EditorSelection.create([selection]);
      },
      update(update) {
        if (update.docChanged) {
          start = start.map(update.changes);
          original = original.map(update.changes);
        }
        // Reusing the initial DOM coordinates after a decoration update would hit a
        // different cell. Only actual pointer movement should perform another hit test.
      },
    };
  })
);
