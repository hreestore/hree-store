import { MapPin, CreditCard, Truck, User, Phone, Loader2 } from "lucide-react";
import { fCurrency } from "@/utils/format-number";
import { useState } from "react";
import { checkFonepayStatus, initiateFonepayPayment } from "@/api";
import { toast } from "sonner";
import { FonepayQRModal } from "../cart/fonepay-qr-modal";

// ----------------------------------------------------------------------

const DISPATCH_STATUS_LABELS = {
  quoted: "Quoted",
  dispatched: "Dispatched",
  delivered: "Delivered",
  failed: "Failed",
  pending: "Pending",
};

const DISPATCH_STATUS_COLORS = {
  quoted: "text-yellow-600 bg-yellow-50 border-yellow-200",
  dispatched: "text-blue-600 bg-blue-50 border-blue-200",
  delivered: "text-green-600 bg-green-50 border-green-200",
  failed: "text-red-600 bg-red-50 border-red-200",
  pending: "text-gray-600 bg-gray-50 border-gray-200",
};

const PAYMENT_STATUS_LABELS = {
  paid: "Paid",
  partially_paid: "Partially Paid",
  unpaid: "Unpaid",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

const PAYMENT_STATUS_COLORS = {
  paid: "text-green-700 bg-green-50 border-green-300",
  partially_paid: "text-yellow-700 bg-yellow-50 border-yellow-300",
  unpaid: "text-red-700 bg-red-50 border-red-300",
  pending: "text-gray-600 bg-gray-50 border-gray-300",
  failed: "text-red-700 bg-red-50 border-red-300",
  refunded: "text-purple-700 bg-purple-50 border-purple-300",
  cancelled: "text-gray-500 bg-gray-50 border-gray-300",
};

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-black uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="text-sm font-medium leading-relaxed">{value}</p>
    </div>
  );
}

