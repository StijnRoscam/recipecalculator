# US-2.6: Archive Material

## Epic
Epic 2: Source Materials Management

## User Story
**As a** user
**I want** to archive a material instead of deleting it
**So that** existing recipes using it still work

## Priority
Medium

## Story Points
2

## Dependencies
- US-2.1: View All Materials

---

## Acceptance Criteria

### AC-1: Archive Action
- [ ] Archive action is available for each non-archived material
- [ ] Archive action is distinguishable from delete
- [ ] Archive does not require confirmation (safe action)

### AC-2: Unarchive Action
- [ ] Unarchive action available for archived materials
- [ ] Same location/style as archive action
- [ ] Unarchive does not require confirmation

### AC-3: Archived Material Behavior
- [ ] Archived materials are hidden by default in materials list
- [ ] Archived materials remain functional in existing recipes
- [ ] Archived materials can still be viewed in recipe ingredients
- [ ] Archived materials have visual distinction when shown

### AC-4: Archive Toggle/Filter
- [ ] Toggle or filter to show/hide archived materials
- [ ] Clear indication of current filter state
- [ ] Count of archived materials shown (optional)

### AC-5: Instant Feedback
- [ ] Material immediately reflects archived state
- [ ] If filter hides archived, material disappears from view
- [ ] Success message confirms action

### AC-6: Adding Archived Materials to Recipes
- [ ] Archived materials do NOT appear in "add ingredient" dialogs
- [ ] Only active (non-archived) materials are selectable for new ingredients

---

## Verification Steps

### Test 1: Archive a Material
1. Navigate to Materials page
2. Click archive on "Beef" (non-archived material)
3. **Verify**: Success message "Material archived"
4. **Verify**: If "Show archived" is off, Beef disappears from list

### Test 2: View Archived Materials
1. Archive a material
2. Enable "Show archived" filter
3. **Verify**: Archived material appears
4. **Verify**: Archived material has visual distinction (grayed, badge, etc.)

### Test 3: Unarchive a Material
1. With "Show archived" enabled
2. Click unarchive on an archived material
3. **Verify**: Success message "Material restored" or "Material unarchived"
4. **Verify**: Material no longer has archived styling
5. Disable "Show archived"
6. **Verify**: Material is still visible (now active)

### Test 4: Archived Material in Recipe
1. Create material "Test Archive Ingredient"
2. Create recipe with "Test Archive Ingredient"
3. Archive "Test Archive Ingredient"
4. View the recipe
5. **Verify**: Ingredient still shows in recipe
6. **Verify**: Costs still calculate correctly

### Test 5: Can't Add Archived Material to Recipe
1. Archive "Test Archive Ingredient"
2. Create a new recipe
3. Open "Add Ingredient" dialog
4. Search for "Test Archive"
5. **Verify**: "Test Archive Ingredient" does NOT appear in search results

### Test 6: Archived vs Delete
1. Create material used in a recipe
2. **Verify**: Cannot delete (blocked by recipe usage)
3. **Verify**: CAN archive (archive is always allowed)

### Test 7: Archive Count
1. Archive 3 materials
2. Navigate to Materials page with "Show archived" off
3. **Verify**: Some indication of hidden archived materials exists
   (e.g., "3 archived materials" or toggle label "Show 3 archived")

### Test 8: Persistence
1. Archive a material
2. Refresh the page
3. **Verify**: Material is still archived
4. Close and reopen app
5. **Verify**: Material is still archived

### Test 9: Edit Archived Material
1. Show archived materials
2. Click edit on an archived material
3. **Verify**: Can navigate to edit page
4. **Verify**: Can update the material
5. **Verify**: Material remains archived after edit

---

## UI Mockup Description

### Materials List with Archive Toggle
```
+--------------------------------------------------+
| Materials                        [+ Add Material] |
+--------------------------------------------------+
| Search: [_____________]                           |
|                                                   |
| [Show archived (3)]  (toggle or checkbox)         |
+--------------------------------------------------+
| Name            | Price    | Unit | Actions      |
|-----------------|----------|------|--------------|
| Beef            | €25.00   | kg   | [Archive]... |
| Chicken         | €12.00   | kg   | [Archive]... |
| Salt (archived) | €0.50    | kg   | [Unarchive]. |  <- grayed row
+--------------------------------------------------+
```

### Archive Action Variations
```
Option A: Text button
[Archive] / [Unarchive]

Option B: Icon button with tooltip
[📦] -> "Archive material"
[📦✓] -> "Unarchive material"

Option C: In dropdown menu
[⋮] -> Archive | Edit | Delete
```

---

## Technical Notes

- IPC call: `materials:archive(id: string)`
- Sets `is_archived = true` in database
- Unarchive: `materials:update(id, { isArchived: false })` or separate command
- Filter in get all: `materials:getAll(includeArchived: boolean)`

```typescript
// Archive endpoint
async function archiveMaterial(id: string): Promise<void> {
  db.run('UPDATE source_materials SET is_archived = 1 WHERE id = ?', [id]);
}

// Unarchive via update
async function updateMaterial(id: string, data: UpdateMaterialInput): Promise<Material> {
  // data.isArchived = false to unarchive
}
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Archived materials work in existing recipes
- [ ] Archived materials excluded from new ingredient dialogs
- [ ] Code reviewed
