# Website Customized Product Cart And Checkout Frontend Flow

This guide focuses on customized product cart and checkout behavior in the customer storefront routes from `routes/frontend.php`.

## API Base And Headers

All endpoints are under:

```http
/api/frontend
```

Every request needs the vendor token:

```http
Vendor: <vendor-api-token>
Accept: application/json
Content-Type: application/json
```

Customer cart, checkout, profile, and Fonepay endpoints also need:

```http
Authorization: Bearer <customer-token>
```

Response envelope:

```json
{
  "status": 200,
  "success": true,
  "message": "Message",
  "data": {}
}
```

Validation errors return HTTP `422` with field errors in `data`. General failures return HTTP `400`.

## Customization Rules

The frontend should not create or submit a `customization_snapshot`. The backend creates the snapshot after validating the selected design combination and designs.

A product can be customized only when both are true:

1. Vendor response has `allow_product_customization: true`.
2. Product response has `is_customizable: true`.

Relevant discovery endpoints:

| Purpose | Method | Endpoint |
| --- | --- | --- |
| Vendor flags | `GET` | `/vendor-details` |
| Product detail | `GET` | `/product-details/{slug}` |
| Placements | `GET` | `/placements` |
| Design combinations | `GET` | `/design-combinations` |
| One design combination | `GET` | `/design-combinations/{id}` |

Customization input is intentionally small:

```json
{
  "design_combination_id": 3,
  "design_ids": [11, 12]
}
```

Backend validation enforces:

1. Product belongs to the authenticated customer vendor.
2. Product is customizable and vendor allows product customization.
3. `design_combination_id` exists, belongs to the vendor, and is active.
4. Every `design_id` belongs to that design combination.
5. Designs and placements are active.
6. Vendor placement configuration allows each selected placement.
7. Only one design can be selected per placement.
8. Required placements must be included.

If `design_ids` is omitted, the backend uses all active designs in the selected design combination. Prefer sending explicit `design_ids` from the UI so the customer's exact selection is clear.

## Customized Product UI Flow

1. Load vendor details.
2. Load product detail.
3. If customization is not allowed, hide customization controls and add as a normal product.
4. Load design combinations and placements.
5. Let the customer choose one design combination.
6. Let the customer choose one design per placement when the UI supports placement-level choices.
7. Call `/user/cart/validate` before add-to-cart when the product is customized.
8. Use the validated response only for confirmation/display. Submit the same input to `/user/cart/store`.

## Validate Customization Before Cart

```http
POST /api/frontend/user/cart/validate
```

Product payload:

```json
{
  "product_type": "Product",
  "product_id": 25,
  "is_customized": true,
  "customization": {
    "design_combination_id": 3,
    "design_ids": [11, 12]
  }
}
```

Variant payload:

```json
{
  "product_type": "ProductVariant",
  "product_id": 7,
  "is_customized": true,
  "customization": {
    "design_combination_id": 3,
    "design_ids": [11, 12]
  }
}
```

Successful response data:

```json
{
  "design_combination_id": 3,
  "customization_snapshot": {
    "schema_version": 1,
    "vendor_id": 1,
    "design_combination_id": 3,
    "placements": [
      {
        "placement_id": 1,
        "placement_code": "front",
        "design_id": 11
      },
      {
        "placement_id": 2,
        "placement_code": "back",
        "design_id": 12
      }
    ]
  },
  "is_customized": true
}
```

Frontend usage:

1. Use `customization_snapshot.placements` to show a final selected-designs review.
2. Do not modify and resubmit the snapshot.
3. If validation fails, show `data.customization[0]` or field-specific messages beside the customization controls.

## Add Customized Product To Cart

```http
POST /api/frontend/user/cart/store
```

Single customized line:

```json
{
  "product_type": "ProductVariant",
  "product_id": 7,
  "quantity": 2,
  "is_customized": true,
  "customization": {
    "design_combination_id": 3,
    "design_ids": [11, 12]
  }
}
```

