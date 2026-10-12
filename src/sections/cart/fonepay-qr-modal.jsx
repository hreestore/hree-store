"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "react-qr-code";
import { checkFonepayStatus } from "@/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAYMENT_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Status Screens ───────────────────────────────────────────────────────────
function PaidScreen({ amount, onViewOrder }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-40" />
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-green-500 shadow-lg shadow-green-200">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-black text-green-600 tracking-tight">
          Payment Successful!
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          NPR {(amount ?? 0).toLocaleString()} paid via Fonepay
        </p>
      </div>
      <button
        onClick={onViewOrder}
        className="mt-2 px-8 py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 active:scale-95 transition-all shadow-md shadow-green-200"
      >
        View Order
      </button>
    </div>
  );
}

function FailedScreen({ onRetry, onCancel }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-100">
        <svg
          className="w-12 h-12 text-red-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-black text-red-600 tracking-tight">
          Payment Failed
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The payment could not be completed. You can retry or choose another
          method.
        </p>
      </div>
      <div className="flex gap-3 mt-2">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-colors"
          style={{ backgroundColor: "#711a20" }}
        >
          Retry Payment
        </button>
      </div>
    </div>
  );
}

function TimeoutScreen({ onRetry, onCancel }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-amber-100">
        <svg
          className="w-12 h-12 text-amber-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" d="M12 6v6l4 2" />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-black text-amber-600 tracking-tight">
          QR Expired
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          The payment window has expired. Please try again.
        </p>
      </div>
      <div className="flex gap-3 mt-2">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-colors"
          style={{ backgroundColor: "#711a20" }}
        >
          Generate New QR
        </button>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
/**
 * FonepayQRModal
 *
 * Props:
 *  open          – boolean controlling visibility
 *  fonepayData   – the `data` object from POST /api/frontend/user/fonepay/initiate/{orderId}
 *                  Expected: { prn, amount, qr_message, ... }
 *  orderId       – numeric order ID (for navigation after payment)
 *  onClose       – called when the user dismisses/cancels
 *  onSuccess     – called with (orderId) after payment_status === "paid"
 *  onRetry       – called when the user wants to re-initiate Fonepay
 */
export function FonepayQRModal({
  open,
  fonepayData,
  orderId,
  onClose,
  onSuccess,
  onRetry,
}) {
  console.log(
    "[🎯 MODAL RENDER] open:",
    open,
    "hasFonepayData:",
    !!fonepayData,
  );
  const [paymentStatus, setPaymentStatus] = useState("pending"); // 'pending' | 'paid' | 'failed' | 'timeout'
  const [isChecking, setIsChecking] = useState(false);
  const [remainingMs, setRemainingMs] = useState(PAYMENT_TIMEOUT_MS);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  console.log("[FonepayQRModal] Rendered with props:", {
    open,
    hasFonepayData: !!fonepayData,
    orderId,
    fonepayDataKeys: fonepayData ? Object.keys(fonepayData) : [],
  });

  // Track when open prop changes
  useEffect(() => {
    console.log("🔔 useEffect: open prop changed to:", open);
  }, [open]);

  useEffect(() => {
    console.log(
      "🔔 useEffect: fonepayData changed, has qr_message:",
      !!fonepayData?.qr_message,
    );
  }, [fonepayData]);

  // Use refs for timers and mutable state that shouldn't trigger re-renders
  const countdownIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const wsRef = useRef(null);
  // Store latest callbacks in refs so the interval never has stale closures
  const onSuccessRef = useRef(onSuccess);
  const orderIdRef = useRef(orderId);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

  const stopAll = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Single poll function using ref for prn to avoid stale closure
  const prnRef = useRef(null);
  const doCheck = useCallback(async () => {
    const prn = prnRef.current;
    if (!prn) return;

    if (isWebSocketConnected) {
      console.log("[Fonepay] WebSocket available; skipping manual fallback status check.");
      return;
    }

    // Timeout guard
    if (
      startTimeRef.current &&
      Date.now() - startTimeRef.current >= PAYMENT_TIMEOUT_MS
    ) {
      stopAll();
      setPaymentStatus("timeout");
      return;
    }

    try {
      setIsChecking(true);
      const response = await checkFonepayStatus(prn);
      const rawStatus = response?.data?.payment_status;
      const nestedStatus = response?.data?.status_response?.paymentStatus;
      const fonepayStatus = response?.data?.fonepay_status;
      const normalizedStatus = String(
        rawStatus || nestedStatus || fonepayStatus || "pending",
      ).toLowerCase();
      console.log("[Fonepay] status check:", {
        rawStatus,
        nestedStatus,
        fonepayStatus,
        normalizedStatus,
      });

      if (["paid", "success"].includes(normalizedStatus)) {
        stopAll();
        prnRef.current = null;
        setPaymentStatus("paid");
        return;
      } else if (["failed", "error"].includes(normalizedStatus)) {
        console.log(
          "[Fonepay] Polling returned failed/error. Ignoring to allow user to scan.",
          normalizedStatus,
        );
        // We do not stop polling here because some gateways return 'failed' before the payment is actually completed.
      }
      // "pending" → keep polling
    } catch (err) {
      console.warn("[Fonepay] status check error:", err);
    } finally {
      setIsChecking(false);
    }
  }, [isWebSocketConnected, stopAll]);

  // Start everything when modal opens with valid data
  useEffect(() => {
    if (!open || !fonepayData?.prn) return;

    console.log("[Fonepay] Modal opened with data:", fonepayData);

    // Sync the prn ref
    prnRef.current = fonepayData.prn;
    startTimeRef.current = Date.now();

    // Reset UI state
    setPaymentStatus("pending");
    setRemainingMs(PAYMENT_TIMEOUT_MS);
    setIsChecking(false);
    setIsWebSocketConnected(false);

    // Countdown ticker (every second)
    countdownIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, PAYMENT_TIMEOUT_MS - elapsed);
      setRemainingMs(remaining);
      if (remaining === 0) {
        stopAll();
        setPaymentStatus("timeout");
      }
    }, 1000);

    // WebSocket setup
    const wsUrl =
      fonepayData?.thirdparty_qr_websocket_url ||
      fonepayData?.qr_response?.thirdpartyQrWebSocketUrl ||
      fonepayData?.qr_response?.merchantWebSocketUrl ||
      fonepayData?.thirdpartyQrWebSocketUrl ||
      fonepayData?.merchantWebSocketUrl;
    if (wsUrl) {
      try {
        console.log("[Fonepay] Connecting to WebSocket:", wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("[Fonepay] WebSocket connected");
          setIsWebSocketConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            console.log("[Fonepay] WS message received:", event.data);
            const data = JSON.parse(event.data);

            if (data.transactionStatus) {
              const txStatus =
                typeof data.transactionStatus === "string"
                  ? JSON.parse(data.transactionStatus)
                  : data.transactionStatus;

              if (txStatus.qrVerified) {
                console.log("[Fonepay] QR Verified via WS");
                // Optional: Show "Scanned" state in UI here if desired
              }

              if (
                txStatus.paymentSuccess === true ||
                (txStatus.success === true &&
                  txStatus.message === "Request Complete")
              ) {
                console.log("[Fonepay] Payment Success via WS");
                stopAll();
                prnRef.current = null;
                setPaymentStatus("paid");
              } else if (
                txStatus.message === "Request Failed" ||
                txStatus.paymentSuccess === "failed"
              ) {
                console.log("[Fonepay] Payment Failed via WS");
                stopAll();
                setPaymentStatus("failed");
              } else {
                console.log(
                  "[Fonepay] WS status update (ignoring paymentSuccess=false):",
                  txStatus,
                );
              }
            }
          } catch (err) {
            console.error("[Fonepay] WS message parse error:", err);
          }
        };

        ws.onerror = (error) => {
          console.warn("[Fonepay] WS connection error (fallback polling is available):", error);
          setIsWebSocketConnected(false);
        };

        ws.onclose = () => {
          console.log("[Fonepay] WS Connection closed");
          setIsWebSocketConnected(false);
        };
      } catch (err) {
        console.error("[Fonepay] WS Connection failed:", err);
      }
    }

    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fonepayData?.prn]);

  // Don't render anything when closed
  if (!open) return null;

  const { qr_message, amount, prn } = fonepayData || {};

  console.log("🎯 MODAL RENDERING WITH DATA:", {
    open,
    qr_message: !!qr_message,
    qr_message_length: qr_message?.length,
    amount,
    prn,
  });

  const modalContent = (
    // Backdrop — clicking outside dismisses (only when pending)
    <div
      className="fixed inset-0 z-[1300] flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", padding: "0" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && paymentStatus === "pending")
          onClose?.();
      }}
    >
      {/* Sheet on mobile / centred card on desktop */}
      <div
        className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        style={{ maxHeight: "95dvh", overflowY: "auto" }}
      >
        {/* ── Header ── */}
        <div
          style={{ backgroundColor: "#ffffff" }}
          className="px-6 py-4 flex items-center gap-3 shadow-md"
        >
          <div className="flex items-end gap-1">

            <img src="/img/fonepay/connect.png" alt="Fonepay Connect" width="20" />
            <img src="/img/fonepay/Checkout_by_Fonepay.png" alt="Fonepay Checkout" width="50" />
          </div>
          <span className="text-red-700 font-black tracking-tight text-lg">
            Fonepay
          </span>
          <div className="flex-1" />
          {paymentStatus === "pending" && (
            <button
              onClick={onClose}
              className="text-white opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Close"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* ── Body ── */}
        <div className="px-6 pb-8 pt-5">
          {paymentStatus === "paid" && (
            <PaidScreen
              amount={amount}
              onViewOrder={() => onSuccess?.(orderId)}
            />
          )}

          {paymentStatus === "failed" && (
            <FailedScreen onRetry={onRetry} onCancel={onClose} />
          )}

          {paymentStatus === "timeout" && (
            <TimeoutScreen onRetry={onRetry} onCancel={onClose} />
          )}

          {paymentStatus === "pending" && (
            <div className="flex flex-col items-center gap-4">
              {/* Title */}
              <div className="text-center">
                <h3 className="text-lg font-black tracking-tight text-gray-900">
                  Scan to Pay
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Open your Fonepay-enabled banking app and scan the QR below
                </p>
              </div>

              {/* Amount */}
              <div
                className="flex items-center gap-2 rounded-xl px-5 py-2 border"
                style={{
                  borderColor: "rgba(113,26,32,0.2)",
                  backgroundColor: "rgba(113,26,32,0.05)",
                }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "#711a20" }}
                >
                  Amount
                </span>
                <span
                  className="text-xl font-black"
                  style={{ color: "#711a20" }}
                >
                  NPR {(amount ?? 0).toLocaleString()}
                </span>
              </div>

              {/* QR Code */}
              {qr_message ? (
                <>
                  {console.log(
                    "🎯 RENDERING QR CODE with message length:",
                    qr_message?.length,
                  )}
                  <div className="relative p-6 bg-white rounded-2xl border border-gray-200 shadow-lg flex items-center justify-center">
                    <div
                      style={{
                        width: "220px",
                        height: "220px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <QRCode
                        value={qr_message}
                        size={220}
                      />
                    </div>
                    {/* Scanning bar animation */}
                    <div className="absolute inset-x-4 top-4 bottom-4 pointer-events-none overflow-hidden rounded-lg">
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          height: "2px",
                          backgroundColor: "rgba(113,26,32,0.6)",
                          animation: "fonepay-scan 2.2s ease-in-out infinite",
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-56 h-56 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
                  <span className="text-gray-400 text-sm">
                    QR Code Loading...
                  </span>
                </div>
              )}

              <style>{`
                @keyframes fonepay-scan {
                  0%   { top: 0%;   opacity: 1; }
                  50%  { top: 100%; opacity: 0.5; }
                  100% { top: 0%;   opacity: 1; }
                }
              `}</style>

              {/* Countdown + polling status */}
              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono font-bold text-gray-700">
                  {formatCountdown(remainingMs)}
                </span>
                <span className="text-gray-300">|</span>
                {isChecking ? (
                  <span
                    className="font-medium animate-pulse"
                    style={{ color: "#711a20" }}
                  >
                    Checking payment…
                  </span>
                ) : (
                  <span className="text-gray-400">Waiting for payment</span>
                )}
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: isChecking ? "#711a20" : "#d1d5db",
                    animation: isChecking
                      ? "ping 1s cubic-bezier(0,0,0.2,1) infinite"
                      : "none",
                  }}
                />
              </div>

              {/* PRN reference */}
              <div className="text-center">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                  Reference ID
                </span>
                <p className="text-xs font-mono text-gray-600 mt-0.5 select-all">
                  {prn}
                </p>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={doCheck}
                  disabled={isChecking}
                  className="flex items-center gap-1.5 text-xs font-semibold disabled:opacity-40 transition-opacity"
                  style={{ color: "#711a20" }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{
                      animation: isChecking
                        ? "spin 1s linear infinite"
                        : "none",
                    }}
                  >
                    <path
                      d="M12.25 7A5.25 5.25 0 1 1 7 1.75"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 1.75V4.5L9.25 2.625"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {isChecking ? "Checking…" : "Check payment status"}
                </button>
                {!isWebSocketConnected && (
                  <span className="text-[11px] text-gray-400">
                    Fallback check when websocket is unavailable.
                  </span>
                )}
              </div>

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

              {/* Instructions */}
              <div className="w-full mt-1 flex flex-col gap-2.5">
                {[
                  "Open your banking app (NIC Asia, Global IME, Laxmi Sunrise, etc.)",
                  'Tap "Fonepay" or "Scan QR" inside the app',
                  "Scan this QR and confirm the payment amount",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span
                      className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold mt-0.5"
                      style={{
                        backgroundColor: "rgba(113,26,32,0.1)",
                        color: "#711a20",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-xs text-gray-500 leading-relaxed">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    const { createPortal } = require("react-dom");
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}
