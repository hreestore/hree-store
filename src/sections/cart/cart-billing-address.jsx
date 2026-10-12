import { useBoolean } from "minimal-shared/hooks";
import { useState, useEffect } from "react";

import Grid from "@mui/material/Grid";
import {
  Stack,
  Box,
  Button,
  Tooltip,
  Card,
  Typography,
  InputAdornment,
  IconButton,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  changeActiveStep,
  setProfileAddresses,
  resetCart,
  setCartCalculation,
  clearCartCalculation,
} from "@/redux/actions";

import { paths } from "@/routes/paths";
import { useRouter } from "@/routes/hooks";
import { Iconify } from "@/components/iconify";
import { toast } from "@/components/snackbar";
import { EmptyContent } from "@/components/empty-content";
import zod from "zod";
import { CartSummary } from "./cart-summary";
import { AddressItem, AddressNewForm } from "../address";

import {
  useGetStates,
  removeAddress,
  createOrder,
  calculateCart,
  initiateEsewaPayment,
  initiateFonepayPayment,
  getUpayaLocations,
  getUpayaDeliveryRate,
} from "@/api";
import { FonepayQRModal } from "./fonepay-qr-modal";
import { Field, Form } from "@/components/hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// ----------------------------------------------------------------------
export const SignUpSchema = zod
  .object({
    name: zod.string().min(1, { message: "Name is required!" }),

    phone_number: zod
      .string()
      .min(1, { message: "Phone number is required!" })
      .regex(/^\d{10}$/, {
        message: "Phone number must be exactly 10 digits!",
      }),

    email: zod
      .string()
      .min(1, { message: "Email is required!" })
      .email({ message: "Email must be a valid email address!" }),

    password: zod
      .string()
      .min(1, { message: "Password is required!" })
      .min(8, { message: "Password must be at least 8 characters!" }),

    password_confirmation: zod
      .string()
      .min(1, { message: "Confirm password is required!" })
      .min(8, { message: "Confirm password must be at least 8 characters!" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match!",
    path: ["password_confirmation"],
  });

export function CartBillingAddress() {
  const dispatch = useAppDispatch();

  const router = useRouter();

  const [selectedAddress, setSelectedAddress] = useState("");
  const [guestAddress, setGuestAddress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("guestAddress"));
    } catch {
      return null;
    }
  });
  const [isEditingGuest, setIsEditingGuest] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("fonepay");

  // Fonepay QR modal state
  const [fonepayModalOpen, setFonepayModalOpen] = useState(false);
  const [fonepayData, setFonepayData] = useState(null);
  const [fonepayOrderId, setFonepayOrderId] = useState(null);

  // Track modal state changes
  useEffect(() => {
    console.log("🔔 [Parent] fonepayModalOpen changed to:", fonepayModalOpen);
  }, [fonepayModalOpen]);

  useEffect(() => {
    console.log(
      "🔔 [Parent] fonepayData changed, has qr_message:",
      !!fonepayData?.qr_message,
    );
  }, [fonepayData]);

  useEffect(() => {
    if (fonepayModalOpen) {
      console.log(
        "🔔 [Parent] fonepayModalOpen is true and should render modal",
      );
    }
  }, [fonepayModalOpen]);

  const { addresses, profile } = useAppSelector((state) => state.profile);
  const { discount, items } = useAppSelector((state) => state.cart);
  const { isLogin, user } = useAppSelector((state) => state.auth);
  console.log(user, "user")
  const addressForm = useBoolean();
  const { states } = useGetStates();

  // Upaya state
  const { vendor } = useAppSelector((state) => state.vendor);
  const upayaDeliveryEnabled = vendor?.upaya_delivery_enabled === true;
  const isPhysicalOrder = items?.some((item) => {
    const type =
      item.product_type ||
      item.product?.product_type ||
      item.itemable?.product_type;
    return type !== "service";
  });
  const showUpayaSelectors = upayaDeliveryEnabled && isPhysicalOrder;
  // Logged-in users don't pick a saved address when Upaya delivery is enabled
  // (the address list is hidden), so the delivery fields are validated on checkout instead.
  const isDeliveryReady =
    selectedAddress !== "" || (isLogin && upayaDeliveryEnabled);

  const [upayaLocations, setUpayaLocations] = useState([]);
  const [upayaAreas, setUpayaAreas] = useState([]);
  const [upayaCharge, setUpayaCharge] = useState(0);
  const [selectedUpayaLocation, setSelectedUpayaLocation] = useState("");
  const [selectedUpayaArea, setSelectedUpayaArea] = useState("");
  const [upayaLocationError, setUpayaLocationError] = useState("");
  const [upayaAreaError, setUpayaAreaError] = useState("");

  // Upaya extra delivery fields
  const [upayaAddress, setUpayaAddress] = useState("");
  const [upayaLandmark, setUpayaLandmark] = useState("");
  const [upayaReceiverName, setUpayaReceiverName] = useState("");
  const [upayaReceiverContact, setUpayaReceiverContact] = useState("");
  const [upayaClientNote, setUpayaClientNote] = useState("");
  const [upayaAddressError, setUpayaAddressError] = useState("");
  const [upayaReceiverNameError, setUpayaReceiverNameError] = useState("");
  const [upayaReceiverContactError, setUpayaReceiverContactError] = useState("");

  const [upayaLocationSearchQuery, setUpayaLocationSearchQuery] = useState("");
  const [isUpayaLocationDropdownOpen, setIsUpayaLocationDropdownOpen] = useState(false);

  const sortedAndFilteredUpayaLocations = upayaLocations
    ?.slice()
    ?.sort((a, b) => a.name.localeCompare(b.name))
    ?.filter((loc) =>
      loc.name.toLowerCase().includes(upayaLocationSearchQuery.toLowerCase())
    );

  const [upayaAreaSearchQuery, setUpayaAreaSearchQuery] = useState("");
  const [isUpayaAreaDropdownOpen, setIsUpayaAreaDropdownOpen] = useState(false);

  const sortedAndFilteredUpayaAreas = upayaAreas
    ?.slice()
    ?.sort((a, b) => a.name.localeCompare(b.name))
    ?.filter((area) =>
      area.name.toLowerCase().includes(upayaAreaSearchQuery.toLowerCase())
    );

  // Auto-fill receiver details from logged-in user when Upaya delivery is shown
  useEffect(() => {
    if (isLogin && showUpayaSelectors && (user || profile)) {
      const name = profile?.full_name || profile?.name || user?.name || user?.full_name || "";
      const phone = profile?.phone_number || profile?.phone || user?.phone || user?.phone_number || "";
      setUpayaReceiverName(name);
      setUpayaReceiverContact(phone);
    }
  }, [isLogin, showUpayaSelectors, user, profile]);

  useEffect(() => {
    if (showUpayaSelectors) {
      getUpayaLocations()
        .then((data) => setUpayaLocations(data || []))
        .catch(console.error);
    } else {
      setSelectedUpayaLocation("");
      setSelectedUpayaArea("");
      setUpayaCharge(0);
    }
  }, [showUpayaSelectors]);

  const handleUpayaLocationChange = (e) => {
    const locId = e.target.value;
    setSelectedUpayaLocation(locId);
    setSelectedUpayaArea("");
    setUpayaCharge(0);
    if (locId) setUpayaLocationError("");

    if (showUpayaSelectors) {
      runCartCalculation(selectedAddress);
    }

    if (locId) {
      const loc = upayaLocations.find((l) => String(l.id) === String(locId));
      setUpayaAreas(loc?.areas || []);
    } else {
      setUpayaAreas([]);
    }
  };

  const handleUpayaAreaChange = async (e) => {
    const areaId = e.target.value;
    setSelectedUpayaArea(areaId);
    if (areaId) setUpayaAreaError("");
    if (selectedUpayaLocation && areaId) {
      try {
        const rateResponse = await getUpayaDeliveryRate(
          selectedUpayaLocation,
          areaId,
        );
        if (rateResponse && rateResponse.charge) {
          setUpayaCharge(rateResponse.charge);
        }
      } catch (error) {
        toast.error("Failed to fetch Upaya delivery rate");
      }
    }
  };

  // Auto-select address or open form if no address exists
  useEffect(() => {
    if (isLogin) {
      // For logged-in users
      if (addresses && addresses.length > 0 && !selectedAddress) {
        handleSelect(addresses[0]);
      } else if ((!addresses || addresses.length === 0) && !upayaDeliveryEnabled) {
        addressForm.onTrue();
      }
    } else {
      // For guest users
      if (guestAddress && !selectedAddress) {
        handleGuestSelect(guestAddress);
      }
      // Don't auto-open form for guests - it's always visible
    }
  }, [addresses, guestAddress, isLogin]);

  useEffect(() => {
    if (!selectedAddress || !isLogin) return;
    runCartCalculation(selectedAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAddress, discount?.code, isLogin]);

  const handleBack = () => {
    dispatch(changeActiveStep(0));
  };

  const renderNoAddress = () => (
    <EmptyContent
      title="Address not found"
      description="Please, add your address to proceed the checkout process!"
      sx={{ py: 2 }}
    />
  );

  const runCartCalculation = async (addressId) => {
    if (!isLogin || !items?.length) {
      dispatch(clearCartCalculation());
      return;
    }

    try {
      const discountCode =
        typeof discount?.code === "string" && discount.code.trim()
          ? discount.code.trim()
          : "";

      const payload = {
        ...(discountCode ? { discount_code: discountCode } : {}),
        ...(addressId && addressId !== "guest-address" && !showUpayaSelectors
          ? { customer_address_id: addressId }
          : {}),
      };

      const response = await calculateCart(payload);
      if (response?.success && response?.data) {
        dispatch(setCartCalculation(response.data));
      } else {
        dispatch(clearCartCalculation());
      }
    } catch {
      dispatch(clearCartCalculation());
    }
  };

  const handleSelect = async (address) => {
    const { address_id } = address;
    try {
      setSelectedAddress(address_id);
      await runCartCalculation(address_id);
    } catch (error) {
      toast.error("Couldn't select address! Try again.");
    }
  };

  const handleGuestSelect = async (address) => {
    try {
      setSelectedAddress("guest-address");
      setGuestAddress(address);
      localStorage.setItem("guestAddress", JSON.stringify(address));
      await runCartCalculation("guest-address");
    } catch (error) {
      toast.error("Couldn't select address! Try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeAddress(id);

      setSelectedAddress("");

      const updatedAddresses = addresses.filter(
        (address) => address.address_id !== id,
      );

      dispatch(setProfileAddresses(updatedAddresses));

      toast.success("Address deleted!");
    } catch (error) {
      toast.error("Couldn't remove address! Try again.");
    }
  };

  const handleCheckout = async () => {
    // Validate Upaya delivery selectors if required
    if (showUpayaSelectors) {
      let hasUpayaError = false;
      if (!selectedUpayaLocation) {
        setUpayaLocationError("Please select a delivery location.");
        hasUpayaError = true;
      }
      if (!selectedUpayaArea) {
        setUpayaAreaError("Please select a delivery area.");
        hasUpayaError = true;
      }
      if (!upayaAddress.trim()) {
        setUpayaAddressError("Delivery address is required.");
        hasUpayaError = true;
      }
      if (!upayaReceiverName.trim()) {
        setUpayaReceiverNameError("Receiver name is required.");
        hasUpayaError = true;
      }
      if (!upayaReceiverContact.trim()) {
        setUpayaReceiverContactError("Receiver contact is required.");
        hasUpayaError = true;
      }
      if (hasUpayaError) return;
    }

    setIsCheckoutLoading(true);
    let whatsappWindow = null;
    if (paymentMethod !== "fonepay") {
      whatsappWindow = window.open("about:blank", "_blank");
    }
    try {
      // Save customization data to session storage for order display
      try {
        const orderCustomizations = {};
        items.forEach((item) => {
          const customizationPayload = {
            tshirtFrontImage: item.tshirtFrontImage,
            frontDesign: item.frontDesign,
            backDesign: item.backDesign,
            front_design: item.frontDesign?.name,
            back_design: item.backDesign?.name,
            front_design_image: item.frontDesign?.frontImage,
            back_design_image: item.backDesign?.frontImage,
            item_image: item.item_image,
            featured_image: item.featured_image,
            thumbnailImage:
              item.tshirtFrontImage ||
              item.item_image ||
              item.featured_image ||
              null,
          };

          const itemKeys = [
            item.product_id,
            item.itemable_id,
            item.variant_id,
            item.item_id,
          ]
            .filter(
              (value) => value !== undefined && value !== null && value !== "",
            )
            .map((value) => String(value));

          itemKeys.forEach((key) => {
            orderCustomizations[key] = customizationPayload;
          });
        });
        if (Object.keys(orderCustomizations).length > 0) {
          sessionStorage.setItem(
            "orderCustomizations",
            JSON.stringify(orderCustomizations),
          );
          localStorage.setItem(
            "orderCustomizations",
            JSON.stringify(orderCustomizations),
          );
        }
      } catch (e) {
        console.log("Could not save customizations to session storage");
      }

      // Ensure discount_code is always a string or undefined
      // Handle both string format and object format (from old state or API response)
      let safeDiscountCode;
      if (typeof discount.code === "string" && discount.code.trim()) {
        safeDiscountCode = discount.code.trim();
      } else if (typeof discount.code === "object" && discount.code?.code) {
        safeDiscountCode = String(discount.code.code).trim();
      } else {
        safeDiscountCode = undefined;
      }

      let checkoutData;
      let customerName = "";
      let customerPhone = "";
      let customerAddress = "";

      let orderRemarks = "";
      items.forEach((item, index) => {
        const pName = item.item_name || item.product_name || "Unknown Product";
        const qty = item.quantity || 1;
        let itemRemarks = `${index + 1}. ${pName} (${qty}x)`;
        if (item.size) itemRemarks += ` Size: ${item.size}`;
        if (item.color)
          itemRemarks += ` Color: ${typeof item.color === "object" ? item.color.name : item.color}`;
        if (item.frontDesign) itemRemarks += ` Front: ${item.frontDesign.name}`;
        if (item.backDesign) itemRemarks += ` Back: ${item.backDesign.name}`;

        if (index > 0) orderRemarks += " | ";
        orderRemarks += itemRemarks;
      });

      if (isLogin) {
        // Logged-in user checkout
        checkoutData = {
          ...(selectedAddress && { customer_address_id: selectedAddress }),
          order_from: "web",
          remarks: orderRemarks,
          ...(safeDiscountCode && { discount_code: safeDiscountCode }),
          ...(showUpayaSelectors && selectedUpayaLocation
            ? { upaya_location_id: parseInt(selectedUpayaLocation) }
            : {}),
          ...(showUpayaSelectors && selectedUpayaArea
            ? { upaya_area_id: parseInt(selectedUpayaArea) }
            : {}),
          ...(showUpayaSelectors && upayaAddress.trim()
            ? { upaya_address: upayaAddress.trim() }
            : {}),
          ...(showUpayaSelectors && upayaLandmark.trim()
            ? { upaya_landmark: upayaLandmark.trim() }
            : {}),
          ...(showUpayaSelectors && upayaReceiverName.trim()
            ? { upaya_receiver_name: upayaReceiverName.trim() }
            : {}),
          ...(showUpayaSelectors && upayaReceiverContact.trim()
            ? { upaya_receiver_contact: upayaReceiverContact.trim() }
            : {}),
          ...(showUpayaSelectors && upayaClientNote.trim()
            ? { upaya_client_note: upayaClientNote.trim() }
            : {}),
        };

        const addr = addresses.find((a) => a.address_id === selectedAddress);
        if (addr) {
          customerName = user?.name || user?.full_name || "Customer";
          customerPhone = profile?.phone_number || profile?.phone || user?.phone || user?.phone_number || addr.phone || "";
          customerAddress = `${addr.address}, ${addr.district?.district_name || ""
            }, ${addr.state?.state_name || ""}`;
        }
      } else {
        // Guest checkout
        checkoutData = {
          guest_address: guestAddress,
          order_from: "web",
          remarks: orderRemarks,
          ...(safeDiscountCode && { discount_code: safeDiscountCode }),
          ...(showUpayaSelectors && selectedUpayaLocation
            ? { upaya_location_id: parseInt(selectedUpayaLocation) }
            : {}),
          ...(showUpayaSelectors && selectedUpayaArea
            ? { upaya_area_id: parseInt(selectedUpayaArea) }
            : {}),
          ...(showUpayaSelectors && upayaAddress.trim()
            ? { upaya_address: upayaAddress.trim() }
            : {}),
          ...(showUpayaSelectors && upayaLandmark.trim()
            ? { upaya_landmark: upayaLandmark.trim() }
            : {}),
          ...(showUpayaSelectors && upayaReceiverName.trim()
            ? { upaya_receiver_name: upayaReceiverName.trim() }
            : {}),
          ...(showUpayaSelectors && upayaReceiverContact.trim()
            ? { upaya_receiver_contact: upayaReceiverContact.trim() }
            : {}),
          ...(showUpayaSelectors && upayaClientNote.trim()
            ? { upaya_client_note: upayaClientNote.trim() }
            : {}),
        };

        const formValues = methods.getValues();
        customerName = formValues.name || "Guest Customer";
        customerPhone = formValues.phone_number || "";

        if (guestAddress) {
          customerAddress = `${guestAddress.address || ""}, ${guestAddress.district?.district_name || ""
            }, ${guestAddress.state?.state_name || ""}`;
        }
      }

      const response = await createOrder(checkoutData);
      if (!response?.success || !response?.data) {
        throw response;
      }

      // Extract order ID from response before dispatching reset
      const orderId =
        response?.data?.order_id ||
        response?.data?.id ||
        response?.data?.data?.order_id;

      if (orderId) {


        if (paymentMethod === "fonepay") {
          try {
            const fonepayResponse = await initiateFonepayPayment(orderId);
            console.log("[FONEPAY] Full Response:", fonepayResponse);
            console.log("[FONEPAY] Data object:", fonepayResponse?.data);
            console.log(
              "[FONEPAY] Has qr_message?:",
              !!fonepayResponse?.data?.qr_message,
            );
            console.log(
              "[FONEPAY] qr_message value:",
              fonepayResponse?.data?.qr_message,
            );

            if (fonepayResponse?.success && fonepayResponse?.data?.prn) {
              console.log("✅ FONEPAY SUCCESS - About to open modal");
              console.log(
                "✅ qr_message present:",
                !!fonepayResponse.data.qr_message,
              );

              // SET STATE and open modal first.
              setFonepayData(fonepayResponse.data);
              setFonepayOrderId(orderId);
              setFonepayModalOpen(true);
              console.log("✅ Fonepay modal open state set");

              // Stop the checkout loader so modal is interactive.
              setIsCheckoutLoading(false);

              // Do not clear cart here; wait until the modal closes or payment succeeds.
              return;
            } else {
              throw new Error("Invalid Fonepay initiation response.");
            }
          } catch (fonepayError) {
            console.error("Failed to initiate Fonepay payment:", fonepayError);
            toast.error(
              "Order created, but Fonepay QR initiation failed. Please go to your orders and retry payment.",
            );
          }
        }

        // For COD and other methods: Send WhatsApp notification
        try {
          const phoneNumber = "9779705015343";
          let message = `*NEW ORDER CONFIRMED - HREE STORE*\n\n`;
          message += `*Customer:* ${customerName}\n`;
          message += `*Phone:* ${customerPhone}\n`;
          message += `*Address:* ${customerAddress}\n\n`;
          message += `*Items:*\n`;

          items.forEach((item, index) => {
            const pName =
              item.item_name || item.product_name || "Unknown Product";
            const qty = item.quantity || 1;

            message += `${index + 1}. ${pName} (${qty}x)\n`;
            if (item.size) message += `   - Size: ${item.size}\n`;
            if (item.color)
              message += `   - Color: ${typeof item.color === "object" ? item.color.name : item.color
                }\n`;
            if (item.frontDesign)
              message += `   - Front: ${item.frontDesign.name}\n`;
          });

          message += `\n*Order ID:* ${orderId}`;

          const encodedMessage = encodeURIComponent(message);
          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

          // Open WhatsApp in a new tab
          if (whatsappWindow) {
            whatsappWindow.location.href = whatsappUrl;
          } else {
            window.open(whatsappUrl, "_blank");
          }
        } catch (msgError) {
          console.error("Failed to open WhatsApp:", msgError);
          if (whatsappWindow) whatsappWindow.close();
        }

        // Perform cleanup operations
        dispatch(resetCart());
        try {
          localStorage.removeItem("guestAddress");
        } catch { }

        router.push(paths.order.details(orderId));
        toast.success(response?.message || "Order created successfully!");
      } else {
        throw new Error("Order ID not found in response");
      }
    } catch (error) {
      if (whatsappWindow) whatsappWindow.close();
      toast.error(error?.message || "Couldn't create order! Try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const defaultValues = {
    name: "",
    phone_number: "",
    email: "",
    password: "",
    password_confirmation: "",
  };

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const showPassword = useBoolean();

  const showConfirmPassword = useBoolean();

  return (
    <>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                size="small"
                color="inherit"
                startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
                onClick={handleBack}
              >
                Back
              </Button>

              {isLogin && !upayaDeliveryEnabled && (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={addressForm.onTrue}
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  New address
                </Button>
              )}
            </Box>

            {isLogin ? (
              !upayaDeliveryEnabled ? (
                !!addresses?.length ? (
                  addresses.map((address) => (
                    <AddressItem
                      key={address.address_id}
                      addressItem={address}
                      selectedAddress={selectedAddress}
                      // sx={{
                      //   boxShadow: '0 0 10 rgba(0, 0, 0, 0.2)',
                      //   border: selectedAddress === address.address_id ? '2px solid' : '1px solid',
                      //   borderColor: selectedAddress === address.address_id ? 'primary.main' : 'divider',
                      // }}

                      action={
                        <Box
                          sx={{
                            flexShrink: 0,
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDelete(address.address_id)}
                          >
                            Delete
                          </Button>

                          {selectedAddress !== address.address_id && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleSelect(address)}
                            >
                              Select
                            </Button>
                          )}
                        </Box>
                      }
                      sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 2,
                        boxShadow: (theme) =>
                          theme?.vars?.customShadows?.card || "none",
                      }}
                    />
                  ))
                ) : (
                  renderNoAddress()
                )
              ) : null
            ) : (
              <Card
                sx={{
                  p: 3,
                  mx: 2,
                  boxShadow: (theme) =>
                    theme?.vars?.customShadows?.card || "none",
                }}
              >
                <Box>
                  <Box>
                    {/* {!!errorMessage && (
                      <Alert severity="error" sx={{ mb: 3 }}>
                        {errorMessage}
                      </Alert>
                    )} */}
                    <Typography variant="h6" sx={{ mb: 4 }}>
                      Order Details
                    </Typography>
                    <Form methods={methods}>
                      <Box
                        sx={{
                          gap: 3,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            gap: { xs: 3, sm: 2 },
                            flexDirection: { xs: "column", sm: "row" },
                          }}
                        >
                          <Field.Text
                            name="name"
                            label="Name"
                            slotProps={{ inputLabel: { shrink: true } }}
                          />

                          <Field.Text
                            name="phone_number"
                            label="Phone Number"
                            slotProps={{ inputLabel: { shrink: true } }}
                          />
                          <Field.Text
                            name="email"
                            label="Email address"
                            slotProps={{ inputLabel: { shrink: true } }}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            gap: { xs: 3, sm: 2 },
                            flexDirection: { xs: "column", sm: "row" },
                          }}
                        >
                          <Field.Text
                            name="password"
                            label="Password"
                            type={showPassword.value ? "text" : "password"}
                            slotProps={{
                              inputLabel: { shrink: true },
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={showPassword.onToggle}
                                      edge="end"
                                    >
                                      {showPassword.value ? (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="20"
                                          height="20"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                          <circle
                                            cx="12"
                                            cy="12"
                                            r="3"
                                          ></circle>
                                        </svg>
                                      ) : (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="20"
                                          height="20"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                          <line
                                            x1="1"
                                            y1="1"
                                            x2="23"
                                            y2="23"
                                          ></line>
                                        </svg>
                                      )}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              },
                            }}
                          />

                          <Field.Text
                            name="password_confirmation"
                            label="Confirm Password"
                            type={
                              showConfirmPassword.value ? "text" : "password"
                            }
                            slotProps={{
                              inputLabel: { shrink: true },
                              input: {
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      onClick={showConfirmPassword.onToggle}
                                      edge="end"
                                    >
                                      {showConfirmPassword.value ? (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="20"
                                          height="20"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                          <circle
                                            cx="12"
                                            cy="12"
                                            r="3"
                                          ></circle>
                                        </svg>
                                      ) : (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="20"
                                          height="20"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                          <line
                                            x1="1"
                                            y1="1"
                                            x2="23"
                                            y2="23"
                                          ></line>
                                        </svg>
                                      )}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </Form>
                    <AddressNewForm
                      key={
                        guestAddress
                          ? JSON.stringify(guestAddress)
                          : "new-address"
                      }
                      open={true}
                      onClose={() => { }}
                      states={states}
                      isLogin={false}
                      isInline={true}
                      initialData={guestAddress}
                      onAddressAddSuccess={(address) => {
                        handleGuestSelect(address);
                      }}
                    />
                  </Box>
                </Box>
              </Card>
            )}


            {showUpayaSelectors && (
              <div className="bg-white rounded-2xl p-6 mx-0 md:mx-2 mt-3 shadow-sm border border-gray-100">
                <h6 className="text-base font-semibold mb-4">
                  Delivery Service
                </h6>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div
                        className={`w-full px-3 py-3 text-sm border rounded-lg focus-within:border-black transition-colors bg-white flex items-center justify-between cursor-pointer ${upayaLocationError ? "border-red-500" : "border-gray-300"
                          }`}
                        onClick={() => setIsUpayaLocationDropdownOpen(!isUpayaLocationDropdownOpen)}
                      >
                        <span className={selectedUpayaLocation ? "text-black" : "text-gray-500"}>
                          {selectedUpayaLocation
                            ? upayaLocations?.find((l) => String(l.id) === String(selectedUpayaLocation))?.name
                            : "Select Location"}
                        </span>
                        <svg className={`w-4 h-4 transition-transform ${isUpayaLocationDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {isUpayaLocationDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsUpayaLocationDropdownOpen(false)}
                          />
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 flex flex-col">
                            <div className="sticky top-0 bg-white p-2 border-b border-gray-200 shrink-0">
                              <input
                                type="text"
                                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black"
                                placeholder="Search location..."
                                value={upayaLocationSearchQuery}
                                onChange={(e) => setUpayaLocationSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                            </div>
                            <div className="overflow-y-auto">
                              {sortedAndFilteredUpayaLocations?.length > 0 ? (
                                sortedAndFilteredUpayaLocations.map((loc) => (
                                  <div
                                    key={loc.id}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${String(selectedUpayaLocation) === String(loc.id) ? "bg-gray-50 font-bold" : ""}`}
                                    onClick={() => {
                                      handleUpayaLocationChange({ target: { value: loc.id } });
                                      setIsUpayaLocationDropdownOpen(false);
                                      setUpayaLocationSearchQuery("");
                                    }}
                                  >
                                    {loc.name}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-4 text-sm text-center text-gray-500">No locations found</div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {upayaLocationError && (
                      <p className="text-xs text-red-500">{upayaLocationError}</p>
                    )}
                  </div>

                  {/* Area */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">
                      Area <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div
                        className={`w-full px-3 py-3 text-sm border rounded-lg transition-colors flex items-center justify-between ${!selectedUpayaLocation ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer bg-white focus-within:border-black"
                          } ${upayaAreaError ? "border-red-500" : "border-gray-300"}`}
                        onClick={() => {
                          if (selectedUpayaLocation) {
                            setIsUpayaAreaDropdownOpen(!isUpayaAreaDropdownOpen);
                          }
                        }}
                      >
                        <span className={selectedUpayaArea ? "text-black" : "text-gray-500"}>
                          {selectedUpayaArea
                            ? upayaAreas?.find((a) => String(a.id) === String(selectedUpayaArea))?.name
                            : "Select Area"}
                        </span>
                        <svg className={`w-4 h-4 transition-transform ${isUpayaAreaDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {isUpayaAreaDropdownOpen && selectedUpayaLocation && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsUpayaAreaDropdownOpen(false)}
                          />
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 flex flex-col">
                            <div className="sticky top-0 bg-white p-2 border-b border-gray-200 shrink-0">
                              <input
                                type="text"
                                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black"
                                placeholder="Search area..."
                                value={upayaAreaSearchQuery}
                                onChange={(e) => setUpayaAreaSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                            </div>
                            <div className="overflow-y-auto">
                              {sortedAndFilteredUpayaAreas?.length > 0 ? (
                                sortedAndFilteredUpayaAreas.map((area) => (
                                  <div
                                    key={area.id}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${String(selectedUpayaArea) === String(area.id) ? "bg-gray-50 font-bold" : ""}`}
                                    onClick={() => {
                                      handleUpayaAreaChange({ target: { value: area.id } });
                                      setIsUpayaAreaDropdownOpen(false);
                                      setUpayaAreaSearchQuery("");
                                    }}
                                  >
                                    {area.name}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-4 text-sm text-center text-gray-500">No areas found</div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {upayaAreaError && (
                      <p className="text-xs text-red-500">{upayaAreaError}</p>
                    )}
                  </div>



                  {/* Receiver Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">
                      Receiver Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={upayaReceiverName}
                      readOnly={isLogin}
                      onChange={(e) => {
                        if (!isLogin) {
                          setUpayaReceiverName(e.target.value);
                          if (e.target.value.trim()) setUpayaReceiverNameError("");
                        }
                      }}
                      placeholder="Enter receiver's full name"
                      className={`w-full px-3 py-3 text-sm border rounded-lg focus:outline-none transition-colors ${isLogin ? "bg-gray-50 cursor-default" : "focus:border-black"} ${upayaReceiverNameError ? "border-red-500" : "border-gray-300"}`}
                    />
                    {upayaReceiverNameError && (
                      <p className="text-xs text-red-500">{upayaReceiverNameError}</p>
                    )}
                  </div>

                  {/* Receiver Contact */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">
                      Receiver Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={upayaReceiverContact}
                      readOnly={isLogin}
                      onChange={(e) => {
                        if (!isLogin) {
                          setUpayaReceiverContact(e.target.value);
                          if (e.target.value.trim()) setUpayaReceiverContactError("");
                        }
                      }}
                      placeholder="Enter receiver's phone number"
                      className={`w-full px-3 py-3 text-sm border rounded-lg focus:outline-none transition-colors ${isLogin ? "bg-gray-50 cursor-default" : "focus:border-black"} ${upayaReceiverContactError ? "border-red-500" : "border-gray-300"}`}
                    />
                    {upayaReceiverContactError && (
                      <p className="text-xs text-red-500">{upayaReceiverContactError}</p>
                    )}
                  </div>
                  {/* Delivery Address */}
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700">
                      Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={upayaAddress}
                      onChange={(e) => {
                        setUpayaAddress(e.target.value);
                        if (e.target.value.trim()) setUpayaAddressError("");
                      }}
                      placeholder="Enter full delivery address"
                      className={`w-full px-3 py-3 text-sm border rounded-lg focus:outline-none focus:border-black transition-colors ${upayaAddressError ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {upayaAddressError && (
                      <p className="text-xs text-red-500">{upayaAddressError}</p>
                    )}
                  </div>
                  {/* Landmark (optional) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">
                      Landmark <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={upayaLandmark}
                      onChange={(e) => setUpayaLandmark(e.target.value)}
                      placeholder="Nearby landmark"
                      className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {/* Client Note (optional) */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-700">
                      Note for delivery <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={upayaClientNote}
                      onChange={(e) => setUpayaClientNote(e.target.value)}
                      placeholder="Any special instructions"
                      className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <CartSummary
            isAddressSelected={isDeliveryReady}
            selectedAddressId={selectedAddress}
            selectedPaymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            upayaCharge={upayaCharge}
            showUpayaSelectors={showUpayaSelectors}
          />

          <Tooltip
            title={
              !isDeliveryReady
                ? "Please select address to checkout"
                : null
            }
          >
            <Box>
              <button
                type="submit"
                disabled={!isDeliveryReady || isCheckoutLoading}
                onClick={handleCheckout}
                className={`w-full py-4 lg:py-5 rounded-2xl lg:rounded-[2rem] font-display font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2 lg:gap-3 shadow-lg ${isDeliveryReady && !isCheckoutLoading
                  ? " hover:bg-[#711a20] hover:text-[#ffffff] hover:scale-[1.02] active:scale-95"
                  : "cursor-not-allowed shadow-none opacity-60"
                  }`}
              >
                {isCheckoutLoading && (
                  <CircularProgress color="inherit" size={18} />
                )}
                {isCheckoutLoading
                  ? paymentMethod === "esewa"
                    ? "Redirecting to eSewa..."
                    : paymentMethod === "fonepay"
                      ? "Generating QR..."
                      : "Processing..."
                  : paymentMethod === "esewa"
                    ? "Checkout with eSewa"
                    : paymentMethod === "fonepay"
                      ? "Checkout with Fonepay"
                      : "Checkout"}
              </button>
            </Box>
          </Tooltip>
        </Grid>
      </Grid>

      {isLogin && (
        <AddressNewForm
          open={addressForm.value}
          onClose={addressForm.onFalse}
          //
          states={states}
          isLogin={isLogin}
          onAddressAddSuccess={handleSelect}
        />
      )}

      {/* Fonepay QR Payment Modal */}
      {fonepayModalOpen && (
        <FonepayQRModal
          key={fonepayOrderId || "fonepay-modal"}
          open={fonepayModalOpen}
          fonepayData={fonepayData}
          orderId={fonepayOrderId}
          onClose={() => {
            setFonepayModalOpen(false);
            // Order already exists; navigate to its detail page
            if (fonepayOrderId) {
              router.push(paths.order.details(fonepayOrderId));
            }
          }}
          onSuccess={(oid) => {
            setFonepayModalOpen(false);
            dispatch(resetCart());
            try {
              localStorage.removeItem("guestAddress");
            } catch { }
            toast.success("Payment confirmed! Your order is now processing.");
            router.push(paths.order.details(oid));
          }}
          onRetry={async () => {
            // Re-initiate Fonepay for the same order
            if (!fonepayOrderId) return;
            try {
              const fonepayResponse =
                await initiateFonepayPayment(fonepayOrderId);
              if (fonepayResponse?.success && fonepayResponse?.data?.prn) {
                setFonepayData(fonepayResponse.data);
                // Modal stays open — useEffect inside will restart with new prn
              } else {
                throw new Error("Failed to regenerate QR.");
              }
            } catch (err) {
              toast.error(
                err?.message || "Could not regenerate QR. Please try again.",
              );
            }
          }}
        />
      )}

      {/* Full page loader during checkout */}
      <Backdrop
        open={isCheckoutLoading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" size={60} />
        <Typography variant="h6">Creating your order...</Typography>
      </Backdrop>
    </>
  );
}
