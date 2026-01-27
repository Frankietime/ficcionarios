# Corrections 2 - Implementation Notes

## Changes Made

### General Actions
- **Save button alignment**: Changed from `flex-col` layout to `relative` positioning with `absolute` shortcut label. The label is now positioned below the button without affecting its vertical alignment relative to sibling buttons.
- **Delete button**: Changed from `variant="ghost" size="sm"` to `variant="destructive" size="icon"` so it matches the neobrutalism style (border, shadow, proper height) of other buttons while remaining icon-only and red.

### General Information
- **Tab trapping**: Implemented `onKeyDown` handler on the form container that intercepts Tab/Shift+Tab and cycles focus only through `input`, `textarea`, and `[role="combobox"]` (Radix Select trigger) elements within the form. Removed explicit `tabIndex` attributes since the trap handles navigation.
- **Language dropdowns**: Replaced native `<select>` elements with Radix UI `@radix-ui/react-select` wrapped in a neobrutalism-styled component (`client/src/components/ui/select.tsx`). Styling follows the neobrutalism.dev/docs/select reference: `border-2 border-border`, `shadow-brutal-sm`, proper focus ring, and item highlight on focus.

### Ficheros
- **Filter select**: Replaced native `<select>` with the new neobrutalism `Select` component for the terms/stories filter mode dropdown.
- **Layout stability**: Added a `ResizeObserver` that tracks the maximum observed height of the ficheros list container and sets it as `minHeight`. This prevents the viewport from jumping when filtering reduces visible items or when accordion items are collapsed.
- **Clear filter**: Added an X (cross) button inside the search input that appears when there is active filter text. Clicking it clears the filter.

## New Dependencies
- `@radix-ui/react-select` - Radix UI headless select primitive for accessible, neobrutalism-styled dropdowns.

## New Files
- `client/src/components/ui/select.tsx` - Neobrutalism Select component wrapping Radix UI primitives.

## Design Decision: Layout Stability
The min-height approach was chosen over alternatives (virtual scrolling, fixed-height containers) because it preserves natural content flow while preventing upward layout shift. The min-height only grows - it never shrinks during a session - so the user's scroll position remains stable during filtering, collapsing, and story selection changes.
