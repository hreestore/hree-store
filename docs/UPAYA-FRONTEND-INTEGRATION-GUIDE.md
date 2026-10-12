# Upaya Frontend Integration Guide

This document is for the storefront implementation served by `routes/frontend.php`. It explains when to show Upaya delivery selectors, how to quote delivery, and what must be submitted during authenticated cart and public quick-order checkout.

## API conventions

All storefront requests in this guide require the vendor token:

```http
Vendor: <vendor-api-token>
Accept: application/json
Content-Type: application/json
```

Authenticated cart and profile requests also require:

```http
Authorization: Bearer <customer-token>
```

Normal responses use this envelope:

```json
{
  "status": 200,
  "success": true,
  "message": "...",
  "data": {}
}
```

Validation failures use HTTP 422, set `success` to `false`, and place field errors in `data`.

## The enablement flag

The frontend vendor-details response includes:

```json
{
  "upaya_delivery_enabled": true
}
```

This is the only Upaya configuration value exposed to the frontend. API keys, base URLs, package weight, service type, category, and dimensions are intentionally server-only.

Do not infer enablement from the presence of locations or from a previously selected vendor. Read `upaya_delivery_enabled` whenever vendor context is initialized or changed.

## When to show Upaya selectors

Show the Upaya location and area selectors only when both conditions are true:

1. `vendor.upaya_delivery_enabled === true`.
2. The current order contains at least one physical product.

Product classification comes from `product_type`:

- `service`: service-only and does not require delivery.
- `simple` or `variable`: physical product.
- A variant inherits the `product_type` of its parent product.

A mixed order containing services and physical products is a physical order for delivery purposes.

When the order changes from physical/mixed to service-only, hide the selectors, clear their values, clear the Upaya quote, and omit the Upaya IDs from submission.

## Keep the normal customer address

Upaya location and area are carrier service zones. They do not replace the customer's state, district, or street address.

- Authenticated cart checkout still requires `customer_address_id`.
- Quick order still requires `state_id`, `district_id`, and `address`.
- Quick order also validates that the district belongs to the selected state.

The checkout UI must therefore show the normal delivery address and the Upaya service-zone selectors for an Upaya-enabled physical order.

## Load locations and areas

Use:

```http
GET /api/frontend/upaya-locations
```

Example `data`:

```json
[
  {
    "id": 1,
    "name": "Kathmandu",
    "areas": [
      {
        "id": 25,
        "name": "New Baneshwor",
        "delivery_service": true,
        "cod_service": true
      }
    ]
  }
]
```

Implementation rules:

- Use IDs as submitted values and names only as labels.
- Populate the area selector only from the selected location's `areas` array.
- Clear the selected area and quote whenever location changes.
- The API already removes inactive locations, inactive areas, areas without delivery, and locations with no eligible areas.
- `cod_service` is informational in the current API contract. Do not reject a selection solely from this flag unless the frontend's chosen payment flow independently requires COD.
- The server validates area/location ownership again when quoting and when placing the order.
- A failed location request must block Upaya checkout and offer retry. Do not silently fall back to the legacy district charge for an Upaya-enabled vendor.

The backend caches the provider result briefly per vendor. A frontend session cache is acceptable, but it must be discarded when vendor context changes.

## Request a delivery rate

Request a rate after both IDs have been selected:

```http
POST /api/frontend/upaya-delivery-rate

{
  "location_id": 1,
  "area_id": 25
}
```

Example `data`:

```json
{
  "charge": 150,
  "target_weight": 1,
  "return_charge": 100,
  "location": {
    "id": 1,
    "name": "Kathmandu"
  },
  "area": {
    "id": 25,
    "name": "New Baneshwor"
  }
}
```

Use `data.charge` as the displayed delivery charge. `target_weight` and `return_charge` can be null. They are informational and must not be added to the checkout total.

Rate requests should be cancelled or ignored when the selection changes so an older response cannot replace the current quote. Disable final submission while the current selection has no successful quote.

The displayed quote is a preview. The backend requests the rate again during final order creation and saves that server result. If the provider rate changed, the order response is authoritative.

## Authenticated cart checkout

Final endpoint:

```http
POST /api/frontend/user/cart/order/store
```

Upaya-enabled physical-order payload:

```json
{
  "customer_address_id": 42,
  "order_from": "web",
  "discount_code": null,
  "remarks": null,
  "upaya_location_id": 1,
  "upaya_area_id": 25
}
```

For service-only orders, omit `upaya_location_id` and `upaya_area_id`.

