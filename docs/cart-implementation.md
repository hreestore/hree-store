# Cart API Implementation Guide (Frontend)

This is the **source-of-truth frontend contract** for cart/checkout APIs under:

`/api/frontend/user/cart/*`

All behavior below is based on current backend code in `CartController`.

## 1. Authentication and Headers

These endpoints are protected by `auth:customer` + `vendor.verify`.

Send these headers in every request:

```http
Authorization: Bearer <customer_token>
Vendor: <vendor_api_token>
Content-Type: application/json
Accept: application/json
```

## 2. Response Envelope (common)

Most endpoints return this envelope:

```json
{
  "status": 200,
  "success": true,
  "message": "Some message",
  "data": {}
}
```

Error shapes:

1. **Validation error** (`422`)
```json
{
  "status": 422,
  "success": false,
  "message": "Validation failed",
  "data": {
    "field_name": ["Validation message"]
  }
}
```
2. **Business/runtime error** (`400`)
```json
{
  "status": 400,
  "success": false,
  "message": "Cart is empty",
  "data": null
}
```
3. **Vendor middleware error** (`401`)
```json
{
  "status": 401,
  "success": false,
  "message": "Vendor token is required",
  "data": null
}
```

## 3. Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/frontend/user/cart` | Get cart items |
| POST | `/api/frontend/user/cart/store` | Add item(s) |
| POST | `/api/frontend/user/cart/update/{cart_id}` | Update quantity/customization |
| POST | `/api/frontend/user/cart/delete/{cart_id}` | Delete one line |
| POST | `/api/frontend/user/cart/clear` | Clear whole cart |
| POST | `/api/frontend/user/cart/validate` | Validate customization before add/update |
| POST | `/api/frontend/user/cart/calculate` | Calculate totals, tax, delivery, discount |
| POST | `/api/frontend/user/cart/check-discount` | Validate/apply discount code against current cart |
| POST | `/api/frontend/user/cart/order/store` | Place order from current cart |
| POST | `/api/frontend/user/cart/order/update/{order_id}` | Update address, cancel, or return |

---

## 4. Cart Item Payload Contract

`product_type` and `product_id` are required for add/validate.

```json
{
  "product_type": "Product",
  "product_id": 123,
  "quantity": 2,
  "is_customized": true,
  "customization": {
    "design_combination_id": 10,
    "design_ids": [11, 12]
  }
}
```

### Allowed values and rules

| Field | Type | Rules |
|---|---|---|
| `product_type` | string | Required, one of: `Product`, `ProductVariant` |
| `product_id` | number | Required |
| `quantity` | integer | Required (store/update), min `1` |
| `is_customized` | boolean | Optional |
| `design_combination_id` | integer | Optional, can be top-level or inside `customization` |
| `design_ids` | integer[] | Optional, can be top-level or inside `customization` |
| `customization` | object | Optional container for customization |

### Customization behavior (important)

1. If `is_customized=true`, customization payload is required.
2. If `is_customized=false`, customization payload must **not** be sent.
3. If customization is omitted, backend stores it as non-customized.
4. Backend merges cart lines only when product/variant and customization snapshot match.

---

## 5. Get Cart

### `GET /api/frontend/user/cart`

Returns cart lines as `CartResource[]`.

Important fields in each item:

| Field | Meaning |
|---|---|
| `cart_id` | Cart line id |
| `itemable_type` | `Product` or `ProductVariant` |
| `itemable_id` | Product/variant id |
| `price` | Final per-unit price (flash sale aware) |
| `regular_price` | Original per-unit price |
| `quantity` | Quantity in cart |
| `total` | `price * quantity` |
| `is_customized` | Whether customized |
| `design_combination_id` | Selected combination id |
| `customization_snapshot` | Frozen customization data |

If cart is empty: success response with empty array and message `Oops! Your cart is empty. Time to go shopping.`

---

## 6. Add to Cart

### `POST /api/frontend/user/cart/store`

Supports both:

1. A single object
2. An array of objects (recommended for batch add)

Example batch request:

```json
[
  {
    "product_type": "ProductVariant",
    "product_id": 345,
    "quantity": 2
  },
  {
    "product_type": "Product",
    "product_id": 99,
    "quantity": 1,
    "is_customized": true,
    "customization": {
      "design_combination_id": 8,
      "design_ids": [101, 102]
    }
  }
]
```

