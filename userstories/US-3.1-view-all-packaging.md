# US-3.1: View All Packaging Materials

## Epic
Epic 3: Packaging Materials Management

## User Story
**As a** user
**I want** to see all packaging materials
**So that** I can manage my packaging inventory

## Priority
High (MVP)

## Story Points
3

## Dependencies
- US-1.1: Application Launch
- US-9.1: Navigate Between Sections

---

## Acceptance Criteria

### AC-1: Packaging Page Access
- [ ] Packaging page accessible from main navigation
- [ ] URL is clear (e.g., `/packaging`)
- [ ] Page has clear title "Packaging" or "Packaging Materials"

### AC-2: Packaging List Display
- [ ] Packaging materials displayed in table/list format
- [ ] List shows: name, unit price, unit type, supplier
- [ ] List sorted alphabetically by name
- [ ] Empty state message when no packaging exists

### AC-3: Column Information
- [ ] Name column: displays packaging name
- [ ] Price column: displays price with currency (EUR)
- [ ] Unit Type column: displays piece, meter, roll, sheet, box, or bag
- [ ] Supplier column: displays supplier or "-" if empty

### AC-4: Archived Handling
- [ ] Archived items have visual distinction
- [ ] Toggle to show/hide archived items
- [ ] Default: archived items hidden

### AC-5: Actions
- [ ] Edit action for each item
- [ ] Delete action for each item
- [ ] Archive/Unarchive action for each item
- [ ] "Add Packaging" button visible

### AC-6: Search
- [ ] Search input to filter by name
- [ ] Case-insensitive search
- [ ] Debounced (300ms)

---

## Verification Steps

### Test 1: Empty State
1. Ensure no packaging materials in database
2. Navigate to Packaging page
3. **Verify**: Empty state message displayed
4. **Verify**: "Add Packaging" button visible

### Test 2: Display Packaging Materials
1. Create packaging materials:
   - "Vacuum Bag Small" - €0.15/piece - Supplier A
   - "Butcher Paper" - €2.50/roll - (no supplier)
   - "Styrofoam Tray" - €0.25/piece - Supplier B
2. Navigate to Packaging page
3. **Verify**: All 3 items visible
4. **Verify**: Prices show with EUR symbol
5. **Verify**: Unit types displayed correctly

### Test 3: Alphabetical Order
1. **Verify**: Order is: Butcher Paper, Styrofoam Tray, Vacuum Bag Small

### Test 4: Search Functionality
1. Type "vacuum" in search
2. **Verify**: Only "Vacuum Bag Small" visible
3. Clear search
4. **Verify**: All items visible again

### Test 5: Archived Filter
1. Archive "Butcher Paper"
2. **Verify**: Butcher Paper hidden (default filter)
3. Enable "Show archived"
4. **Verify**: Butcher Paper visible with archived styling

### Test 6: Navigation Actions
1. Click edit on an item
2. **Verify**: Navigates to edit page
3. Go back
4. Click "Add Packaging"
5. **Verify**: Navigates to create page

---

## UI Mockup Description

```
+--------------------------------------------------+
| Packaging                      [+ Add Packaging]  |
+--------------------------------------------------+
| Search: [_____________]     [x] Show archived     |
+--------------------------------------------------+
| Name              | Price  | Unit   | Supplier   |
|-------------------|--------|--------|------------|
| Butcher Paper     | €2.50  | roll   | -          | [Edit][Archive][Delete]
| Styrofoam Tray    | €0.25  | piece  | Supplier B | [Edit][Archive][Delete]
| Vacuum Bag Small  | €0.15  | piece  | Supplier A | [Edit][Archive][Delete]
+--------------------------------------------------+
```

---

## Technical Notes

- IPC call: `packaging:getAll(includeArchived: boolean)`
- Reuse table component from materials list
- Unit types: piece, meter, roll, sheet, box, bag

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Consistent styling with materials page
- [ ] Code reviewed
