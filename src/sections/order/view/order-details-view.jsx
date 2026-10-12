"use client";

import { motion } from "motion/react";
import { paths } from "@/routes/paths";

import { OrderDetailsItems } from "../order-details-items";
import { OrderDetailsToolbar } from "../order-details-toolbar";
import { OrderDetailsShipping } from "../order-details-shipping";

import { useGetOrderDetail } from "@/api";

// ----------------------------------------------------------------------

export function OrderDetailsView({ orderId }) {
  const { order } = useGetOrderDetail(orderId);
  if (!order) {
    return null; // Or return a loading skeleton
  }

  const {
    address,
    order_id,
    order_number,
    order_date,
    status,
    order_items,
    discount_amount,
    discount_details,
    logistic_charge,
    vat_amount,
    tax,
    payment_method,
    upaya_delivery,
    fonepay_payment,
    party,
  } = order;

  // Derive human-readable payment method
  const resolvedPaymentMethod = payment_method
    ? payment_method
    : fonepay_payment
      ? "fonepay"
      : "cod";
  // console.log("this is order", order)
  const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const subtotal =
    toNumber(
      order.subtotal ??
      order.sub_total ??
      order.subtotal_amount ??
      order.taxable_amount ??
      order.tax?.taxable_amount
    ) ||
    order_items?.reduce(
      (sum, item) =>
        sum +
        (toNumber(item.total) ||
          toNumber(item.total_amount) ||
          toNumber(item.subtotal) ||
          toNumber(item.sub_total) ||
          toNumber(item.unit_price || item.price) * toNumber(item.quantity || 1)),
      0
    ) ||
    0;

  const totalAmountValue = toNumber(
    order.total_amount ??
    order.grand_total ??
    order.payable_amount ??
    order.final_amount ??
    order.total
  );

  // Tax details - use tax object if available, otherwise create from vat_amount
  const taxDetails = tax?.applied
    ? tax
    : {
      applied: true,
      tax_name: "VAT",
      percentage: null,
      price_includes_tax: false,
      tax_amount: toNumber(vat_amount),
    };

  return (
    <div className="lg:py-24 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrderDetailsToolbar
          status={status}
          createdAt={order_date}
          orderNumber={order_number || order_id}
          orderId={order_id}
          backHref={paths.order.root}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <OrderDetailsItems
              items={order_items}
              taxDetails={taxDetails}
              shipping={toNumber(logistic_charge)}
              discount={toNumber(discount_amount)}
              discountDetails={discount_details}
              subtotal={subtotal}
              totalAmount={totalAmountValue}
              paymentInfo={fonepay_payment}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className=" rounded-3xl shadow-xl border border-[#ffffff]/10 overflow-hidden">
              <OrderDetailsShipping
                address={address}
                paymentMethod={resolvedPaymentMethod}
                upayaDelivery={upaya_delivery}
                party={party}
                paymentInfo={fonepay_payment}
                totalAmount={totalAmountValue}
                orderId={order_id}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
