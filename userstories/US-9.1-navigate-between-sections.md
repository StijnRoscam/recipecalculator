# US-9.1: Navigate Between Sections

## Epic
Epic 9: Navigation & UX

## User Story
**As a** user
**I want** clear navigation between app sections
**So that** I can easily move between materials, recipes, packaging, and settings

## Priority
High (MVP)

## Story Points
3

## Dependencies
- US-1.1: Application Launch

---

## Acceptance Criteria

### AC-1: Navigation Header
- [ ] Sticky header visible on all pages
- [ ] Contains navigation links
- [ ] App name/logo visible

### AC-2: Navigation Links
- [ ] Home
- [ ] Materials
- [ ] Packaging
- [ ] Recipes
- [ ] Settings

### AC-3: Active State
- [ ] Current page link is highlighted
- [ ] Visual distinction (bold, underline, color)

### AC-4: Responsive
- [ ] Works on all screen sizes
- [ ] Hamburger menu on mobile (optional)

### AC-5: Language Selector
- [ ] Language selector in header
- [ ] See US-1.2 for details

---

## Verification Steps

### Test 1: Navigation Presence
1. Launch app
2. **Verify**: Header visible
3. **Verify**: All 5 nav links present

### Test 2: Navigation Works
1. Click Materials
2. **Verify**: Materials page loads
3. Click Recipes
4. **Verify**: Recipes page loads
5. Repeat for all links

### Test 3: Active State
1. Navigate to Materials
2. **Verify**: Materials link highlighted
3. Navigate to Recipes
4. **Verify**: Recipes link highlighted
5. **Verify**: Materials link no longer highlighted

### Test 4: Sticky Header
1. Navigate to page with scrollable content
2. Scroll down
3. **Verify**: Header remains visible at top

### Test 5: Direct URL Access
1. Type `/recipes` in URL bar
2. **Verify**: Recipes page loads
3. **Verify**: Recipes nav link highlighted

---

## UI Mockup Description

```
+------------------------------------------------------------------+
| [Logo] ButcherCalc  | Home | Materials | Packaging | Recipes | Settings | [EN ▼] |
+------------------------------------------------------------------+
                        ^^^^
                        Active (when on Home)
```

```
Mobile (collapsed):
+------------------------------------------------------------------+
| [Logo] ButcherCalc                                      [☰] [EN] |
+------------------------------------------------------------------+
```

---

## Technical Notes

- Use React Router for navigation
- NavLink component for active state handling
- TailwindCSS for styling

```tsx
<NavLink
  to="/materials"
  className={({ isActive }) =>
    isActive ? 'text-blue-600 font-bold' : 'text-gray-600'
  }
>
  Materials
</NavLink>
```

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Consistent on all pages
- [ ] Accessible (keyboard navigation)
- [ ] Code reviewed
