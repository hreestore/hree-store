import { useState } from "react";
import { useBoolean } from "@/hooks";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowLeft, MapPin, X, Package } from "lucide-react";

import { fDateTime } from "@/utils/format-time";

import { OrderUpdateForm } from "./order-update-form";
import { OrderAddressUpdateForm } from "./order-address-update-form";

// ----------------------------------------------------------------------

export function OrderDetailsToolbar({
  status,
  backHref,
  createdAt,
  orderNumber,
  orderId,
}) {
  const openOrderUpdateForm = useBoolean();
  const openOrderAddressUpdateForm = useBoolean();
  const [updateStatus, setUpdateStatus] = useState("");

  const isOrderDeliveredOrCompleted = ["delivered", "completed"].includes(status);
  const isOrderCancelledOrReturned = ["returned", "cancelled"].includes(status);

  const handleOrderReturn = (newStatus) => {
    openOrderUpdateForm.onTrue();
    setUpdateStatus(newStatus);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "confirmed":
      case "delivered":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "cancelled":
      case "returned":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-start gap-4">
          <Link
            href={backHref}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 border border-gray-200 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 " />
          </Link>

          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tighter">
                Order #{orderNumber}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>
            <p className="text-sm  font-medium">
              {fDateTime(createdAt)}
            </p>
          </div>
        </div>

        {!isOrderCancelledOrReturned && (
          <div className="flex items-center gap-3">
            {isOrderDeliveredOrCompleted ? (
              <button
                onClick={() => handleOrderReturn("returned")}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-full text-sm font-black uppercase tracking-wider hover:bg-red-100 border border-red-200 transition-all"
              >
                <Package className="w-4 h-4" />
                Return
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleOrderReturn("cancelled")}
                  className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-full text-sm font-black uppercase tracking-wider hover:bg-red-100 border border-red-200 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>

                <button
                  onClick={openOrderAddressUpdateForm.onTrue}
                  className="flex items-center gap-2 px-6 py-3 bg-[#711a20] text-[#ffffff] rounded-full text-sm font-black uppercase tracking-wider hover:bg-[#a00000] transition-all shadow-lg"
                >
                  <MapPin className="w-4 h-4" />
                  Change Address
                </button>
              </>
            )}
          </div>
        )}
      </motion.div>

      {orderId && (
        <OrderUpdateForm
          open={openOrderUpdateForm.value}
          onClose={openOrderUpdateForm.onFalse}
          orderUpdateData={{
            id: orderId,
            status: updateStatus,
          }}
        />
      )}

      {orderId && (
        <OrderAddressUpdateForm
          open={openOrderAddressUpdateForm.value}
          onClose={openOrderAddressUpdateForm.onFalse}
          orderUpdateData={{
            id: orderId,
            status: status,
          }}
        />
      )}
    </>
  );
}
