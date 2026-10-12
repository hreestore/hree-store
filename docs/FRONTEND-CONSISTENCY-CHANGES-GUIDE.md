# Frontend Consistency Changes Guide

This document summarizes the non-Upaya backend corrections that frontend implementations must account for. Existing required request fields, response keys, endpoint paths, and monetary response types were preserved. The changes primarily make server calculations and ownership checks authoritative.

## Core integration rule

Treat every calculation returned by the API as authoritative. Frontend calculations are previews for display only and must be replaced with the server response after calculation or mutation.

The standard response envelope remains:

```json
{
  "status": 200,
  "success": true,
  "message": "...",
  "data": {}
}
```

Validation errors remain HTTP 422 with field errors in `data`. No response or request key was deliberately renamed by this correction pass.

## Monetary value handling

Some resources return money as formatted strings such as `"1250.00"`; others return JSON numbers such as `1250`. This was retained to avoid breaking existing frontend consumers.

Frontend code should:

- Convert money through one decimal-safe parser at the API boundary.
- Avoid string concatenation or direct truthiness checks for monetary values.
- Format for display only after parsing.
- Preserve the server value or a decimal representation for later calculations.
- Avoid strict type comparisons such as `amount === 0` unless normalization has already occurred.

## Quick-order pricing and delivery

Affected endpoints:

- `POST /api/frontend/quick-order/store`
- `POST /api/frontend/quick-order/verify-and-create`

The server now resolves product and variant prices. It also resolves non-Upaya delivery charges from the vendor's configured charge for the validated district.

Frontend action:

- Stop treating `order_items.*.price` as authoritative.
- Stop allowing an editable quick-order delivery charge.
- `price` and `logistic_charge` may still be sent by older clients, but the server may ignore them.
- Use the final order's `subtotal`, discounts, tax, `logistic_charge`, and `total_amount` after creation.
- Preserve all fields from `order_preview` during OTP completion; the server revalidates the full order.

## Returns and POS returns

Affected flows:

- Sales returns
- Purchase returns
- POS sales returns

Refundable prices and VAT now come from the original stored transaction line and are prorated by returned quantity. The current product price, current VAT configuration, and submitted return price are not used as the refund authority.

Frontend action:

- Make return price read-only or remove the editable control.
- Build return selection from the original transaction lines.
- Restrict quantity to the remaining returnable quantity shown by the API.
- Treat `return_items.*.price` as a compatibility field only; it is optional and ignored financially.
- Replace any local refund preview with the created return response.
- Do not calculate refund VAT from the vendor's current tax rate.

## Calculation endpoints and totals

The centralized calculator now applies these rules consistently across sale, purchase, POS, order, cart, quick order, and quotation paths:

- An order-level discount reduces the taxable item bases before final VAT is calculated.
- Fixed item discounts cannot reduce a line below zero.
- Fixed order discounts cannot reduce the available subtotal below zero.
- `taxable_amount` contains only bases that actually contribute to tax.
- Non-taxable additional charges still contribute to `total_amount`.
- Tax-inclusive totals retain the full inclusive amount; extracted VAT is not subtracted from the final total.

Frontend action:

- Do not calculate VAT as a percentage of a pre-discount subtotal.
- Display `tax.taxable_amount`, `tax.tax_amount`, discount values, additional charges, and `total_amount` directly from calculation responses.
- Expect VAT to decrease when an order-level discount is applied.
- Prevent obviously excessive fixed discounts in the UI, but still display backend validation if values changed or another client submitted first.
- For tax-inclusive quotations, do not add VAT to `total_amount` a second time.

## Additional-charge taxability

Sale, purchase, POS, order, quotation, and calculation requests accept the existing additional-charge objects with an optional boolean:

```json
{
  "charge_name": "Handling",
  "charge_amount": 100,
  "taxable": true
}
```

Rules:

- `taxable: true`: the charge contributes to taxable amount and VAT.
- `taxable: false` or omitted: the charge contributes to the final total but is not taxed.

Frontend action:

- Send a real JSON boolean, not `"true"` or `"false"` strings.
- If the UI has no taxability control, omit the key and retain the existing non-taxable behavior.
- Preserve the flag when copying a quotation or order form state into another calculation request.

## POS tax behavior

POS now uses the same vendor tax configuration and centralized calculation path as other sale flows. The storefront vendor resource exposes the existing boolean as `tax`.

Frontend action:

- Use the vendor tax flag only to choose appropriate labels and inputs.
- Do not maintain a separate POS-only tax formula.
- Render the totals returned by POS creation/calculation, including inclusive-tax extraction and discounted tax.

## Purchase calculation payment validation

Purchase calculation now validates `paid_amount` consistently with other financial previews:

```text
nullable | numeric | minimum 0
```

Frontend action:

- Send null/omit for no payment, or a non-negative numeric value.
- Do not send an empty formatted currency string.
- Display the API's payment status/due calculation rather than deriving it from stale form totals.

## Payments and refunds under concurrent updates

Sale payments, purchase payments, sales refunds, and purchase refunds now lock and recheck the parent balance during the write. A value that was valid when the page loaded can be rejected if another user recorded a payment/refund first.