`POST /api/frontend/user/cart/calculate` does not accept Upaya IDs. For an Upaya-enabled physical cart:

1. Call cart calculation without `customer_address_id` so a legacy district charge is not included.
2. Obtain the Upaya charge from `/upaya-delivery-rate`.
3. Add that non-taxable delivery charge to the displayed preview total.
4. Replace the preview with the totals returned by final order creation.

The final checkout recalculates product prices, flash-sale availability, discounts, tax, and Upaya delivery. Never submit or persist a frontend-calculated logistic charge for this flow.

## Public quick order

Initial endpoint:

```http
POST /api/frontend/quick-order/store
```

Relevant payload fragment:

```json
{
  "state_id": 3,
  "district_id": 14,
  "address": "Street and house details",
  "order_items": [
    {
      "item_type": "Product",
      "item_id": 100,
      "quantity": 2
    }
  ],
  "upaya_location_id": 1,
  "upaya_area_id": 25
}
```

`order_items.*.price` and `logistic_charge` remain optional for backward request compatibility, but the server ignores them as financial authorities. The server resolves current product/variant prices and either the Upaya rate or the configured district charge.

If the response contains `data.requires_otp === true`, preserve the complete `data.order_preview`, including both Upaya IDs. Submit the OTP endpoint with the preview fields plus the OTP:

```http
POST /api/frontend/quick-order/verify-and-create

{
  "email": "customer@example.com",
  "otp_code": "123456",
  "customer_name": "Customer Name",
  "customer_contact_info": "98XXXXXXXX",
  "state_id": 3,
  "district_id": 14,
  "address": "Street and house details",
  "order_items": [],
  "upaya_location_id": 1,
  "upaya_area_id": 25,
  "discount_code": null,
  "remarks": null
}
```

Do not reconstruct the OTP submission from partially displayed fields. Preserve the returned preview, then overlay `email` and `otp_code`. The server revalidates the products, address relationship, discount, and Upaya rate during OTP completion.

## Validation handling

Common Upaya failures are returned in `data.upaya` or `data.upaya_delivery`:

```json
{
  "status": 422,
  "success": false,
  "message": "Validation failed",
  "data": {
    "upaya_delivery": [
      "Location and area are required for Upaya delivery."
    ]
  }
}
```

Handle these cases as follows:

- Missing IDs: focus the first missing selector.
- Invalid/unavailable area: reload locations, clear both selections, and require a new quote.
- Provider/location/rate failure: keep the order unsubmitted and allow retry.
- Final rate/order validation failure: keep the entered customer address and cart/quick-order fields, but require a fresh Upaya quote.

## Order and delivery status

Order responses may contain:

```json
{
  "status": "processing",
  "logistic_charge": "150.00",
  "upaya_delivery": {
    "dispatch_status": "pending",
    "provider_order_id": null,
    "delivery_charge": "150.00",
    "attempts": 1,
    "error": null
  }
}
```

Depending on the order resource, monetary values may be formatted strings or JSON numbers. Parse them as decimal values; do not depend on one runtime type.

Delivery states:

| `dispatch_status` | Frontend meaning |
|---|---|
| `quoted` | Delivery charge is stored; shipment has not been requested. |
| `pending` | Shipment dispatch is queued or waiting for retry. |
| `dispatching` | Provider request is in progress. |
| `dispatched` | Upaya accepted the shipment and `provider_order_id` may be available. |
| `failed` | Dispatch failed permanently or exhausted retries; show the safe `error.message` to authorized admin users. |

When an admin requests `processing -> shipped` for an Upaya order, the order can remain `processing` while `upaya_delivery.dispatch_status` becomes `pending` or `dispatching`. This is expected. Show the order as shipped only when the API returns `status: "shipped"`; do not optimistically set it after the status-update request.

The existing admin retry endpoint is:

```http
POST /api/order/upaya-retry/{order_id}
```

After retry, refetch the order instead of locally forcing a delivery or order status.

## Frontend checklist

- Read `upaya_delivery_enabled` from the current vendor.
- Detect service-only versus physical/mixed orders.
- Keep normal address fields visible and required.
- Load Upaya locations only when needed.
- Select an area from the chosen location only.
- Quote after both IDs are selected.
- Submit both IDs in cart, quick-order, and OTP-completion requests.
- Ignore client price and logistic fields as authorities.
- Replace previews with final server totals.
- Render dispatch and order status independently.
- Clear all Upaya state when vendor or physical-product eligibility changes.

