# US-1.2: Language Selection

## Epic
Epic 1: Application Setup

## User Story
**As a** Dutch or English speaking user
**I want** to switch the application language
**So that** I can use the app in my preferred language

## Priority
Medium

## Story Points
3

## Dependencies
- US-1.1: Application Launch
- US-9.1: Navigate Between Sections (for language selector placement)

---

## Acceptance Criteria

### AC-1: Language Selector Visibility
- [ ] Language selector is visible in the navigation header
- [ ] Current language is clearly indicated
- [ ] Selector shows available languages (English, Dutch)

### AC-2: Supported Languages
- [ ] English (en) is fully supported
- [ ] Dutch (nl) is fully supported
- [ ] Default language is English

### AC-3: Language Switching
- [ ] Clicking a language option changes the UI language immediately
- [ ] No page reload required
- [ ] All visible text updates to selected language

### AC-4: Language Persistence
- [ ] Selected language is saved to localStorage
- [ ] Language preference survives application restart
- [ ] Language is restored on next launch

### AC-5: Translation Coverage
- [ ] All navigation items are translated
- [ ] All form labels are translated
- [ ] All button texts are translated
- [ ] All error messages are translated
- [ ] All validation messages are translated
- [ ] All page titles are translated

---

## Verification Steps

### Test 1: Default Language
1. Clear localStorage (fresh state)
2. Launch the application
3. **Verify**: UI displays in English

### Test 2: Switch to Dutch
1. Click the language selector
2. Select "Nederlands" (Dutch)
3. **Verify**: All UI text changes to Dutch immediately
4. **Verify**: Navigation shows Dutch labels
5. **Verify**: Any visible forms show Dutch labels

### Test 3: Switch Back to English
1. While in Dutch, click the language selector
2. Select "English"
3. **Verify**: All UI text changes back to English

### Test 4: Persistence
1. Set language to Dutch
2. Close the application completely
3. Relaunch the application
4. **Verify**: UI displays in Dutch

### Test 5: Translation Completeness - Navigation
1. Switch to Dutch
2. **Verify**: Home = "Home" or "Startpagina"
3. **Verify**: Materials = "Materialen"
4. **Verify**: Packaging = "Verpakking"
5. **Verify**: Recipes = "Recepten"
6. **Verify**: Settings = "Instellingen"

### Test 6: Translation Completeness - Common Actions
1. Navigate to any form
2. Switch between languages
3. **Verify**: Save button text changes
4. **Verify**: Cancel button text changes
5. **Verify**: Delete button text changes

### Test 7: Form Validation Messages
1. Navigate to create material form
2. Submit with empty name
3. **Verify**: Error message is in current language
4. Switch language
5. Trigger same error
6. **Verify**: Error message is in new language

---

## Translation Keys Required

```
common:
  - navigation.home
  - navigation.materials
  - navigation.packaging
  - navigation.recipes
  - navigation.settings
  - actions.save
  - actions.cancel
  - actions.delete
  - actions.edit
  - actions.create
  - actions.search
  - actions.archive
  - validation.required
  - validation.invalidPrice
  - status.loading
  - status.error
  - status.success

materials:
  - title
  - form.name
  - form.price
  - form.unit
  - form.supplier
  - form.sku
  - form.notes

recipes:
  - title
  - form.name
  - form.description
  - form.yieldQuantity
  - form.yieldUnit
  - form.prepTime
  - form.profitMargin
  - form.wastePercentage
  - form.vatPercentage

packaging:
  - title
  - form.name
  - form.unitPrice
  - form.unitType

settings:
  - title
  - laborRate
  - defaultVatRate
```

---

## Technical Notes

- Use react-i18next for internationalization
- Store language preference in localStorage key: `language`
- Translation files location: `src/renderer/i18n/{locale}/*.json`
- Use namespace-based translation loading for code splitting

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] Both languages have 100% translation coverage
- [ ] No missing translation warnings in console
- [ ] Code reviewed
