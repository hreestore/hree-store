"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, ShoppingBag, ArrowRight } from "lucide-react";

import { useAppDispatch } from "@/redux/hooks";
import { getCartDataRequest } from "@/redux/actions";
import { paths } from "@/routes/paths";

// eSewa v2 sends a base64-encoded JSON in the `data` query param.
// Shape: { transaction_uuid, transaction_code, status, total_amount, ... }
function decodeEsewaData(raw) {
  try {
    return JSON.parse(atob(raw));
  } catch {
    return null;
  }
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [esewaData, setEsewaData] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eSewa v2 encodes everything in a single `data` param
    const raw = searchParams.get("data");

    if (raw) {
      const decoded = decodeEsewaData(raw);
      setEsewaData(decoded);
    }

    // Refresh the cart (should now be empty after a successful order)
    dispatch(getCartDataRequest());

    setReady(true);
  }, [searchParams, dispatch]);

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-emerald-500" />
          <p className="text-lg font-semibold text-gray-700">Loading…</p>
        </div>
      </main>
    );
  }

  return (
    <main className=" flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-20 h-20 text-emerald-500" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Payment Successful!
          </h1>
          <p className="text-gray-500 text-sm">
            Your payment has been received. Thank you for your order!
          </p>

          {/* Show decoded eSewa transaction details if available */}
          {esewaData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl text-left space-y-1 text-sm">
              {esewaData.transaction_uuid && (
                <p className="text-gray-500">
                  <span className="font-semibold text-gray-700">Transaction ID: </span>
                  <span className="font-mono break-all">{esewaData.transaction_uuid}</span>
                </p>
              )}
              {esewaData.transaction_code && (
                <p className="text-gray-500">
                  <span className="font-semibold text-gray-700">eSewa Code: </span>
                  {esewaData.transaction_code}
                </p>
              )}
              {esewaData.total_amount && (
                <p className="text-gray-500">
                  <span className="font-semibold text-gray-700">Amount: </span>
                  Rs. {esewaData.total_amount}
                </p>
              )}
            </div>
          )}

          {/* Fallback: show raw transaction_uuid if present (no data param) */}
          {!esewaData && searchParams.get("transaction_uuid") && (
            <p className="text-xs text-gray-400 font-mono break-all">
              Transaction: {searchParams.get("transaction_uuid")}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href={paths.order.root}
            className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-tight hover:bg-[#711a20] transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            My Orders
          </Link>
          <Link
            href={paths.home}
            className="flex items-center justify-center gap-2 border-2 border-black px-6 py-3 rounded-full font-bold text-sm uppercase tracking-tight hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
