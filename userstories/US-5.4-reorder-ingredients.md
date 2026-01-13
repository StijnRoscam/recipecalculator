# US-5.4: Reorder Ingredients

## Epic
Epic 5: Ingredients Management

## User Story
**As a** user
**I want** to reorder ingredients
**So that** I can organize them logically

## Priority
Low

## Story Points
3

## Dependencies
- US-5.1: Add Ingredient to Recipe

---

## Acceptance Criteria

### AC-1: Drag Handle
- [ ] Drag handle visible on each ingredient row
- [ ] Handle indicates draggability (≡ or grip icon)

### AC-2: Drag and Drop
- [ ] Click and hold to drag
- [ ] Visual feedback during drag
- [ ] Drop to reposition

### AC-3: Visual Feedback
- [ ] Highlight drop position
- [ ] Dragged item visually distinct

### AC-4: Persistence
- [ ] New order saved to database
- [ ] Order preserved on reload

---

## Verification Steps

### Test 1: Drag to Reorder
1. Ingredients in order: A, B, C
2. Drag C to first position
3. **Verify**: Order now: C, A, B

### Test 2: Visual Feedback
1. Start dragging
2. **Verify**: Dragged item highlighted
3. Move over positions
4. **Verify**: Drop zones indicated

### Test 3: Persistence
1. Reorder ingredients
2. Save recipe
3. Reload page
4. **Verify**: New order maintained

### Test 4: Cancel Drag
1. Start dragging
2. Press Escape or drop in original position
3. **Verify**: Order unchanged

---

## UI Mockup Description

```
INGREDIENTS (≡ = drag handle)
+--------------------------------------------------------------+
| [≡] | Beef Chuck    | 2 kg | €50.00 |                   [x] |
| [≡] | Carrots       | 0.5kg| €1.00  |                   [x] |
| [≡] | Onions        | 0.3kg| €0.60  |                   [x] |
+--------------------------------------------------------------+

During drag:
+--------------------------------------------------------------+
| ════════════════════════════════════════════════════════════ | <- drop indicator
| [≡] | Carrots       | 0.5kg| €1.00  |                   [x] |
| [≡] | Beef Chuck    | 2 kg | €50.00 |     (dragging)        |
| [≡] | Onions        | 0.3kg| €0.60  |                   [x] |
+--------------------------------------------------------------+
```

---

## Technical Notes

- Use react-beautiful-dnd or @dnd-kit/sortable
- IPC: `ingredients:reorder(recipeId, ingredientIds: string[])`
- Update sort_order column for all affected ingredients

```typescript
// Frontend
onDragEnd(result) {
  const newOrder = reorder(items, result.source.index, result.destination.index);
  setItems(newOrder);
  api.ingredients.reorder(recipeId, newOrder.map(i => i.id));
}
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Smooth drag experience
- [ ] Works on touch devices (optional)
- [ ] Code reviewed
