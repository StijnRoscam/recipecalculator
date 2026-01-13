# US-2.1: View All Materials

## Epic
Epic 2: Source Materials Management

## User Story
**As a** butcher
**I want** to see a list of all my source materials
**So that** I can manage my inventory of raw ingredients

## Priority
High (MVP)

## Story Points
5

## Dependencies
- US-1.1: Application Launch
- US-9.1: Navigate Between Sections

---

## Acceptance Criteria

### AC-1: Materials List Display
- [ ] Materials page is accessible from navigation
- [ ] Materials are displayed in a table/list format
- [ ] List shows: name, current price, unit of measure, supplier
- [ ] List is sorted alphabetically by name (default)
- [ ] Empty state message when no materials exist

### AC-2: Material Information Columns
- [ ] Name column: displays material name
- [ ] Price column: displays price with currency symbol (EUR)
- [ ] Unit column: displays "kg" or "g"
- [ ] Supplier column: displays supplier name or "-" if empty

### AC-3: Archived Materials Handling
- [ ] Archived materials have visual distinction (grayed out, badge, or strikethrough)
- [ ] Toggle/filter to show/hide archived materials
- [ ] Default: archived materials are hidden
- [ ] Clear indication of how many archived materials exist (if any)

### AC-4: Actions Per Material
- [ ] Each row has an edit action (navigates to edit page)
- [ ] Each row has a delete action (with confirmation)
- [ ] Each row has an archive/unarchive action

### AC-5: Create Material Access
- [ ] "Add Material" or "New Material" button is visible
- [ ] Button navigates to create material page

### AC-6: Responsive Layout
- [ ] Table is readable on smaller screens
- [ ] Columns can be scrolled horizontally if needed
- [ ] Actions remain accessible

---

## Verification Steps

### Test 1: Empty State
1. Ensure database has no materials
2. Navigate to Materials page
3. **Verify**: Empty state message is displayed
4. **Verify**: "Add Material" button is visible

### Test 2: Materials Display
1. Create 3 test materials via database or API:
   - "Beef Tenderloin" - 25.00 EUR/kg - Supplier A
   - "Pork Chops" - 12.50 EUR/kg - (no supplier)
   - "Salt" - 0.50 EUR/kg - Supplier B
2. Navigate to Materials page
3. **Verify**: All 3 materials are visible
4. **Verify**: Correct prices are shown with EUR symbol
5. **Verify**: Units are displayed correctly
6. **Verify**: Supplier shows "-" for Pork Chops

### Test 3: Alphabetical Sorting
1. With materials from Test 2
2. **Verify**: Order is: Beef Tenderloin, Pork Chops, Salt

### Test 4: Archived Materials - Hidden by Default
1. Archive "Salt" material
2. Navigate to Materials page (or refresh)
3. **Verify**: Only Beef Tenderloin and Pork Chops visible
4. **Verify**: Filter/toggle indicates archived materials exist

### Test 5: Archived Materials - Show All
1. Click "Show Archived" toggle/filter
2. **Verify**: Salt is now visible
3. **Verify**: Salt has visual distinction (grayed/badge)

### Test 6: Edit Navigation
1. Click edit action on "Beef Tenderloin"
2. **Verify**: Navigates to edit page for that material
3. **Verify**: URL contains the material ID

### Test 7: Create Navigation
1. Click "Add Material" button
2. **Verify**: Navigates to create material page
3. **Verify**: URL is `/materials/new` or similar

### Test 8: Large Dataset
1. Create 50+ materials
2. Navigate to Materials page
3. **Verify**: Page loads without performance issues
4. **Verify**: All materials are visible (or pagination works)

---

## UI Mockup Description

```
+--------------------------------------------------+
| Materials                        [+ Add Material] |
+--------------------------------------------------+
| [x] Show archived                                 |
+--------------------------------------------------+
| Name            | Price    | Unit | Supplier     |
|-----------------|----------|------|--------------|
| Beef Tenderloin | €25.00   | kg   | Supplier A   | [Edit] [Archive] [Delete]
| Pork Chops      | €12.50   | kg   | -            | [Edit] [Archive] [Delete]
| Salt (archived) | €0.50    | kg   | Supplier B   | [Edit] [Unarchive] [Delete]
+--------------------------------------------------+
```

---

## Technical Notes

- Use IPC call: `materials:getAll(includeArchived: boolean)`
- Consider virtualization for large lists (react-window)
- Use React Router for navigation to edit/create pages

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Loading state shown while fetching
- [ ] Error state handled gracefully
- [ ] Code reviewed
