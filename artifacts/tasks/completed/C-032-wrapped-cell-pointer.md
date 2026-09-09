# C-032 — Wrapped table cell blank-space clicks

> Status: Complete
> Last verified: 2026-09-09 · base commit `ef273c7`

## Problem

Clicking the blank tail after a short wrapped line can select the longer line above.
The existing padding clamp ranks rectangles by Euclidean distance, which lets the
horizontal distance outweigh the user's vertical line choice.

## Change

Rank visible text rectangles by vertical distance first, then horizontal distance.
Retain native caret hit testing and CodeMirror's selection gesture ownership.

## Verification

The supplied cancelled-payment cell failed at source offset 83 instead of 91 before
the fix. Six Pluma renderer tests now pass: both themes, intermediate line ends,
bottom padding after scrolling, drag/Shift selection, and explicit `<br />` breaks.
The isolated native Electron smoke also verifies exact final-line insertion.
Library typecheck, clean dist build, and scoped Biome error checks pass.
