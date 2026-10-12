// "use client";

// import { useState } from "react";

// import {
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     TextField,
//     Button,
//     Box,
//     Typography,
//     Alert,
//     Stack,
//     Backdrop,
//     CircularProgress,
// } from "@mui/material";
// import LoadingButton from "@mui/lab/LoadingButton";

// // ----------------------------------------------------------------------

// export function OtpVerificationDialog({
//     open,
//     onClose,
//     email,
//     expiryMinutes = 5,
//     onVerify,
//     isVerifying = false,
//     error = "",
// }) {
//     const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);

//     const handleOtpChange = (index, value) => {
//         if (value && !/^[0-9]$/.test(value)) return;

//         const newOtpValues = [...otpValues];
//         newOtpValues[index] = value;
//         setOtpValues(newOtpValues);

//         // Auto-focus next input
//         if (value && index < 5) {
//             const nextInput = document.getElementById(`otp-input-${index + 1}`);
//             if (nextInput) nextInput.focus();
//         }
//     };

//     const handleOtpPaste = (e) => {
//         e.preventDefault();
//         const pastedData = e.clipboardData.getData("text").trim();

//         if (/^\d{6}$/.test(pastedData)) {
//             const newOtpValues = pastedData.split("");
//             setOtpValues(newOtpValues);

//             const lastInput = document.getElementById("otp-input-5");
//             if (lastInput) lastInput.focus();
//         }
//     };

//     const handleOtpKeyDown = (index, e) => {
//         if (e.key === "Backspace" && !otpValues[index] && index > 0) {
//             const prevInput = document.getElementById(`otp-input-${index - 1}`);
//             if (prevInput) prevInput.focus();
//         }
//     };

//     const handleVerifyClick = () => {
//         const otp = otpValues.join("");
//         if (otp.length === 6) {
//             onVerify(otp);
//         }
//     };

//     const handleClose = () => {
//         setOtpValues(["", "", "", "", "", ""]);
//         onClose();
//     };

//     return (
//         <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
//             <DialogTitle>
//                 <Box sx={{ textAlign: "center" }}>
//                     <Typography variant="h4">Verify OTP</Typography>
//                     <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
//                         Enter the 6-digit code sent to
//                     </Typography>
//                     <Typography variant="subtitle2" sx={{ color: "primary.main", mt: 0.5 }}>
//                         {email}
//                     </Typography>
//                     <Typography variant="caption" sx={{ color: "warning.main", mt: 0.5, display: "block" }}>
//                         OTP expires in {expiryMinutes} {expiryMinutes === 1 ? "minute" : "minutes"}
//                     </Typography>
//                 </Box>
//             </DialogTitle>

//             <DialogContent>
//                 <Stack spacing={3}>
//                     {error && <Alert severity="error">{error}</Alert>}

//                     <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", mt: 2 }}>
//                         {otpValues.map((value, index) => (
//                             <TextField
//                                 key={index}
//                                 id={`otp-input-${index}`}
//                                 value={value}
//                                 onChange={(e) => handleOtpChange(index, e.target.value)}
//                                 onKeyDown={(e) => handleOtpKeyDown(index, e)}
//                                 onPaste={handleOtpPaste}
//                                 inputProps={{
//                                     maxLength: 1,
//                                     style: { textAlign: "center", fontSize: "1.5rem", fontWeight: "bold" },
//                                 }}
//                                 sx={{ width: 56, "& input": { padding: "12px" } }}
//                                 autoFocus={index === 0}
//                             />
//                         ))}
//                     </Box>
//                 </Stack>
//             </DialogContent>

//             <DialogActions sx={{ px: 3, pb: 3, flexDirection: "column", gap: 1 }}>
//                 <LoadingButton
//                     fullWidth
//                     size="large"
//                     variant="contained"
//                     onClick={handleVerifyClick}
//                     loading={isVerifying}
//                     disabled={otpValues.join("").length !== 6}
//                 >
//                     Verify OTP & Complete Order
//                 </LoadingButton>
//                 <Button fullWidth size="large" variant="outlined" onClick={handleClose} disabled={isVerifying}>
//                     Cancel
//                 </Button>
//             </DialogActions>

//             {/* Backdrop loader during OTP verification */}
//             <Backdrop
//                 open={isVerifying}
//                 sx={{
//                     color: '#fff',
//                     zIndex: (theme) => theme.zIndex.modal + 1,
//                     position: 'absolute',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     gap: 2,
//                 }}
//             >
//                 <CircularProgress color="inherit" size={60} />
//                 <Typography variant="h6">Verifying OTP...</Typography>
//             </Backdrop>
//         </Dialog>
//     );
// }

"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, X } from "lucide-react";

