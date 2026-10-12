import { z as zod } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  removeDiscount,
  setCartCalculation,
  clearCartCalculation,
} from "@/redux/actions";

import { fCurrency } from "@/utils/format-number";

import { toast } from "@/components/snackbar";
import { Iconify } from "@/components/iconify";

import { calculateCart, checkDiscount } from "@/api";

// ----------------------------------------------------------------------

export const DiscountCodeSchema = zod.object({
  discount_code: zod.string().min(1, { message: "Discount code is required!" }),
});

export function CartSummary({
  isAddressSelected,
  selectedAddressId,
  selectedPaymentMethod = "fonepay",
  onPaymentMethodChange,
  upayaCharge = 0,
  showUpayaSelectors = false,
}) {
  const dispatch = useAppDispatch();

  const { total, subtotal, shipping, discount, items } = useAppSelector(
    (state) => state.cart,
  );

  const { isLogin } = useAppSelector((state) => state.auth);

  const [calculation, setCalculation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const defaultValues = {
    discount_code: "",
  };

  const methods = useForm({
    resolver: zodResolver(DiscountCodeSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const runCalculation = async (discountCode) => {
    if (!isLogin) return;

    if (!items || items.length === 0) {
      setCalculation(null);
      dispatch(clearCartCalculation());
      return;
    }

    try {
      setIsCalculating(true);

      const safeDiscountCode =
        typeof discountCode === "string"
          ? discountCode
          : typeof discountCode === "object" && discountCode?.code
            ? String(discountCode.code)
            : undefined;

      const payload = {
        ...(safeDiscountCode ? { discount_code: safeDiscountCode } : {}),
        ...(isAddressSelected &&
          selectedAddressId &&
          selectedAddressId !== "guest-address" &&
          !showUpayaSelectors
          ? { customer_address_id: selectedAddressId }
          : {}),
      };

      const response = await calculateCart(payload);

      if (response?.success && response?.data) {
        setCalculation(response.data);
        dispatch(setCartCalculation(response.data));
      } else {
        dispatch(clearCartCalculation());
      }
    } catch (error) {
      if (discountCode) {
        toast.error(
          error?.message || "Couldn't apply discount code! Please try again.",
        );
      }
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    runCalculation(discount?.code || undefined);
  }, [isLogin, isAddressSelected, selectedAddressId, subtotal, items?.length]);

  const handleRemoveDiscount = async () => {
    dispatch(removeDiscount());
    await runCalculation(undefined);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const discountCode = data.discount_code?.trim()?.toUpperCase();
      const validationResponse = await checkDiscount({
        discount_code: discountCode,
      });
      if (!validationResponse?.success) {
        toast.error(
          validationResponse?.message ||
          "Couldn't apply discount code! Please try again.",
        );
        return;
      }

      await runCalculation(discountCode);
      reset();
      toast.success("Discount applied!");
    } catch (error) {
      const discountFieldError = error?.fieldErrors?.discount_code?.[0];
      if (discountFieldError) {
        methods.setError("discount_code", {
          type: "server",
          message: discountFieldError,
        });
      }
      toast.error(
        error?.message || "Couldn't apply discount code! Please try again.",
      );
    }
  });

  const originalAmount = calculation?.original_total_amount;
  const subtotalAmount = calculation?.subtotal ?? subtotal;
  const discountAmount = calculation?.discount?.amount ?? discount?.amount ?? 0;
  const shippingAmount =
    (calculation?.additional_charges_total ?? shipping) + upayaCharge;
  const totalAmount = (calculation?.total_amount ?? total) + upayaCharge;

  const extractDiscountCode = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (typeof value.code === "string") return value.code;
      if (typeof value.discount_code === "string") return value.discount_code;
      return "";
    }
    return "";
  };

  const appliedDiscountCode =
    extractDiscountCode(calculation?.discount_code) ||
    extractDiscountCode(discount?.code);

  const handleSelectPaymentMethod = (method) => {
    if ((method === "esewa" || method === "fonepay") && !isAddressSelected) {
      toast.error(
        "Please select a delivery address before choosing an online payment method.",
      );
      return;
    }
    if (typeof onPaymentMethodChange === "function") {
      onPaymentMethodChange(method);
    }
  };

  return (
    <>
      {/* ─── Order Summary Card ─── */}
      <div className="rounded-2xl shadow-xl overflow-hidden mb-2">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-display font-black uppercase tracking-tighter">
            Order <span className="text-[#711a20]">Summary</span>
          </h2>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex">
            <span className="flex-grow text-sm font-black uppercase">
              Sub Total
            </span>
            <span className="text-sm font-semibold">
              {fCurrency(originalAmount)}
            </span>
          </div>

          <div className="flex">
            <span className="flex-grow text-sm font-black uppercase">
              Discount (Provisional)
            </span>
            <span className="text-sm font-semibold">
              {discountAmount ? fCurrency(discountAmount) : "-"}
            </span>
          </div>

          {calculation?.tax?.applied && (
            <div className="flex">
              <span className="flex-grow text-sm">
                {calculation.tax.tax_name} ({calculation.tax.percentage}%)
                {calculation.tax.price_includes_tax ? " (Included)" : ""}
              </span>
              <span className="text-sm font-semibold">
                {fCurrency(calculation.tax.tax_amount)}
              </span>
            </div>
          )}

          {isAddressSelected && (
            <div className="flex">
              <span className="flex-grow text-sm">Shipping</span>
              <span className="text-sm font-semibold">
                {shippingAmount > 0 ? fCurrency(shippingAmount) : "Free"}
              </span>
            </div>
          )}

          {calculation?.flash_sale?.has_flash_sale_items &&
            calculation?.flash_sale?.total_flash_sale_savings > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 mt-1 rounded-lg bg-red-50 border border-dashed border-red-200">
                <Iconify
                  icon="solar:fire-bold"
                  width={20}
                  className="text-red-500 shrink-0"
                />
                <span className="flex-grow text-sm font-semibold text-red-800">
                  Flash Sale Savings (Provisional)
                </span>
                <span className="text-sm font-bold text-red-500">
                  {fCurrency(calculation.flash_sale.total_flash_sale_savings)}
                </span>
              </div>
            )}

          {isAddressSelected && (
            <>
              <hr className="border-t border-dashed border-gray-600 my-1" />

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Payment Method
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {/* <button
                    type="button"
                    onClick={() => handleSelectPaymentMethod("esewa")}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${selectedPaymentMethod === "esewa"
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-white border-gray-200 hover:border-gray-400"
                      }`}
                  >
                    <Iconify
                      icon="solar:card-bold"
                      width={20}
                      className={selectedPaymentMethod === "esewa" ? "text-emerald-600" : "text-gray-500"}
                    />
                    <span className={`text-sm font-semibold ${selectedPaymentMethod === "esewa" ? "text-emerald-700" : "text-gray-700"}`}>
                      Pay via eSewa
                    </span>
                  </button> */}

                  {/* Fonepay */}
                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMethod("fonepay")}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${selectedPaymentMethod === "fonepay"
                      ? "border-[#711a20] bg-red-50"
                      : "bg-white border-gray-200 hover:border-gray-400"
                      }`}
                  >
                    {/* <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect
                        width="20"
                        height="20"
                        rx="5"
                        fill={
                          selectedPaymentMethod === "fonepay"
                            ? "#711a20"
                            : "#e5e7eb"
                        }
                      />
                      <text
                        x="3"
                        y="14"
                        fontFamily="sans-serif"
                        fontWeight="900"
                        fontSize="9"
                        fill="white"
                      >
                        FP
                      </text>
                    </svg> */}
                    <div className="flex flex-row items-end gap-1">

                      <img src="img/fonepay/connect.png" alt="" className="h-5 object-contain" />
                      <img src="img/fonepay/Checkout_by_Fonepay.png" alt="" className="h-5 w-auto object-contain" />
                    </div>
                    <span
                      className={`text-sm font-semibold ${selectedPaymentMethod === "fonepay" ? "text-[#711a20]" : "text-gray-700"}`}
                    >
                      Pay via Fonepay
                    </span>
                  </button>
                </div>
                {(selectedPaymentMethod === "esewa" ||
                  selectedPaymentMethod === "fonepay") && (
                    <p className="text-[11px] text-gray-500">
                      {selectedPaymentMethod === "esewa"
                        ? "You will be redirected to eSewa after checkout."
                        : "A Fonepay QR code will appear after checkout. Scan it with your banking app to complete payment."}
                    </p>
                  )}
              </div>
            </>
          )}

          <div className="flex mt-1">
            <span className="flex-grow text-base font-black uppercase tracking-tighter">
              Total
            </span>
            <span className="font-black text-2xl text-[#711a20] uppercase tracking-tighter">
              {fCurrency(totalAmount)}
            </span>
          </div>

          {isLogin && (
            <>
              {appliedDiscountCode ? (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center justify-between p-3 text-sm text-green-800 bg-green-50 rounded-lg border border-green-100">
                    <div>
                      <span className="font-medium">
                        Discount code &quot;{appliedDiscountCode}&quot; applied!
                      </span>
                      {discountAmount > 0 && (
                        <span className="block mt-0.5 text-xs text-green-700">
                          You saved {fCurrency(discountAmount)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveDiscount}
                      className="text-xs font-semibold px-2 py-1 rounded-md hover:bg-green-100 transition-colors shrink-0"
                    >
                      Remove
                    </button>
                  </div>

                  {calculation?.discount_code?.applies_to === "product" &&
                    calculation?.discount_info?.target && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                        <Iconify
                          icon="solar:tag-price-bold"
                          width={18}
                          className="text-green-500 shrink-0"
                        />
                        <span className="text-xs text-gray-500">
                          Discount applied on{" "}
                          <span className="font-semibold text-gray-900">
                            {calculation.discount_info.target.name}
                          </span>{" "}
                          ({fCurrency(discountAmount)} off)
                        </span>
                      </div>
                    )}

                  {calculation?.discount_code?.applies_to === "category" && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                      <Iconify
                        icon="solar:tag-price-bold"
                        width={18}
                        className="text-green-500 shrink-0"
                      />
                      <span className="text-xs text-gray-500">
                        Discount applied on category items (
                        {fCurrency(discountAmount)} off)
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-2 w-full">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      {...methods.register("discount_code", {
                        onChange: (e) => {
                          const upperValue = e.target.value.toUpperCase();
                          setValue("discount_code", upperValue, {
                            shouldValidate: true,
                          });
                        },
                      })}
                      placeholder="Discount code"
                      className="w-full pl-3 pr-24 py-3 text-sm font-medium border border-gray-300 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors focus:bg-[#ffffff]"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || isCalculating}
                      className="absolute right-1 top-1 bottom-1 px-5 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting || isCalculating ? "..." : "Apply"}
                    </button>
                  </div>
                  {methods.formState.errors.discount_code && (
                    <span className="block mt-1.5 text-xs text-red-500 font-medium">
                      {methods.formState.errors.discount_code.message}
                    </span>
                  )}
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── eSewa Payment Card ─── */}
    </>
  );
}
