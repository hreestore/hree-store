import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, RotateCcw, X, Loader2 } from "lucide-react";

import { Form, Field } from "@/components/hook-form";
import { toast } from "@/components/snackbar";

import {
  updateOrderStatus,
  useGetMutateOrders,
  useGetMutateOrderDetail,
  useGetOrderDetail,
} from "@/api";

export const schema = zod.object({
  remarks: zod.string(),
});

export function OrderUpdateForm({ open, onClose, orderUpdateData }) {
  const mutateOrders = useGetMutateOrders();
  const mutateOrderDetail = useGetMutateOrderDetail(orderUpdateData?.id);
  const { order } = useGetOrderDetail(orderUpdateData?.id);

  const isCancelRequested = orderUpdateData?.status === "cancelled";

  const title = isCancelRequested
    ? "Cancel Order"
    : "Return Order";

  const subtitle = isCancelRequested
    ? "Are you sure you want to cancel this order? Please provide a reason below."
    : "Are you sure you want to request a return for this order? Please provide details below.";

  const defaultValues = { remarks: "" };

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const updateData = {
        id: orderUpdateData.id,
        status: orderUpdateData.status,
        customer_address_id:
          order?.customer_address?.address_id ||
          order?.address?.address_id ||
          order?.customer_address_id,
        ...data,
      };

      const response = await updateOrderStatus(updateData);
      if (!response?.success) throw response;

      toast.success(
        response?.message ||
        `Your order has been successfully ${isCancelRequested ? "cancelled" : "returned"}!`
      );

      reset();
      await mutateOrderDetail();
      await mutateOrders();
      onClose();
    } catch (error) {
      const errorMessage =
        error?.message ||
        (error?.fieldErrors &&
          Object.values(error.fieldErrors).flat().join(", ")) ||
        "Oops! Something went wrong. Please try again.";
      toast.error(errorMessage);
    }
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[#081a1a] text-white border border-[#711a20]/40 shadow-[0_25px_60px_-15px_rgba(113,26,32,0.5)] overflow-hidden transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${isCancelRequested
                  ? "bg-[#711a20] text-white"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
            >
              {isCancelRequested ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <RotateCcw className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-white leading-none">
                {title}
              </h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <Form methods={methods} onSubmit={onSubmit}>
          <div className="flex flex-col gap-5 p-6">
            {/* Remarks field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Remarks / Reason <span className="text-[#ff3b4a]">*</span>
              </label>
              <Field.Text
                name="remarks"
                placeholder="Enter remarks or reason..."
                multiline
                rows={3}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "0.75rem",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.15)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#711a20",
                    },
                  },
                  "& .MuiFormHelperText-root": {
                    color: "#ff3b4a",
                    fontWeight: 500,
                    marginLeft: 0,
                  },
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-white/20 text-xs font-bold uppercase tracking-wider text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${isCancelRequested
                    ? "bg-[#711a20] hover:bg-[#8e2129] shadow-[#711a20]/40"
                    : "bg-white text-black hover:bg-gray-200"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isCancelRequested ? "Cancelling..." : "Submitting..."}</span>
                  </>
                ) : isCancelRequested ? (
                  "Confirm Cancel"
                ) : (
                  "Submit Return"
                )}
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}