export function OrderDetailsShipping({ address, paymentMethod, upayaDelivery, party, paymentInfo, totalAmount, orderId }) {
  const [isChecking, setIsChecking] = useState(false);
  const [isInitiating, setIsInitiating] = useState(false);
  const [showPayButton, setShowPayButton] = useState(false);
  const [fonepayModalOpen, setFonepayModalOpen] = useState(false);
  const [fonepayData, setFonepayData] = useState(null);

  const handleCheckStatus = async () => {
    if (!paymentInfo?.prn) {
      toast.error("No PRN found to check status.");
      setShowPayButton(true);
      return;
    }
    try {
      setIsChecking(true);
      const response = await checkFonepayStatus(paymentInfo.prn);

      const rawStatus = response?.data?.payment_status;
      const nestedStatus = response?.data?.status_response?.paymentStatus;
      const fonepayStatus = response?.data?.fonepay_status;
      const normalizedStatus = String(
        rawStatus || nestedStatus || fonepayStatus || "pending",
      ).toLowerCase();

      if (["paid", "success"].includes(normalizedStatus)) {
        toast.success("Payment successful! Refreshing order details...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("Payment status is failed or pending. You can try again.");
        setShowPayButton(true);
      }
    } catch (error) {
      toast.error(error?.message || "Payment status is failed.");
      setShowPayButton(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handleInitiatePayment = async () => {
    if (!orderId) {
      toast.error("Order ID is missing.");
      return;
    }
    try {
      setIsInitiating(true);
      const fonepayResponse = await initiateFonepayPayment(orderId);
      if (fonepayResponse?.success && fonepayResponse?.data?.prn) {
        setFonepayData(fonepayResponse.data);
        setFonepayModalOpen(true);
      } else {
        throw new Error("Failed to initiate Fonepay payment.");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to initiate payment.");
    } finally {
      setIsInitiating(false);
    }
  };

  const paymentLabel =
    paymentMethod === "fonepay"
      ? "Fonepay"
      : paymentMethod === "esewa"
        ? "eSewa"
        : paymentMethod === "cod"
          ? "Cash on Delivery"
          : paymentMethod || "Not specified";

  const dispatchStatus = upayaDelivery?.dispatch_status;
  const statusLabel = DISPATCH_STATUS_LABELS[dispatchStatus] ?? dispatchStatus;
  const statusColor = DISPATCH_STATUS_COLORS[dispatchStatus] ?? DISPATCH_STATUS_COLORS.pending;

  return (
    <>
      {/* ── Customer ───────────────────────────────────────── */}
      {/* {party && (
        <>
          <div className="px-6 py-5 border-b border-gray-600">
            <h2 className="text-xl font-display font-black uppercase tracking-tighter flex items-center gap-2">
              <User className="w-5 h-5 text-[#711a20]" />
              Customer
            </h2>
          </div>
          <div className="p-6 space-y-3">
            <InfoRow label="Name" value={party.full_name} />
            <InfoRow label="Phone" value={party.phone_number} />
            <InfoRow label="Email" value={party.email} />
          </div>
        </>
      )} */}

      {/* ── Shipping Address ───────────────────────────────── */}
      <div className="px-6 py-5 border-b border-gray-600">
        <h2 className="text-xl font-display font-black uppercase tracking-tighter flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#711a20]" />
          Shipping Info
        </h2>
      </div>

      <div className="p-6 space-y-4">
        <InfoRow
          label="Address"
          value={[address?.address, address?.district].filter(Boolean).join(", ")}
        />
        <InfoRow label="State" value={address?.state} />

        {/* ── Payment Details ──────────────────────────────── */}
        <div className="pt-4 border-t border-gray-600 space-y-3">
          <p className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            Payment
          </p>

          {/* Method */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Method</span>
            <span className="text-sm font-semibold">{paymentLabel}</span>
          </div>

          {paymentInfo ? (() => {
            const rawStatus = (paymentInfo.payment_status ?? "").toLowerCase();
            const statusLabel = PAYMENT_STATUS_LABELS[rawStatus] ?? paymentInfo.payment_status;
            const statusColor = PAYMENT_STATUS_COLORS[rawStatus] ?? PAYMENT_STATUS_COLORS.pending;
            const dotColor =
              rawStatus === "paid" ? "bg-green-500" :
                rawStatus === "partially_paid" ? "bg-yellow-500" :
                  rawStatus === "failed" || rawStatus === "unpaid" ? "bg-red-500" :
                    "bg-gray-400";

            const paidAmount = Number(paymentInfo.payment_amount) || 0;
            const total = Number(totalAmount) || 0;
            const remaining = total > paidAmount ? +(total - paidAmount).toFixed(2) : 0;

            return (
              <>
                {/* Paid / To Be Paid amount */}
                {(paidAmount > 0 || rawStatus === "failed" || rawStatus === "unpaid") && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {rawStatus === "failed" || rawStatus === "unpaid" ? "Amount To Be Paid" : "Amount Paid"}
                    </span>
                    <span
                      className={`text-sm font-bold ${rawStatus === "failed" || rawStatus === "unpaid" ? "text-red-600" : "text-green-700"
                        }`}
                    >
                      {fCurrency(paidAmount || total)}
                    </span>
                  </div>
                )}

                {/* Remaining */}
                {remaining > 0 && rawStatus !== "failed" && rawStatus !== "unpaid" && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Remaining</span>
                    <span className="text-sm font-bold text-red-600">{fCurrency(remaining)}</span>
                  </div>
                )}

                {/* Status badge */}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
                  <span
                    className={`inline-flex items-center gap-1  text-xs font-bold`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                    {statusLabel}
                  </span>
                </div>

                {/* Fonepay Retry Actions */}
                {paymentMethod === "fonepay" && rawStatus === "failed" && (
                  <div className="pt-3 flex flex-col gap-2">
                    {!showPayButton ? (
                      <button
                        onClick={handleCheckStatus}
                        disabled={isChecking}
                        className=" py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isChecking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Check Payment Status
                      </button>
                    ) : (
                      <button
                        onClick={handleInitiatePayment}
                        disabled={isInitiating}
                        className="w-full py-2 px-4 border-gray-100 border-2 bg-gray-100 hover:bg-red-200 text-red-800  hover:border-red-800
                         text-xs font-bold uppercase rounded-lg shadow-[2px_2px_0_0_rgba(8,26,26,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isInitiating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <div className="flex flex-row items-end gap-1">
                          <img src="/img/fonepay/connect.png" alt="" className="h-5 object-contain" />
                          <img src="/img/fonepay/Checkout_by_Fonepay.png" alt="" className="h-5 w-auto object-contain" />
                        </div>
                        Pay via Fonepay
                      </button>
                    )}
                  </div>
                )}
              </>
            );
          })() : (
            // COD — no payment info object
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Status</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border text-gray-600 bg-gray-50 border-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                Pay on delivery
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Upaya Delivery ─────────────────────────────────── */}
      {upayaDelivery && (
        <>
          <div className="px-6 py-5 border-t border-b border-gray-600">
            <h2 className="text-xl font-display font-black uppercase tracking-tighter flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#711a20]" />
              Upaya Delivery
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Dispatch status badge */}
            {dispatchStatus && (
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">
                  Dispatch Status
                </p>
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColor}`}
                >
                  {statusLabel}
                </span>
              </div>
            )}

            <InfoRow label="Receiver Name" value={upayaDelivery.receiver_name} />
            <InfoRow label="Receiver Contact" value={upayaDelivery.receiver_contact} />
            <InfoRow label="Delivery Address" value={upayaDelivery.delivery_address} />
            <InfoRow label="Landmark" value={upayaDelivery.landmark} />
            <InfoRow label="Note" value={upayaDelivery.client_note} />

            {/* Charges */}
            {(upayaDelivery.quoted_charge > 0 || upayaDelivery.final_charge > 0) && (
              <div className="pt-3 border-t border-gray-600 space-y-2">
                <InfoRow
                  label="Quoted Charge"
                  value={upayaDelivery.quoted_charge != null ? `Rs. ${upayaDelivery.quoted_charge}` : null}
                />
                <InfoRow
                  label="Final Charge"
                  value={upayaDelivery.final_charge != null ? `Rs. ${upayaDelivery.final_charge}` : null}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Fonepay QR Payment Modal */}
      {fonepayModalOpen && (
        <FonepayQRModal
          key={orderId || "fonepay-modal"}
          open={fonepayModalOpen}
          fonepayData={fonepayData}
          orderId={orderId}
          onClose={() => {
            setFonepayModalOpen(false);
          }}
          onSuccess={(oid) => {
            setFonepayModalOpen(false);
            toast.success("Payment confirmed! Your order is now processing.");
            window.location.reload();
          }}
          onRetry={async () => {
            if (!orderId) return;
            try {
              const fonepayResponse = await initiateFonepayPayment(orderId);
              if (fonepayResponse?.success && fonepayResponse?.data?.prn) {
                setFonepayData(fonepayResponse.data);
              } else {
                throw new Error("Failed to regenerate QR.");
              }
            } catch (err) {
              toast.error(err?.message || "Could not regenerate QR. Please try again.");
            }
          }}
        />
      )}
    </>
  );
}

// Ensure the Fonepay modal works if rendered at the bottom:
export function OrderDetailsShippingWithModal(props) {
  // We can't render the modal here because the state is in OrderDetailsShipping
  // Wait, I should just render the modal in OrderDetailsShipping!
  // I will just put it at the bottom of the OrderDetailsShipping fragment.
}
