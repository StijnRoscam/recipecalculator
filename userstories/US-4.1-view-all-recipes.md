# US-4.1: View All Recipes

## Epic
Epic 4: Recipe Management

## User Story
**As a** user
**I want** to see all my recipes in a grid view
**So that** I can quickly browse and access them

## Priority
High (MVP)

## Story Points
5

## Dependencies
- US-1.1: Application Launch
- US-9.1: Navigate Between Sections

---

## Acceptance Criteria

### AC-1: Recipes Page Access
- [ ] Recipes page accessible from navigation
- [ ] URL: `/recipes`
- [ ] Page title: "Recipes"

### AC-2: Grid Display
- [ ] Recipes displayed as cards in a grid
- [ ] Responsive: 3 columns on desktop, 2 on tablet, 1 on mobile
- [ ] Cards have consistent sizing

### AC-3: Recipe Card Content
- [ ] Recipe name (prominent)
- [ ] Description (truncated if long)
- [ ] Total cost displayed
- [ ] Favorite indicator (star icon)
- [ ] Archived indicator if applicable

### AC-4: Card Actions
- [ ] View details action
- [ ] Edit action
- [ ] Duplicate action
- [ ] Toggle favorite action
- [ ] Archive/Unarchive action
- [ ] Delete action
- [ ] Actions in dropdown menu or visible buttons

### AC-5: Filtering
- [ ] Search by recipe name
- [ ] Filter by favorites only
- [ ] Toggle to show/hide archived
- [ ] Filters can combine

### AC-6: Empty States
- [ ] Message when no recipes exist
- [ ] Message when filters produce no results
- [ ] "Create Recipe" button always visible

### AC-7: Sorting
- [ ] Default: alphabetical by name
- [ ] Optional: sort by date created, cost, favorites first

---

## Verification Steps

### Test 1: Empty State
1. No recipes in database
2. Navigate to Recipes
3. **Verify**: "No recipes yet" message
4. **Verify**: "Create Recipe" button visible

### Test 2: Display Recipes
1. Create 3 recipes:
   - "Beef Stew" - cost €15.00
   - "Chicken Soup" - cost €8.00 - favorite
   - "Pork Roast" - cost €20.00
2. Navigate to Recipes
3. **Verify**: All 3 cards visible
4. **Verify**: Names displayed correctly
5. **Verify**: Costs displayed
6. **Verify**: Star on Chicken Soup

### Test 3: Card Actions Menu
1. Click actions menu on a card
2. **Verify**: Options shown: View, Edit, Duplicate, Favorite, Archive, Delete

### Test 4: Search
1. Type "beef" in search
2. **Verify**: Only "Beef Stew" visible
3. Clear search
4. **Verify**: All recipes visible

### Test 5: Favorites Filter
1. Enable "Favorites only" filter
2. **Verify**: Only "Chicken Soup" visible
3. Disable filter
4. **Verify**: All recipes visible

### Test 6: Archived Filter
1. Archive "Pork Roast"
2. **Verify**: Pork Roast hidden
3. Enable "Show archived"
4. **Verify**: Pork Roast visible with archived styling

### Test 7: Combined Filters
1. Have 2 favorites, 1 archived favorite
2. Filter: Favorites + Hide archived
3. **Verify**: Only non-archived favorites shown
4. Filter: Favorites + Show archived
5. **Verify**: All favorites shown

### Test 8: View Navigation
1. Click on a recipe card (or View action)
2. **Verify**: Navigates to recipe detail page

### Test 9: Responsive Layout
1. View on desktop width
2. **Verify**: 3 cards per row
3. Resize to tablet width
4. **Verify**: 2 cards per row
5. Resize to mobile width
6. **Verify**: 1 card per row

---

## UI Mockup Description

```
+------------------------------------------------------------------+
| Recipes                                      [+ Create Recipe]    |
+------------------------------------------------------------------+
| Search: [___________]  [★ Favorites only]  [Show archived]        |
+------------------------------------------------------------------+
|                                                                   |
| +-------------------+ +-------------------+ +-------------------+ |
| | ★ Chicken Soup   | | Beef Stew         | | Pork Roast       | |
| |                   | |                   | |                   | |
| | A delicious       | | Hearty stew with  | | Slow roasted     | |
| | soup made with... | | tender beef...    | | pork with...     | |
| |                   | |                   | |                   | |
| | Total: €8.00      | | Total: €15.00     | | Total: €20.00    | |
| |                   | |                   | |                   | |
| | [View] [Edit] [⋮] | | [View] [Edit] [⋮] | | [View] [Edit] [⋮]| |
| +-------------------+ +-------------------+ +-------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Technical Notes

- IPC: `recipes:getAll(includeArchived: boolean)`
- Returns `RecipeWithDetails[]` including cost calculations
- Use CSS Grid for responsive layout
- Consider lazy loading for large recipe counts

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Responsive grid layout works
- [ ] Loading state during fetch
- [ ] Code reviewed
