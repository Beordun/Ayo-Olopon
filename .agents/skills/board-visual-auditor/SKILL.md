---
name: board-visual-auditor
description: >-
  Use this skill to audit, inspect, and verify the visual styling, DOM clustering performance,
  responsive layout, and cultural woodworking aesthetics of the Ayò Ọlọ́pọ́n board interface.
---

# Board Visual & Performance Auditor Skill

This skill provides a systematic protocol to inspect visual fidelity, DOM node counts, and mobile ergonomics for `components/AyoBoard.tsx` and `components/OmoAyo.tsx`.

## Key Inspection Areas

### 1. Organic Seed Clustering Performance (<5 vs $\ge 5$)
- **Pits with 0 seeds**:
  - Assert that no `0` badge or pebble DOM element exists:
    ```javascript
    // In browser DevTools console:
    const emptyPits = document.querySelectorAll('[data-pit-count="0"]');
    emptyPits.forEach(p => console.assert(!p.querySelector('.seed-badge'), '0-seed badge found!'));
    ```
- **Pits with 1 to 4 seeds**:
  - Verify that each seed is rendered as an organic rounded pebble SVG with rotational jitter (`-15deg` to `+15deg`).
- **Pits with $\ge 5$ seeds**:
  - Verify that the DOM does NOT instantiate dozens of individual nodes:
    ```javascript
    // Ensure pit never exceeds 3 pebble elements + 1 badge
    const pitPebbles = document.querySelectorAll('[data-pit-index="2"] .pebble-svg');
    console.assert(pitPebbles.length <= 3, 'DOM node bloat in accumulator pit!');
    ```

### 2. Spatial Orientation & Row Inversion
- Verify that North row pits are rendered left-to-right as **`[11, 10, 9, 8, 7, 6]`**.
- Verify that South row pits are rendered left-to-right as **`[0, 1, 2, 3, 4, 5]`**.
- Confirm that *Ojú-oró* storehouses are positioned on the West (Left, North) and East (Right, South) wooden margins.

### 3. Touch Target Invariant ($\ge 48\text{px} \times 48\text{px}$)
- In mobile viewports ($375\text{px}$ to $768\text{px}$ width), verify each hollow (*Ihò*) maintains an interactive hit-box of at least $48\text{px} \times 48\text{px}$.

See [references/styling_checklist.md](./references/styling_checklist.md) for responsive breakpoint checklists.
