'use strict';

var state = require('@codemirror/state');
var view = require('@codemirror/view');

// src/lib/input-handler.ts
function createWrapSelectionInputHandler(markersByInput) {
  return view.EditorView.inputHandler.of((view, _from, _to, text) => {
    const marker = markersByInput[text];
    if (!marker) {
      return false;
    }
    const ranges = view.state.selection.ranges;
    if (ranges.length === 0 || ranges.some((range) => range.empty)) {
      return false;
    }
    const changes = ranges.map((range) => ({
      from: range.from,
      to: range.to,
      insert: `${marker}${view.state.sliceDoc(range.from, range.to)}${marker}`
    })).reverse();
    const nextRanges = ranges.map((range) => state.EditorSelection.range(range.from + marker.length, range.to + marker.length));
    view.dispatch({
      changes,
      selection: state.EditorSelection.create(nextRanges, view.state.selection.mainIndex)
    });
    return true;
  });
}

exports.createWrapSelectionInputHandler = createWrapSelectionInputHandler;
//# sourceMappingURL=chunk-7HUCJHMI.cjs.map
//# sourceMappingURL=chunk-7HUCJHMI.cjs.map