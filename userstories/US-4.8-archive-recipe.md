# US-4.8: Archive Recipe

## Epic
Epic 4: Recipe Management

## User Story
**As a** user
**I want** to archive old recipes
**So that** I can hide them without losing data

## Priority
Low

## Story Points
1

## Dependencies
- US-4.1: View All Recipes

---

## Acceptance Criteria

### AC-1: Archive Action
- [ ] Available from card actions menu
- [ ] Available from detail page
- [ ] No confirmation needed (safe action)

### AC-2: Unarchive Action
- [ ] Available for archived recipes
- [ ] Same location as archive action

### AC-3: Archived Behavior
- [ ] Hidden by default in recipes grid
- [ ] Visual distinction when shown
- [ ] Data preserved (can unarchive)

### AC-4: Filter
- [ ] Toggle to show/hide archived
- [ ] Count of archived recipes shown

---

## Verification Steps

### Test 1: Archive Recipe
1. Archive "Old Recipe"
2. **Verify**: Recipe disappears (filter hides it)

### Test 2: Show Archived
1. Enable "Show archived"
2. **Verify**: Archived recipe visible
3. **Verify**: Has archived styling

### Test 3: Unarchive
1. Unarchive recipe
2. Disable "Show archived"
3. **Verify**: Recipe still visible (now active)

### Test 4: Persistence
1. Archive recipe
2. Refresh
3. **Verify**: Still archived

---

## Technical Notes

- IPC: `recipes:archive(id: string)`
- Sets `is_archived = true`

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Code reviewed
