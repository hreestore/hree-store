# Cart Implementation Plan

## Problem
The frontend cart flow needs to be fully aligned with `docs/cart-implementation.md` (`/api/frontend/user/cart/*`) so cart, discount, calculation, and order operations consistently follow backend payload rules, response envelopes, and checkout flow.

## Approach
Implement in phased updates: standardize API contracts first, then wire Redux/Saga state updates to server-calculated totals, then update cart/checkout UI behavior to use calculate/check-discount/order flows exactly as defined. Prioritize server-driven totals and strict customization rules.

## Scope
- Cart API client contract updates
- Redux cart state shape and recalculation flow updates
- Cart/checkout UI flow updates
- Error handling normalization for 422/400/401 envelope responses
- Discount/address/order integration consistency

## Implementation Todos
1. **Audit and normalize cart endpoint mapping**
   - Verify `src/api/endpoints.js` cart/order routes match documented paths.
   - Add missing endpoint(s), especially cart customization validation (`POST user/cart/validate`) if absent.
   - Remove stale/unused assumptions (for example legacy `variant_id`-driven payload logic where contract expects `product_type` + `product_id`).

2. **Refactor cart API payload builders**
   - Update `src/api/cart.js` request builders to enforce documented payload contract:
     - `product_type` strictly `Product | ProductVariant`
     - required `product_id`, `quantity >= 1` for store/update
     - customization rules:
       - `is_customized=true` requires customization payload
       - `is_customized=false` must not include customization payload
   - Ensure add-to-cart supports both single object and array without shape drift.
   - Remove debug `console.log` noise and keep response shape handling predictable.

3. **Normalize response envelope handling**
   - Centralize extraction of `{ status, success, message, data }` in cart/order API consumers.
   - Ensure 422 validation errors map to field-level UI errors.
   - Ensure 400 business errors and 401 vendor/auth errors surface actionable messages without silent fallback.

4. **Align Redux cart state with backend-calculated values**
   - Update `src/redux/reducer/cart/cart-slice.js` so totals/discount/shipping derive from `calculate`/`check-discount` response when available, not client recomputation overrides.
   - Preserve cart items from `GET /user/cart` and synchronize totals after mutation flows (`store`, `update`, `delete`, `clear`).
   - Keep backward-compatible guards only where required for mixed legacy payloads.

5. **Strengthen saga orchestration for cart flow**
   - Extend `src/redux/saga/cart-saga.js` and related action wiring for:
     - initial load: `GET cart` + `POST calculate`
     - quantity/customization update: `update` then `calculate`
     - discount apply/remove: `check-discount` then `calculate`
     - address changes: `calculate` with `customer_address_id`
   - Ensure failed requests keep state consistent and do not mask backend messages.

6. **Update cart and checkout UI integration**
   - Review and adjust affected sections:
     - `src/sections/cart/*`
     - `src/sections/checkout/*`
   - Ensure UI submits only allowed fields (do not send `logistic_charge`).
   - Wire discount/address/order submit UX to documented API behavior.
   - On successful order (`user/cart/order/store`), clear local cart state and use returned order payload for confirmation flow.

7. **Order update flow alignment**
   - Ensure client call for `POST user/cart/order/update/{order_id}` supports documented optional fields (`customer_address_id`, `status`, `remarks`) and valid status transitions (`cancelled`, `returned`) with backend error display.

8. **Regression pass across cart lifecycle**
   - Validate end-to-end paths:
     - guest vs authenticated behavior
     - add/update/delete/clear
     - customized vs non-customized items
     - discount valid/invalid/minimum order conditions
     - checkout and post-order cart reset

## Target Files (expected)
- `src/api/endpoints.js`
- `src/api/cart.js`
- `src/api/order.js` (if needed for order update/store shape alignment)
- `src/redux/actions/cart-actions.js`
- `src/redux/saga/cart-saga.js`
- `src/redux/reducer/cart/cart-slice.js`
- `src/sections/cart/**`
- `src/sections/checkout/**`

## Notes
- Prefer backend-calculated financial values (`subtotal`, `discount`, `tax`, `total_amount`, `logistic_charge`) as source of truth.
- Maintain compatibility with existing persisted cart state transitions, but avoid keeping legacy payload behavior that violates the new contract.
- Keep route/path usage centralized via `src/routes/paths.js` and endpoint definitions in `src/api/endpoints.js`.
