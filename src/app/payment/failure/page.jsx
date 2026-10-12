"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, Loader2, ShoppingBag, RefreshCw } from "lucide-react";

import { paths } from "@/routes/paths";

function decodeEsewaData(raw) {
  try {
    return JSON.parse(atob(raw));
  } catch {
    return null;
  }
}

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const [esewaData, setEsewaData] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = searchParams.get("data");
    if (raw) {
      setEsewaData(decodeEsewaData(raw));
    }
    setReady(true);
  }, [searchParams]);

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-red-400" />
          <p className="text-lg font-semibold text-gray-700">Loading…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <XCircle className="w-20 h-20 text-red-500" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            Payment Failed
          </h1>
          <p className="text-gray-500 text-sm">
            Your payment was not completed. Please try again or use a different payment method.
          </p>

          {esewaData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-2xl text-left space-y-1 text-sm">
              {esewaData.transaction_uuid && (
                <p className="text-gray-500">
                  <span className="font-semibold text-gray-700">Transaction ID: </span>
                  <span className="font-mono break-all">{esewaData.transaction_uuid}</span>
                </p>
              )}
              {esewaData.status && (
                <p className="text-gray-500">
                  <span className="font-semibold text-gray-700">Status: </span>
                  {esewaData.status}
                </p>
              )}
            </div>
          )}

          {!esewaData && searchParams.get("transaction_uuid") && (
            <p className="text-xs text-gray-400 font-mono break-all">
              Transaction: {searchParams.get("transaction_uuid")}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href={paths.cart}
            className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold text-sm uppercase tracking-tight hover:bg-[#711a20] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Link>
          <Link
            href={paths.order.root}
            className="flex items-center justify-center gap-2 border-2 border-black px-6 py-3 rounded-full font-bold text-sm uppercase tracking-tight hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            My Orders
          </Link>
        </div>
      </div>
    </main>
  );
}