Returns created/merged cart lines as `data`.

---

## 7. Update Cart Line

### `POST /api/frontend/user/cart/update/{cart_id}`

Request:

```json
{
  "quantity": 3,
  "is_customized": false
}
```

`quantity` is required. Endpoint can also update customization using same rules as add.

---

## 8. Delete and Clear

1. `POST /api/frontend/user/cart/delete/{cart_id}`: deletes one line.
2. `POST /api/frontend/user/cart/clear`: deletes all lines for logged-in customer/vendor.

---

## 9. Validate Customization (pre-check)

### `POST /api/frontend/user/cart/validate`

Use this before add/update when frontend needs early validation feedback.

Request:

```json
{
  "product_type": "ProductVariant",
  "product_id": 345,
  "is_customized": true,
  "customization": {
    "design_combination_id": 8,
    "design_ids": [101, 102]
  }
}
```

Returns normalized customization object in `data` when valid.

---

## 10. Calculate Cart Totals

### `POST /api/frontend/user/cart/calculate`

Request:

```json
{
  "discount_code": "SAVE10",
  "customer_address_id": 55
}
```

Rules:

1. `discount_code` is optional.
2. `customer_address_id` is optional.
3. **Do not send `logistic_charge` from frontend.** Backend calculates it from address district + vendor settings.

Response includes:

1. Item-wise breakdown (`items[]`) with discount and tax values.
2. Flash-sale metadata (`is_flash_sale`, `regular_price`, `flash_sale_price`, savings).
3. Totals (`subtotal`, `discount`, `tax`, `total_amount`).
4. Delivery charges (`additional_charges`, `logistic_charge`).
5. Discount info (`discount_code`, `discount_info`) when code is valid.

---

## 11. Check Discount Code

### `POST /api/frontend/user/cart/check-discount`

Request:

```json
{
  "discount_code": "SAVE10"
}
```

Use this to validate code and get a full recalculated cart response with per-item discount applicability flags.

Possible errors:

1. `Invalid or expired discount code.`
2. `Minimum order amount ... required. Add ... more to apply this discount.`
3. `Discount code not applicable to any items in your cart.`

---

## 12. Place Order from Cart

### `POST /api/frontend/user/cart/order/store`

Request:

```json
{
  "customer_address_id": 55,
  "order_from": "web",
  "discount_code": "SAVE10",
  "remarks": "Please call before delivery"
}
```

Validation:

| Field | Rules |
|---|---|
| `customer_address_id` | Required, must exist |
| `order_from` | Required, `web` or `mobile` |
| `discount_code` | Optional string |
| `remarks` | Optional, max 1000 chars |

Backend behavior:

1. Reads current cart lines for logged-in customer/vendor.
2. Re-resolves flash sale prices and stock limits.
3. Applies discount code (if provided).
4. Computes tax/charges via `PriceCalculationService`.
5. Creates order + order_items and clears cart.
6. Returns `OrderResource` in response `data`.

---

## 13. Update Existing Order (Customer Side)

### `POST /api/frontend/user/cart/order/update/{order_id}`

Request example:

```json
{
  "customer_address_id": 55,
  "status": "cancelled",
  "remarks": "Need to cancel"
}
```

Rules:

1. `customer_address_id` optional, must belong to same customer+vendor.
2. `status` optional, allowed: `cancelled`, `returned`.
3. `remarks` optional, max 1000 chars.
4. Delivered order cannot be cancelled (use return flow).
5. Return is only allowed when current status is delivered.

---

## 14. Frontend Integration Flow (recommended)

1. Cart page load: `GET /cart` then `POST /cart/calculate`.
2. Quantity/customization changes: call `update`, then call `calculate`.
3. Discount apply/remove: call `check-discount` (optional UX), then call `calculate`.
4. Address change: call `calculate` with `customer_address_id`.
5. Checkout submit: call `order/store` with `customer_address_id`, `order_from`, optional `discount_code`.
6. After successful order: clear local cart state and use returned order payload for confirmation page.

---

## 15. Common Frontend Mistakes to Avoid

1. Sending `product_type` as lowercase (`product`/`variant`) instead of `Product`/`ProductVariant`.
2. Sending `is_customized=false` together with `customization`.
3. Sending `logistic_charge` manually instead of `customer_address_id`.
4. Calculating tax/discount totals on client and overriding backend totals.
5. Assuming one universal error shape outside the API envelope.

