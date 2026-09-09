# C-034 — Decorate every visible range

> Status: Complete
> Last verified: 2026-09-09 · base commit `77e34a2` plus C-033

## Problem

The visible-tree iterator marked the shared Document ancestor as seen and pruned it
in every later range. Tables and headings after a Mermaid block or a viewport gap could
remain raw Markdown indefinitely, despite parsing having completed.

## Change

Track whether a visited node still has visible descendants to traverse. Repeated open
ancestors skip their duplicate enter callback but allow traversal; pruned and completed
subtrees remain skipped. Defer leave callbacks until the final intersecting range so
nesting stays balanced. Iteration remains bounded to visible source ranges.

## Verification

Pluma's wrapped-table fixtures after a diagram failed to render with the original
iterator. They now render and pass native pointer, caret, typing, undo, and scroll
assertions at 100 KB, 500 KB, and 1 MB, with no measurement warnings during real scrolling.
A focused Bun assertion script against the actual iterator also checked later ranges,
unique callbacks, balanced nesting, omitted gaps, and explicitly pruned ancestors. The
original iterator failed that same script by omitting the later paragraph.
