# User Stories Index

This folder contains all user stories for the ButcherCalculator Electron/React port.

## Overview

- **Total User Stories**: 28
- **Epics**: 9
- **Estimated Total Story Points**: ~85

---

## Epic 1: Application Setup (8 points)

| ID | Story | Priority | Points | Status |
|----|-------|----------|--------|--------|
| [US-1.1](./US-1.1-application-launch.md) | Application Launch | High | 5 | To Do |
| [US-1.2](./US-1.2-language-selection.md) | Language Selection | Medium | 3 | To Do |

---

## Epic 2: Source Materials Management (20 points)

| ID | Story | Priority | Points | Status |
|----|-------|----------|--------|--------|
| [US-2.1](./US-2.1-view-all-materials.md) | View All Materials | High | 5 | To Do |
| [US-2.2](./US-2.2-search-materials.md) | Search Materials | High | 2 | To Do |
| [US-2.3](./US-2.3-create-material.md) | Create Material | High | 5 | To Do |
| [US-2.4](./US-2.4-edit-material.md) | Edit Material | High | 3 | To Do |
| [US-2.5](./US-2.5-delete-material.md) | Delete Material | High | 2 | To Do |
| [US-2.6](./US-2.6-archive-material.md) | Archive Material | Medium | 2 | To Do |

---

## Epic 3: Packaging Materials Management (9 points)

| ID | Story | Priority | Points | Status |
|----|-------|----------|--------|--------|
| [US-3.1](./US-3.1-view-all-packaging.md) | View All Packaging Materials | High | 3 | To Do |
| [US-3.2](./US-3.2-create-packaging.md) | Create Packaging Material | High | 3 | To Do |
| [US-3.3](./US-3.3-edit-packaging.md) | Edit Packaging Material | High | 2 | To Do |
| [US-3.4](./US-3.4-delete-packaging.md) | Delete Packaging Material | Medium | 2 | To Do |

---

## Epic 4: Recipe Management (30 points)

| ID | Story | Priority | Points | Status |
|----|-------|----------|--------|--------|
| [US-4.1](./US-4.1-view-all-recipes.md) | View All Recipes | High | 5 | To Do |
| [US-4.2](./US-4.2-create-recipe.md) | Create Recipe | High | 5 | To Do |
| [US-4.3](./US-4.3-view-recipe-details.md) | View Recipe Details | High | 8 | To Do |
| [US-4.4](./US-4.4-edit-recipe.md) | Edit Recipe | High | 8 | To Do |
| [US-4.5](./US-4.5-duplicate-recipe.md) | Duplicate Recipe | Medium | 2 | To Do |
| [US-4.6](./US-4.6-toggle-favorite.md) | Toggle Favorite | Low | 1 | To Do |
| [US-4.7](./US-4.7-delete-recipe.md) | Delete Recipe | Medium | 2 | To Do |
| [US-4.8](./US-4.8-archive-recipe.md) | Archive Recipe | Low | 1 | To Do |

---

## Epic 5: Ingredients Management (11 points)

| ID | Story | Priority | Points | Status |
|----|-------|----------|--------|--------|
| [US-5.1](./US-5.1-add-ingredient.md) | Add Ingredient to Recipe | High | 5 | To Do |
| [US-5.2](./US-5.2-update-ingredient.md) | Update Ingredient | High | 2 | To Do |
| [US-5.3](./US-5.3-remove-ingredient.md) | Remove Ingredient | High | 1 | To Do |
| [US-5.4](./US-5.4-reorder-ingredients.md) | Reorder Ingredients | Low | 3 | To Do |

---

## Epic 6: Recipe Packaging (5 points)

| ID | Story | Priority | Points | Status |
|----|-------|----------|--------|--------|
| [US-6.1](./US-6.1-add-packaging.md) | Add Packaging to Recipe | High | 3 | To Do |
| [US-6.2](./US-6.2-update-packaging.md) | Update Recipe Packaging | Medium | 1 | To Do |
| [US-6.3](./US-6.3-remove-packaging.md) | Remove Recipe Packaging | Medium | 1 | To Do |

---

## Epic 7: Pricing & Cost Calculation (12 points)

| ID | Story | Priority | Points | Status |
|----|-------|----------|--------|--------|
| [US-7.1](./US-7.1-view-cost-breakdown.md) | View Cost Breakdown | High | 5 | To Do |
| [US-7.2](./US-7.2-calculate-suggested-price.md) | Calculate Suggested Price | High | 2 | To Do |
| [US-7.3](./US-7.3-calculate-vat.md) | Calculate VAT | Medium | 2 | To Do |
| [US-7.4](./US-7.4-view-weight-calculations.md) | View Weight Calculations | Medium | 3 | To Do |

---

## Epic 8: Settings Management (3 points)

| ID | Story | Priority | Points | Status |
|----|-------|----------|--------|--------|
| [US-8.1](./US-8.1-configure-labor-rate.md) | Configure Labor Rate | High | 2 | To Do |
| [US-8.2](./US-8.2-configure-default-vat.md) | Configure Default VAT Rate | Low | 1 | To Do |

---

## Epic 9: Navigation & UX (10 points)

| ID | Story | Priority | Points | Status |
|----|-------|----------|--------|--------|
| [US-9.1](./US-9.1-navigate-between-sections.md) | Navigate Between Sections | High | 3 | To Do |
| [US-9.2](./US-9.2-form-validation-feedback.md) | Form Validation Feedback | Medium | 3 | To Do |
| [US-9.3](./US-9.3-loading-states.md) | Loading States | Medium | 2 | To Do |
| [US-9.4](./US-9.4-confirmation-dialogs.md) | Confirmation Dialogs | Medium | 2 | To Do |

---

## Implementation Phases

### Phase 1: MVP (Weeks 1-3) - 38 points
Focus: Core CRUD functionality

- US-1.1: Application Launch
- US-9.1: Navigate Between Sections
- US-2.1 - US-2.5: Materials CRUD
- US-3.1 - US-3.3: Packaging CRUD
- US-8.1: Configure Labor Rate

### Phase 2: Recipe Core (Weeks 4-6) - 32 points
Focus: Recipe management

- US-4.1 - US-4.4: Recipe CRUD
- US-5.1 - US-5.3: Ingredients
- US-6.1: Add Packaging
- US-7.1: Cost Breakdown

### Phase 3: Polish (Weeks 7-8) - 15 points
Focus: Complete features

- US-1.2: Language Selection
- US-2.6: Archive Material
- US-3.4: Delete Packaging
- US-4.5 - US-4.8: Recipe extras
- US-5.4: Reorder Ingredients
- US-6.2 - US-6.3: Packaging updates
- US-7.2 - US-7.4: Pricing
- US-8.2: Default VAT
- US-9.2 - US-9.4: UX polish

---

## Story Template

Each user story follows this structure:

1. **Epic** - Which epic it belongs to
2. **User Story** - As a/I want/So that format
3. **Priority** - High/Medium/Low
4. **Story Points** - Relative complexity
5. **Dependencies** - Other stories that must be done first
6. **Acceptance Criteria** - Checkboxes for requirements
7. **Verification Steps** - How to test the story
8. **UI Mockup Description** - Visual representation
9. **Technical Notes** - Implementation hints
10. **Definition of Done** - Final checklist
