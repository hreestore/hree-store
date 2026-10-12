"use client";

import { useEffect } from "react";

import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getProfileRequest } from "@/redux/actions";

import { CartOverview } from "../cart-overview";
import { CartSteps } from "../cart-steps";
import { CartBillingAddress } from "../cart-billing-address";

// ----------------------------------------------------------------------

const CHECKOUT_STEPS = ["Cart", "Billing & address"];

export function CartView() {
  const dispatch = useAppDispatch();

  const { activeStep } = useAppSelector((state) => state.cart);
  const { isLogin } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isLogin) {
      dispatch(getProfileRequest());
    }
  }, [isLogin, dispatch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-20 py-16">
      <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mb-8 md:mb-5">
        Shopping <span className="text-[#711a20]">Cart</span>
      </h1>

      {/* <Grid container justifyContent={"flex-start"}>
        <Grid size={{ xs: 12, md: 8 }}>
          <CartSteps steps={CHECKOUT_STEPS} activeStep={activeStep} />
        </Grid>
      </Grid> */}

      <>
        {activeStep === 0 && <CartOverview />}

        {activeStep === 1 && <CartBillingAddress />}
      </>
    </div>
  );
}