Multiple lines are accepted as an array:

```json
[
  {
    "product_type": "ProductVariant",
    "product_id": 7,
    "quantity": 2,
    "is_customized": true,
    "customization": {
      "design_combination_id": 3,
      "design_ids": [11, 12]
    }
  },
  {
    "product_type": "Product",
    "product_id": 25,
    "quantity": 1,
    "is_customized": false
  }
]
```

Important payload rules:

1. `product_type` must be `Product` or `ProductVariant`.
2. For variants, `product_id` is the variant ID.
3. Send `is_customized: true` only with a customization payload.
4. Do not send `is_customized: false` together with `customization`, `design_combination_id`, or `design_ids`.
5. If `is_customized` is omitted but customization fields are present, the backend treats the line as customized.
6. If no customization fields are present, the backend treats the line as non-customized.

The backend merges cart lines by product/variant and customization snapshot. Same product with different selected designs becomes separate cart lines.

## Cart Display For Customized Items

```http
GET /api/frontend/user/cart
```

Customized cart line fields:

```json
{
  "cart_id": 10,
  "itemable_type": "ProductVariant",
  "itemable_id": 7,
  "item_name": "T-Shirt / Large",
  "item_image": "https://...",
  "product_type": "variable",
  "price": 1200,
  "regular_price": 1500,
  "quantity": 2,
  "total": 2400,
  "is_customized": true,
  "design_combination_id": 3,
  "customization_snapshot": {
    "schema_version": 1,
    "vendor_id": 1,
    "design_combination_id": 3,
    "placements": [
      {
        "placement_id": 1,
        "placement_code": "front",
        "design_id": 11
      }
    ]
  },
  "customization": {
    "design_combination_id": 3,
    "snapshot": {
      "schema_version": 1,
      "vendor_id": 1,
      "design_combination_id": 3,
      "placements": []
    }
  }
}
```

Display rules:

1. Badge customized lines with `is_customized`.
2. Show selected placement/design labels by joining `customization_snapshot.placements` with cached placement and design-combination data.
3. Use `cart_id` for update/delete actions.
4. Do not collapse customized cart lines by product ID only. The same product can appear more than once with different snapshots.

## Update Customized Cart Line

```http
POST /api/frontend/user/cart/update/{cart}
```

Quantity-only update:

```json
{
  "quantity": 3
}
```

Change selected customization:

```json
{
  "quantity": 3,
  "is_customized": true,
  "customization": {
    "design_combination_id": 4,
    "design_ids": [15, 18]
  }
}
```

Remove customization from an existing customized line:

```json
{
  "quantity": 3,
  "is_customized": false
}
```

After an update succeeds, reload `/user/cart` and `/user/cart/calculate`.

## Delete Or Clear Cart

```http
POST /api/frontend/user/cart/delete/{cart}
POST /api/frontend/user/cart/clear
```

Use these endpoints exactly as normal cart lines. No customization payload is needed.

## Calculate Customized Cart

```http
POST /api/frontend/user/cart/calculate
```

Payload:

```json
{
  "customer_address_id": 5,
  "discount_code": "SAVE10"
}
```

For service-only customized products, omit `customer_address_id`.

Calculation uses the cart rows already stored on the server. You do not send cart items or customization fields to this endpoint.

Use the returned totals for checkout summary:

```json
{
  "items": [],
  "subtotal": 2700,
  "discount": {
    "percentage": 0,
    "amount": 300
  },
  "additional_charges_total": 150,
  "tax": {
    "applied": true,
    "price_includes_tax": true,
    "taxable_amount": 2217.39,
    "tax_amount": 332.61
  },
  "total_amount": 2550,
  "vendor_has_tax": true,
  "price_includes_tax": true,
  "logistic_charge": 150
}
```

## Checkout Customized Cart

Customized products use the same order creation endpoint as normal products. The backend freezes each cart line customization into `order_items.customization_snapshot`.

