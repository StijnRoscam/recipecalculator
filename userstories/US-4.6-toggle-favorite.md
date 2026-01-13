# US-4.6: Toggle Favorite

## Epic
Epic 4: Recipe Management

## User Story
**As a** user
**I want** to mark recipes as favorites
**So that** I can quickly access frequently used recipes

## Priority
Low

## Story Points
1

## Dependencies
- US-4.1: View All Recipes

---

## Acceptance Criteria

### AC-1: Toggle Action Access
- [ ] Star icon on recipe card
- [ ] Star icon on recipe detail page
- [ ] Click toggles favorite status

### AC-2: Visual Feedback
- [ ] Filled star = favorite
- [ ] Empty/outline star = not favorite
- [ ] Immediate visual update on click

### AC-3: Persistence
- [ ] Favorite status saved to database
- [ ] Status persists across sessions
- [ ] Status persists after app restart

### AC-4: Filter Integration
- [ ] Favorites filter works (from US-4.1)
- [ ] Toggling updates filter results in real-time

---

## Verification Steps

### Test 1: Toggle On
1. Click empty star on non-favorite recipe
2. **Verify**: Star becomes filled
3. **Verify**: No page reload needed

### Test 2: Toggle Off
1. Click filled star on favorite recipe
2. **Verify**: Star becomes empty

### Test 3: Persistence
1. Mark recipe as favorite
2. Refresh page
3. **Verify**: Still marked as favorite
4. Close and reopen app
5. **Verify**: Still marked as favorite

### Test 4: Toggle from Detail Page
1. Open recipe detail
2. Toggle favorite
3. **Verify**: Status changes
4. Go back to grid
5. **Verify**: Card reflects new status

### Test 5: Filter Update
1. Enable "Favorites only" filter
2. Toggle off a favorite
3. **Verify**: Recipe disappears from view
4. Disable filter
5. Toggle on a recipe
6. Enable filter
7. **Verify**: Recipe appears in favorites

---

## UI Mockup Description

```
Recipe Card:
+-------------------+
| ☆ Beef Stew      |  <- Empty star (not favorite)
| ...               |
+-------------------+

+-------------------+
| ★ Chicken Soup   |  <- Filled star (favorite)
| ...               |
+-------------------+

Detail Page Header:
+------------------------------------------+
| Beef Stew                    [☆] [Edit]  |
+------------------------------------------+
```

---

## Technical Notes

- IPC: `recipes:toggleFavorite(id: string)`
- Returns updated recipe
- Simple boolean flip in database

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Instant visual feedback
- [ ] Code reviewed
