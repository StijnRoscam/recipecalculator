# US-7.3: Calculate VAT

## Epic
Epic 7: Pricing & Cost Calculation

## User Story
**As a** user
**I want** to see VAT calculations
**So that** I know the final customer price

## Priority
Medium

## Story Points
2

## Dependencies
- US-7.2: Calculate Suggested Price

---

## Acceptance Criteria

### AC-1: VAT Amount Display
- [ ] VAT amount shown in pricing section
- [ ] Formula: `suggested_price × (vat_percentage / 100)`

### AC-2: Price Including VAT
- [ ] Final price including VAT displayed
- [ ] Formula: `suggested_price + vat_amount`
- [ ] Prominently shown as final customer price

### AC-3: VAT Percentage Display
- [ ] Current VAT percentage shown
- [ ] Common rates: 0%, 6%, 9%, 21%

### AC-4: No VAT Set
- [ ] If VAT is null or 0%, show VAT = €0
- [ ] Price incl VAT = suggested price

---

## Verification Steps

### Test 1: Standard VAT (21%)
1. Suggested price: €100
2. VAT: 21%
3. **Verify**: VAT amount = €21
4. **Verify**: Price incl VAT = €121

### Test 2: Low VAT (6%)
1. Suggested price: €100
2. VAT: 6%
3. **Verify**: VAT amount = €6
4. **Verify**: Price incl VAT = €106

### Test 3: Zero VAT
1. Suggested price: €100
2. VAT: 0%
3. **Verify**: VAT amount = €0
4. **Verify**: Price incl VAT = €100

### Test 4: No VAT Set (null)
1. Recipe without VAT percentage
2. **Verify**: Treated as 0% or shows "N/A"

### Test 5: Complex Calculation
1. Cost: €78.60
2. Margin: 25% → Price: €98.25
3. VAT: 21% → VAT: €20.63
4. **Verify**: Final price = €118.88

---

## UI Mockup Description

```
PRICING
+------------------------------------------------------------------+
| Suggested Price:     €98.25  (25% margin)                         |
| Profit:              €19.65                                       |
|-------------------------------------------------------------------|
| VAT (21%):           €20.63                                       |
| PRICE INCL. VAT:     €118.88                                      |
+------------------------------------------------------------------+
```

---

## Technical Notes

- Calculation:
  ```typescript
  vatAmount = suggestedPrice * (vatPercentage / 100);
  priceInclVat = suggestedPrice + vatAmount;
  ```
- Round to 2 decimal places for display
- VAT calculated on suggested price (excl. VAT)

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All verification tests pass
- [ ] VAT rates handled correctly
- [ ] Code reviewed