```http
POST /api/frontend/user/cart/order/store
```

Normal physical delivery payload:

```json
{
  "customer_address_id": 5,
  "order_from": "web",
  "discount_code": "SAVE10",
  "remarks": "Please confirm print placement before dispatch"
}
```

Service-only customized payload:

```json
{
  "order_from": "web",
  "discount_code": "SAVE10",
  "remarks": "Customer will provide final approval by phone"
}
```

Upaya customized physical delivery payload:

```json
{
  "order_from": "web",
  "discount_code": "SAVE10",
  "remarks": "Customized print order",
  "upaya_location_id": 1,
  "upaya_area_id": 25,
  "upaya_address": "House 12, New Baneshwor, Kathmandu",
  "upaya_landmark": "Near main chowk",
  "upaya_receiver_name": "Asha Sharma",
  "upaya_receiver_contact": "9800000000",
  "upaya_client_note": "Call before arrival"
}
```

Do not send customization fields to order creation. The order is created from the server-side cart.

During checkout the backend:

1. Reloads the customer's cart.
2. Validates every customized cart snapshot against vendor and snapshot schema.
3. Recalculates flash sale price, discount, tax, and delivery charge.
4. Creates `orders` and `order_items`.
5. Copies `design_combination_id`, `customization_snapshot`, and `is_customized` to each order item.
6. Deletes cart lines after successful order creation.

If any customized cart line has missing or invalid snapshot data, order creation fails. The frontend should ask the customer to reopen that cart line, reselect designs, and update the cart.

## Upaya With Customized Products

Use Upaya when:

1. `vendor.upaya_delivery_enabled === true`.
2. The cart has at least one physical product. Customized physical products count as physical products.

Load carrier zones:

```http
GET /api/frontend/upaya-locations
```

Quote:

```http
POST /api/frontend/upaya-delivery-rate
```

```json
{
  "location_id": 1,
  "area_id": 25
}
```

For Upaya checkout:

1. Validate customized cart lines before add/update.
2. Calculate cart normally with `/user/cart/calculate`; this does not accept Upaya IDs.
3. Quote Upaya separately.
4. Show provisional total as `calculation.total_amount + upayaQuote.charge`.
5. Submit Upaya fields to `/user/cart/order/store`.
6. Replace the provisional total with the returned order totals.

## Fonepay After Customized Checkout

Fonepay starts only after the customized cart has become an order. Do not send `payment_method` or Fonepay fields to `/user/cart/order/store`.

Initiate:

```http
POST /api/frontend/user/fonepay/initiate/{orderId}
```

Response data:

```json
{
  "prn": "ORD101ABCD1234",
  "amount": 2550,
  "qr_message": "000201...",
  "thirdparty_qr_websocket_url": "wss://...",
  "status": "pending",
  "lifecycle_status": "active"
}
```

Poll by order:

```http
POST /api/frontend/user/fonepay/status/order/{orderId}
```

Handle statuses:

| `payment_status` | UI action |
| --- | --- |
| `paid` | Stop polling, show success, reload order detail. Backend confirms order and creates sale. |
| `pending` | Keep QR visible and poll again. |
| `failed` | Stop polling and show retry if order is still unpaid. |

## Implementation Checklist

- [ ] Hide customization UI unless both vendor and product allow customization.
- [ ] Load design combinations before allowing customized add-to-cart.
- [ ] Validate customized selection with `/user/cart/validate`.
- [ ] Submit `design_combination_id` and `design_ids`, not `customization_snapshot`.
- [ ] Treat same product with different customization snapshots as separate cart lines.
- [ ] Recalculate cart after every customized add, update, delete, or quantity change.
- [ ] Do not send customization data to order creation.
- [ ] Use returned order item snapshots for order confirmation display.
- [ ] Create order before Fonepay.
- [ ] For Upaya customized physical checkout, quote Upaya separately and trust final order totals.