Frontend action:

- On a balance-related rejection, refetch the transaction or return record.
- Refresh `paid_amount`, `due_amount`, status, and payment/refund history.
- Do not retry automatically with the same amount.
- Disable duplicate submissions while the first request is pending.

## Tenant and ownership scoping

Backend lookups now consistently require referenced records to belong to the authenticated vendor/customer. This affects transaction parties, products, variants, addresses, logistic vendors, brands, categories, logistics charges, carts, wishlists, orders, reviews, eSewa initiation, returns, and related bound resources.

Frontend action:

- Never reuse cached entity IDs after vendor context changes.
- Clear cart, wishlist, party, address, product, variant, tax, and logistics selections on vendor switch.
- Populate selectors only from the current vendor's API results.
- If a formerly cached ID receives a validation/not-found response, remove it locally and reload the relevant collection.
- Do not interpret an ownership rejection as a transient server failure.

Customer addresses are also scoped to the authenticated party. Cart delivery previews and final checkout must use an address returned for the current customer.

## Discount and flash-sale concurrency

Final order creation now revalidates and locks discount/flash-sale usage before incrementing it. A discount or flash-sale quantity visible during preview may become unavailable before submission.

Frontend action:

- Label discount and flash-sale totals as provisional until order creation succeeds.
- On expiry, usage-limit, or stock rejection, refetch the cart/product state and recalculate.
- Do not increment usage or sold quantity optimistically in persistent frontend state.
- Avoid automatic resubmission because the available price or discount may have changed.

## Quotations

Quotation store and update now use the centralized calculation semantics.

Frontend action:

- Use returned item `price`, `unit_price`, `taxable_amount`, and VAT according to their existing response keys.
- For tax-inclusive input, treat `total_amount` as already inclusive of VAT.
- Respect fixed-discount validation at both line and order levels.
- Pass optional charge taxability explicitly only when the user selected it.
- Refresh quotation totals from the saved response instead of retaining a pre-save local calculation.

## Reports and dashboard values

Product/category/dashboard revenue now uses stored net line revenue, subtracts returned quantities/revenue, and accounts for discounts and tax semantics. Coupon revenue no longer subtracts the same discount twice.

Frontend action:

- Treat report values as net values from the API.
- Do not subtract returns or coupon discounts again in charts or summary cards.
- Expect historical report totals to differ from the old gross `price * quantity` presentation.
- Keep existing response keys; only the corrected values changed.

## Order status updates

Frontend status must always come from the status-update response. In particular, asynchronous provider workflows can accept a status action without immediately returning the requested final state.

Frontend action:

- Do not optimistically replace the order status before the API response.
- Render the returned order status.
- Refetch after queued work where the returned state is still intermediate.
- Continue enforcing the existing transition order in the UI: `pending -> confirmed -> processing -> shipped -> delivered`, with cancellation only where allowed by the API.

## Authentication route naming

The frontend customer login URI and payload are unchanged:

```http
POST /api/frontend/user/login
```

Its Laravel route name is now `customer.login`; the admin API login retains `login`. This matters only to frontend builds that consume generated Laravel route names (for example Ziggy). Update generated-route references from `route('login')` to `route('customer.login')` for customer login. Hard-coded/API-client paths require no change.

## User and profile forms

- Omit `password` from profile update requests when the password field is blank. Do not send an empty string or null as an intended unchanged password.
- Vendor-scoped user management cannot assign `super_admin`. Remove that option from vendor admin role selectors.
- A stale cross-vendor user/entity selection will now be rejected; reload current-vendor options.

## UI settings and location import

- UI-setting index now correctly returns the not-found response rather than continuing with a null success result. Handle the existing empty/not-found response path.
- Location import is now an authenticated super-admin operation. Any frontend import screen must send the admin bearer token and should hide the action from non-super-admin users.
- Existing endpoint paths and upload structures remain unchanged.

## Error-handling pattern

Use the response envelope rather than message-string matching:

```ts
if (!response.success) {
  const fieldErrors = response.data ?? {};
  // Bind known keys to fields and show response.message as the form summary.
}
```

Relevant corrected errors can be keyed by fields such as:

- `party_id`
- `customer_address_id`
- `logistic_vendor_id`
- `tax_id`
- `payment_account_id`
- `paid_amount`
- `order_items`
- `return_items`
- `discount_amount`
- `additional_charges`

Unknown keys should still appear in a form-level error summary.

## Implementation checklist

- Normalize monetary strings/numbers at the API boundary.
- Use server totals after every calculation and write.
- Remove editable authority over quick-order and return prices.
- Do not submit client-authoritative delivery totals.
- Add/preserve `additional_charges[].taxable` only when applicable.
- Refresh balances after payment/refund conflicts.
- Clear cached IDs when vendor context changes.
- Handle discount and flash-sale final-validation failures.
- Do not double-add VAT or double-subtract discounts/returns.
- Update generated customer-login route-name usage.
- Omit blank profile passwords and remove vendor `super_admin` selection.

