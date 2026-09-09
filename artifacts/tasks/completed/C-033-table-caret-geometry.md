# C-033 — Table caret geometry and scrolling

> Status: Complete
> Last verified: 2026-09-09 · base commit `77e34a2`

## Problem

Blank-cell-tail clicks can insert at the correct source offset while drawing a zero-height
caret at the table edge. Typing then scrolls toward the hidden padding rectangle.
The previous source-only assertions missed this regression.

## Approach

Preserve the native caret's association with visible text, including soft line wraps.
Extend the existing deferred selection repair to correct association at cell boundaries
following typing and keyboard commands, without changing valid source offsets.

## Acceptance

Independent DOM glyph/cursor rectangles agree after clicks and typing; visible-table
interactions preserve editor and window scroll offsets. Cover padding, wrapped/empty/
aligned cells, keyboard edits, long documents, both themes, and packaged Electron.

## Evidence

On the reproduction, association 0 gave a zero-height cursor at the cell edge. Association
-1 returned the visible text's 22px-high rectangle. Two typed characters moved scrollTop
467 → 287 before the fix and retained 467 after it. The focused wrapped-cell, padding, empty/aligned-cell, keyboard, multi-caret, and
undo regressions pass, including native Electron input after an editor state reload.
Long-document coverage additionally exercises the visible-range traversal fix in C-034.


## Lifecycle

Some native input transactions map selection without explicitly setting it. Repair also
runs after document changes and syntax-tree advancement. `EditorView.setState()` destroys
and recreates plugins on the same view; `onViewReady` removes that view from the teardown
WeakSet and schedules an initial repair. Otherwise an editor reload permanently disables
repairs despite native pointer hit-testing still returning the right source position.