export function OtpVerificationDialog({
    open,
    onClose,
    email,
    expiryMinutes = 5,
    onVerify,
    isVerifying = false,
    error = "",
}) {
    const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);

    // Clear values on dialog open/close status change
    useEffect(() => {
        if (!open) {
            setOtpValues(["", "", "", "", "", ""]);
        }
    }, [open]);

    if (!open) return null;

    const handleOtpChange = (index, value) => {
        if (value && !/^[0-9]$/.test(value)) return;

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);

        // Auto-focus next input field box
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();

        if (/^\d{6}$/.test(pastedData)) {
            const newOtpValues = pastedData.split("");
            setOtpValues(newOtpValues);

            const lastInput = document.getElementById("otp-input-5");
            if (lastInput) lastInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleVerifyClick = () => {
        const otp = otpValues.join("");
        if (otp.length === 6) {
            onVerify(otp);
        }
    };

    const handleClose = () => {
        setOtpValues(["", "", "", "", "", ""]);
        onClose();
    };

    const isOtpComplete = otpValues.join("").length === 6;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Backdrop Layer Overlay */}
            <div
                className="absolute inset-0 bg-[#081a1a]/60 backdrop-blur-sm transition-opacity"
                onClick={!isVerifying ? handleClose : undefined}
            />

            {/* Main Dialog Brutalist Container */}
            <div className="relative w-full max-w-md  border-[3px] border-[#f7e6dc] shadow-[8px_8px_0_0_rgba(8,26,26,1)] rounded-3xl overflow-hidden transform transition-all z-10 p-6 md:p-8">

                {/* Header Information Area */}
                <div className="text-center mb-6">
                    <div className="mb-4 inline-block">
                        <span className="font-display font-black text-xl uppercase tracking-tighter text-white bg-[#081a1a] px-4 py-1.5 border-2 border-[#081a1a] shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] inline-block transform -rotate-1">
                            Verify OTP
                        </span>
                    </div>
                    <p className="text-sm font-bold text-gray-600">
                        Enter the 6-digit verification code sent to
                    </p>
                    <p className="text-sm font-black text-[#081a1a] break-all mt-0.5">
                        {email}
                    </p>

                    {/* Expiry Warning Box Banner */}
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-50 border-2 border-amber-500 rounded-xl px-3 py-1 text-amber-800 text-xs font-bold uppercase tracking-tight">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Expires in {expiryMinutes} {expiryMinutes === 1 ? "minute" : "minutes"}</span>
                    </div>
                </div>

                {/* Form Processing Error Messages Container */}
                {error && (
                    <div className="mb-5 bg-red-50 border-2 border-red-600 text-red-700 rounded-xl p-3 text-sm font-bold flex items-center gap-2">
                        <X className="w-4 h-4 flex-shrink-0 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}

                {/* OTP Inputs Box Array Flex */}
                <div className="flex gap-2 justify-center my-6">
                    {otpValues.map((value, index) => (
                        <input
                            key={index}
                            id={`otp-input-${index}`}
                            type="text"
                            maxLength={1}
                            value={value}
                            autoFocus={index === 0}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={handleOtpPaste}
                            disabled={isVerifying}
                            className="w-12 h-14 text-center text-xl font-black text-[#081a1a] bg-white border-[3px] border-[#081a1a] rounded-xl shadow-[2px_2px_0_0_rgba(8,26,26,1)] focus:outline-none focus:border-blue-600 focus:shadow-[3px_3px_0_0_rgba(8,26,26,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    ))}
                </div>

                {/* Submit and Cancel Processing Actions Panel */}
                <div className="space-y-3 mt-6">
                    <button
                        type="button"
                        onClick={handleVerifyClick}
                        disabled={!isOtpComplete || isVerifying}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#081a1a] border-[3px] border-[#081a1a] text-white font-display font-black uppercase tracking-tight rounded-xl text-sm shadow-[4px_4px_0_0_rgba(8,26,26,0.2)] hover:bg-[#153131] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:shadow-none transition-all"
                    >
                        {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Verify OTP & Complete Order</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isVerifying}
                        className="w-full py-3 px-4 bg-white border-[3px] border-[#081a1a] text-[#081a1a] font-display font-black uppercase tracking-tight rounded-xl text-sm shadow-[3px_3px_0_0_rgba(8,26,26,1)] hover:bg-gray-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Cancel
                    </button>
                </div>

                {/* Local Blocking Verify Backdrop Layer System */}
                {isVerifying && (
                    <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center gap-3 p-4">
                        <Loader2 className="w-10 h-10 text-[#081a1a] animate-spin" />
                        <span className="font-display font-black uppercase tracking-tight text-sm text-[#081a1a]">
                            Verifying OTP...
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}