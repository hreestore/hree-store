
"use client";

import { z as zod } from "zod";
import { useState, useEffect } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff, X, Flame } from "lucide-react";

import { paths } from "@/routes/paths";
import { useRouter } from "@/routes/hooks";
import { fCurrency } from "@/utils/format-number";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUser, resetCart } from "@/redux/actions";
import { PERSIST_STORAGE_KEY } from "@/redux/persist-key";

import {
  useGetStates,
  submitQuickOrder,
  verifyOtpAndCreateOrder,
  getLogisticCharge,
  calculateCart,
  checkDiscount,
  initiateFonepayPayment,
  getUpayaLocations,
  getUpayaDeliveryRate,
} from "@/api";

import { OtpVerificationDialog } from "./otp-verification-dialog";
import { FonepayQRModal } from "../cart/fonepay-qr-modal";
import { toast } from "sonner";

// ----------------------------------------------------------------------

const QuickOrderSchema = zod.object({
  customer_name: zod
    .string()
    .min(1, { message: "Name is required!" })
    .max(255, { message: "Name cannot exceed 255 characters" }),

  customer_email: zod
    .string()
    .min(1, { message: "Email is required!" })
    .email({ message: "Email must be a valid email address!" }),

  customer_contact_info: zod
    .string()
    .min(1, { message: "Contact number is required!" })
    .regex(/^\d{10}$/, {
      message: "Contact number must be exactly 10 digits!",
    }),

  password: zod.string().optional(),

  state_id: zod.string().nullable(),
  district_id: zod.string().nullable(),

  address: zod
    .string()
    .max(500, { message: "Address cannot exceed 500 characters" })
    .nullable(),

  discount_code: zod.string().optional(),
  remarks: zod.string().max(1000).optional(),
  payment_method: zod.enum(["fonepay"]),
  upaya_location_id: zod.string().nullable().optional(),
  upaya_area_id: zod.string().nullable().optional(),
});

// ----------------------------------------------------------------------

export function QuickOrderForm({
  mode,
  buyNowProduct,
  buyNowQuantity,
  buyNowSize,
  buyNowColor,
  buyNowCustomizations,
  cartItems,
  onLogisticChargeChange,
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLogin, user } = useAppSelector((state) => state.auth);
  const { profile } = useAppSelector((state) => state.profile);
  const { states } = useGetStates();

  const [districts, setDistricts] = useState([]);
  const [logisticCharge, setLogisticCharge] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Upaya Delivery State
  const { vendor } = useAppSelector((state) => state.vendor);
  const upayaDeliveryEnabled = vendor?.upaya_delivery_enabled === true;

  const [upayaLocations, setUpayaLocations] = useState([]);
  const [upayaAreas, setUpayaAreas] = useState([]);
  const [upayaCharge, setUpayaCharge] = useState(0);

  const [selectedUpayaLocation, setSelectedUpayaLocation] = useState("");
  const [selectedUpayaArea, setSelectedUpayaArea] = useState("");
  const [upayaLocationError, setUpayaLocationError] = useState("");
  const [upayaAreaError, setUpayaAreaError] = useState("");

  const [upayaAddress, setUpayaAddress] = useState("");
  const [upayaLandmark, setUpayaLandmark] = useState("");
  const [upayaReceiverName, setUpayaReceiverName] = useState("");
  const [upayaReceiverContact, setUpayaReceiverContact] = useState("");
  const [upayaClientNote, setUpayaClientNote] = useState("");

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

  const [upayaAddressError, setUpayaAddressError] = useState("");
  const [upayaReceiverNameError, setUpayaReceiverNameError] = useState("");
  const [upayaReceiverContactError, setUpayaReceiverContactError] = useState("");

  const isPhysicalOrder = () => {
    if (mode === "buyNow" && buyNowProduct) {
      const type =
        buyNowProduct.product_type || buyNowProduct.product?.product_type;
      return type !== "service";
    }
    if (mode === "cart" && cartItems) {
      return cartItems.some((item) => {
        const type =
          item.product_type ||
          item.product?.product_type ||
          item.itemable?.product_type;
        return type !== "service";
      });
    }
    return false;
  };

  const showUpayaSelectors = upayaDeliveryEnabled && isPhysicalOrder();

  useEffect(() => {
    if (isLogin && showUpayaSelectors && (user || profile)) {
      const name = profile?.full_name || profile?.name || user?.name || user?.full_name || "";
      const phone = profile?.phone_number || profile?.phone || user?.phone || user?.phone_number || user?.contact_number || user?.mobile || "";
      setUpayaReceiverName(name);
      setUpayaReceiverContact(phone);
    }
  }, [isLogin, showUpayaSelectors, user, profile]);

  useEffect(() => {
    if (onLogisticChargeChange) {
      onLogisticChargeChange(logisticCharge);
    }
  }, [logisticCharge, onLogisticChargeChange]);

  // Cart Calculation State
  const [cartCalculation, setCartCalculation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  // OTP State
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [orderPreview, setOrderPreview] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpExpiryMinutes, setOtpExpiryMinutes] = useState(5);

  // Redirect State
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Fonepay State
  const [fonepayModalOpen, setFonepayModalOpen] = useState(false);
  const [fonepayData, setFonepayData] = useState(null);
  const [fonepayOrderId, setFonepayOrderId] = useState(null);

  const defaultValues = {
    customer_name: isLogin && user ? user.full_name || user.name || "" : "",
    customer_contact_info:
      isLogin && user ? user.phone_number || user.phone || "" : "",
    customer_email: isLogin && user ? user.email || "" : "",
    password: "",
    state_id: "",
    district_id: "",
    address: "",
    discount_code: "",
    remarks: "",
    payment_method: "fonepay",
  };

  const methods = useForm({
    resolver: zodResolver(QuickOrderSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = methods;

  const selectedPaymentMethod = watch("payment_method");
  const selectedAddress = watch("address");

  // Calculate subtotal
  const calculateSubtotal = () => {
    if (mode === "buyNow" && buyNowProduct) {
      const regularPrice =
        buyNowProduct.selling_price?.regularPrice || buyNowProduct.price;
      const flashSalePrice =
        buyNowProduct.selling_price?.flashSalePrice || buyNowProduct.price;
      const hasFlashSale =
        buyNowProduct.flash_sale_products &&
        buyNowProduct.flash_sale_products.length > 0;

      const finalPrice =
        hasFlashSale && parseFloat(flashSalePrice) < parseFloat(regularPrice)
          ? flashSalePrice
          : regularPrice;

      return buyNowQuantity * parseFloat(finalPrice);
    }

    if (mode === "cart" && cartItems) {
      return cartItems.reduce((total, item) => {
        const itemPrice = parseFloat(item.price || 0);
        const itemQuantity = parseInt(item.quantity || 0);
        return total + itemPrice * itemQuantity;
      }, 0);
    }

    return 0;
  };

  const subtotal = calculateSubtotal();
  const totalAmount = logisticCharge + subtotal;

  const handleSelectState = (stateId) => {
    const stateObj = states?.find(
      (s) => String(s.state_id) === String(stateId),
    );
    if (stateObj) {
      setDistricts(stateObj.districts || []);
      setValue("district_id", "");
      setLogisticCharge(0);
    }
  };

  const handleSelectDistrict = async (districtId) => {
    if (!districtId) return;
    try {
      if (!showUpayaSelectors) {
        const charge = await getLogisticCharge(districtId);
        setLogisticCharge(charge.charge_amount);
        await loadCartCalculation(appliedDiscountCode);
      } else {
        setLogisticCharge(0);
        await loadCartCalculation(appliedDiscountCode);
      }
    } catch (error) {
      toast.error("Couldn't fetch shipping charge! Try again.");
    }
  };

  useEffect(() => {
    if (showUpayaSelectors) {
      getUpayaLocations()
        .then((data) => {
          setUpayaLocations(data || []);
        })
        .catch((err) => console.error("Failed to load Upaya locations:", err));
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
      setLogisticCharge(0);
    }

    if (locId) {
      const loc = upayaLocations.find(
        (l) => String(l.id) === String(locId),
      );
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
        const rateResponse = await getUpayaDeliveryRate(selectedUpayaLocation, areaId);
        if (rateResponse && rateResponse.charge) {
          setUpayaCharge(rateResponse.charge);
          setLogisticCharge(rateResponse.charge);
          await loadCartCalculation(appliedDiscountCode);
        }
      } catch (error) {
        toast.error("Failed to get Upaya delivery rate. Please try again.");
      }
    }
  };

  // Load cart calculation
  const loadCartCalculation = async (discountCode = "") => {
    if (mode !== "cart") return;
    if (!isLogin) return;

    try {
      setIsCalculating(true);
      setDiscountError("");

      const payload = {};
      if (discountCode) {
        payload.discount_code = discountCode;
      }

      const response = await calculateCart(payload);

      if (response.success) {
        setCartCalculation(response.data);
        setAppliedDiscountCode(discountCode);
      } else {
        setDiscountError(response.message || "Failed to calculate cart");
      }
    } catch (error) {
      console.error("Cart calculation error:", error);
      if (error?.message) {
        setDiscountError(error.message);
      }
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle discount code application
  const handleApplyDiscount = async () => {
    const code = getValues("discount_code")?.trim().toUpperCase();

    if (!code) {
      setDiscountError("Please enter a discount code");
      return;
    }

    setIsApplyingDiscount(true);
    try {
      const discountResponse = await checkDiscount({ discount_code: code });
      if (!discountResponse?.success) {
        setDiscountError(discountResponse?.message || "Invalid discount code");
        return;
      }
      await loadCartCalculation(code);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  // Handle discount code removal
  const handleRemoveDiscount = async () => {
    setValue("discount_code", "");
    setAppliedDiscountCode("");
    setDiscountError("");
    await loadCartCalculation("");
  };

  useEffect(() => {
    if (mode === "cart" && cartItems?.length > 0) {
      loadCartCalculation();
    }
  }, [mode, cartItems?.length]);

  // Build order items based on mode
  const buildOrderItems = () => {
    if (mode === "buyNow" && buyNowProduct) {
      const regularPrice =
        buyNowProduct.selling_price?.regularPrice || buyNowProduct.price;
      const flashSalePrice =
        buyNowProduct.selling_price?.flashSalePrice || buyNowProduct.price;
      const hasFlashSale =
        buyNowProduct.flash_sale_products &&
        buyNowProduct.flash_sale_products.length > 0;

      const finalPrice =
        hasFlashSale && parseFloat(flashSalePrice) < parseFloat(regularPrice)
          ? flashSalePrice
          : regularPrice;

      return [
        {
          item_type: "Product",
          item_id: buyNowProduct.product_id,
          quantity: buyNowQuantity,
          price: parseFloat(finalPrice) || 0,
        },
      ];
    }

    if (mode === "cart" && cartItems) {
      return cartItems.map((item) => ({
        item_type: item.variant_id ? "ProductVariant" : "Product",
        item_id: item.variant_id || item.product_id,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price || item.regular_price || 0),
      }));
    }

    return [];
  };

  const onSubmit = handleSubmit(
    async (data) => {
      let whatsappWindow = null;
      if (data.payment_method !== "fonepay") {
        whatsappWindow = window.open("about:blank", "_blank");
      }
      try {
        setErrorMessage("");

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
          if (hasUpayaError) {
            setErrorMessage("Please fill all required Upaya delivery fields.");
            if (whatsappWindow) whatsappWindow.close();
            return;
          }
        }
        const orderItems = buildOrderItems();

        if (orderItems.length === 0) {
          setErrorMessage("No items to checkout");
          return;
        }

        // Customizations backup configuration logic
        try {
          const orderCustomizations = {};
          if (mode === "cart" && cartItems) {
            cartItems.forEach((item) => {
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
                  (value) =>
                    value !== undefined && value !== null && value !== "",
                )
                .map((value) => String(value));

              itemKeys.forEach((key) => {
                orderCustomizations[key] = customizationPayload;
              });
            });
          }
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
          console.log("Could not save customizations to storage");
        }

        // Build structural comments string
        let comboRemarks = "";
        if (mode === "cart" && cartItems) {
          cartItems.forEach((item, index) => {
            const pName =
              item.item_name || item.product_name || "Unknown Product";
            const qty = item.quantity || 1;
            let itemRemarks = `${index + 1}. ${pName} (${qty}x)`;
            if (item.size) itemRemarks += ` Size: ${item.size}`;
            if (item.color)
              itemRemarks += ` Color: ${typeof item.color === "object" ? item.color.name : item.color}`;
            if (item.frontDesign && item.frontDesign.name)
              itemRemarks += ` Front: ${item.frontDesign.name}`;
            if (item.backDesign && item.backDesign.name)
              itemRemarks += ` Back: ${item.backDesign.name}`;

            if (index > 0) comboRemarks += " | ";
            comboRemarks += itemRemarks;
          });
        }

        const finalRemarks = data.remarks
          ? `${data.remarks} | ${comboRemarks}`
          : comboRemarks;

        const orderData = {
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_contact_info: data.customer_contact_info,
          password: data.password || undefined,
          state_id: parseInt(data.state_id),
          district_id: parseInt(data.district_id),
          address: data.address,
          order_items: orderItems,
          subtotal: subtotal,
          logistic_charge: logisticCharge,
          discount_code: data.discount_code?.trim().toUpperCase() || undefined,
          remarks: finalRemarks || undefined,
          payment_method: data.payment_method,
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

        const response = await submitQuickOrder(orderData);

        if (response.success) {
          if (response.data.requires_otp) {
            if (whatsappWindow) whatsappWindow.close();
            setUserEmail(response.data.email);
            setOrderPreview(response.data.order_preview);
            setOtpExpiryMinutes(response.data.expires_in_minutes || 5);
            setOtpDialogOpen(true);
            toast.success(response.message || "OTP sent to your email!");
          } else {
            setIsRedirecting(true);
            await handleOrderSuccess(
              response.data || response,
              orderData.payment_method,
              whatsappWindow
            );
          }
        }
      } catch (error) {
        if (whatsappWindow) whatsappWindow.close();
        console.error("Quick order error:", error);
        handleError(error);
      }
    },
    (errors) => {
      console.error("Form validation errors:", errors);
      const messages = Object.values(errors)
        .map((e) => e.message)
        .filter(Boolean);
      if (messages.length > 0) {
        setErrorMessage(`Please fix the errors: ${messages.join(", ")}`);
      } else {
        setErrorMessage("Please check your form inputs and try again.");
      }
    }
  );

  const handleOrderSuccess = async (data, explicitPaymentMethod = null, whatsappWindow = null) => {
    const orderId =
      data?.order_id ||
      data?.order?.order_id ||
      data?.order?.id ||
      data?.id ||
      data?.data?.order_id ||
      data?.data?.id;
    const paymentMethod = explicitPaymentMethod || getValues("payment_method");
    const token = data?.token || data?.data?.token;

    if (token && typeof window !== "undefined") {
      try {
        const persisted = localStorage.getItem(PERSIST_STORAGE_KEY);
        const parsed = persisted ? JSON.parse(persisted) : {};
        const authState = parsed.auth ? JSON.parse(parsed.auth) : {};
        authState.userToken = token;
        if (data.customer) authState.user = data.customer;
        authState.isAuthenticated = true;
        parsed.auth = JSON.stringify(authState);
        localStorage.setItem(PERSIST_STORAGE_KEY, JSON.stringify(parsed));
      } catch (e) {
        console.error("Force sync failed:", e);
      }
    }

    // WhatsApp notification flow
    try {
      const formData = getValues();
      const customerName = formData.customer_name || "Customer";
      const customerPhone = formData.customer_contact_info || "";
      const addressBase = formData.address || "";
      const stateObj = states.find(
        (s) => s.state_id === parseInt(formData.state_id),
      );
      const stateName = stateObj ? stateObj.state_name : "";
      const distObj = districts.find(
        (d) => d.district_id === parseInt(formData.district_id),
      );
      const districtName = distObj ? distObj.district_name : "";
      const customerAddress = [addressBase, districtName, stateName]
        .filter(Boolean)
        .join(", ");

      const phoneNumber = "9779705015343";
      let message = `*NEW ORDER CONFIRMED - HREE CREATE*\n\n`;
      message += `*Customer:* ${customerName}\n`;
      message += `*Phone:* ${customerPhone}\n`;
      message += `*Address:* ${customerAddress}\n\n`;
      message += `*Items:*\n`;

      const orderIdForMessage = orderId || "N/A";

      if (mode === "cart" && cartItems) {
        cartItems.forEach((item, index) => {
          const pName =
            item.item_name || item.product_name || "Unknown Product";
          const qty = item.quantity || 1;
          message += `${index + 1}. ${pName} (${qty}x)\n`;
          if (item.size) message += `   - Size: ${item.size}\n`;
          if (item.color)
            message += `   - Color: ${typeof item.color === "object" ? item.color.name : item.color}\n`;
          if (item.frontDesign)
            message += `   - Front: ${item.frontDesign.name || "Custom Design"}\n`;
        });
      } else if (mode === "buyNow" && buyNowProduct) {
        const pName =
          buyNowProduct.product_name || buyNowProduct.name || "Unknown Product";
        const qty = buyNowQuantity || 1;
        message += `1. ${pName} (${qty}x)\n`;
        if (buyNowSize) message += `   - Size: ${buyNowSize}\n`;
        if (buyNowColor)
          message += `   - Color: ${typeof buyNowColor === "object" ? buyNowColor.name : buyNowColor}\n`;
        if (buyNowCustomizations?.front)
          message += `   - Front: ${buyNowCustomizations.front.name || "Custom Design"}\n`;
      }

      message += `\n*Order ID:* ${orderIdForMessage}`;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      if (whatsappWindow) {
        whatsappWindow.location.href = whatsappUrl;
      } else {
        window.open(whatsappUrl, "_blank");
      }
    } catch (msgError) {
      console.error("Failed to open WhatsApp:", msgError);
      if (whatsappWindow) whatsappWindow.close();
    }

    dispatch(setUser(data));

    if (paymentMethod === "fonepay" && orderId) {
      try {
        const fonepayResponse = await initiateFonepayPayment(orderId);
        if (fonepayResponse?.success && fonepayResponse?.data?.prn) {
          setFonepayData(fonepayResponse.data);
          setFonepayOrderId(orderId);
          setIsRedirecting(false);
          setFonepayModalOpen(true);
        } else {
          throw new Error("Failed to initiate Fonepay payment.");
        }
        return; // Modal will handle redirection
      } catch (error) {
        console.error("Failed to initiate Fonepay payment:", error);
        toast.error(
          "Order created, but Fonepay initiation failed. Redirecting to order details.",
        );
      }
    }

    toast.success("Order placed successfully! You are now logged in.");
    const destination = orderId
      ? paths.order.details(orderId)
      : paths.order.root;

    // Navigate first
    router.push(destination);

    // Delay cart reset so checkout-view doesn't trigger its empty-cart redirect
    if (mode === "cart" && paymentMethod !== "fonepay") {
      setTimeout(() => {
        dispatch(resetCart());
      }, 500);
    }
  };

  const handleError = (error) => {
    if (error?.status === 422 || error?.status === 400) {
      if (error?.message && typeof error.message === "object") {
        setErrorMessage(
          Object.values(error.message)
            .flat()
            .filter((msg) => typeof msg === "string")
            .join(", "),
        );
      } else if (error?.errors && typeof error.errors === "object") {
        setErrorMessage(
          Object.values(error.errors)
            .flat()
            .filter((msg) => typeof msg === "string")
            .join(", "),
        );
      } else if (error?.message && typeof error.message === "string") {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Please check your form inputs and try again.");
      }
    } else if (error?.message && typeof error.message === "string") {
      setErrorMessage(error.message);
    } else {
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  const handleVerifyOtp = async (otp) => {
    try {
      setIsVerifying(true);
      setOtpError("");

      if (!orderPreview) {
        setOtpError("Order data not found. Please try again.");
        return;
      }

      const verifyData = {
        email: userEmail,
        otp_code: otp,
        ...orderPreview,
      };

      const response = await verifyOtpAndCreateOrder(verifyData);

      if (response.success) {
        setOtpDialogOpen(false);
        setIsRedirecting(true);
        await handleOrderSuccess(
          response.data || response,
          getValues("payment_method"),
        );
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      if (error?.message && typeof error.message === "string") {
        setOtpError(error.message);
      } else {
        setOtpError("Invalid OTP. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseOtpDialog = () => {
    setOtpDialogOpen(false);
    setOtpError("");
    setOrderPreview(null);
  };

  return (
    <div className="w-full space-y-6">
      {!isRedirecting && (
        <>
          {/* Top Login Badge Area */}
          {!isLogin && (
            <div className="rounded-2xl p-4 text-center border-2 border-dashed border-[#f7e6dc]">
              <p className="text-sm font-semibold ">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push(paths.auth.signIn)}
                  className="font-black  hover:opacity-80 transition-opacity"
                >
                  Login here
                </button>
              </p>
            </div>
          )}

          {/* Brutalist Neo-Theme Card Box */}
          <div className=" rounded-3xl border-[3px] border-[#f7e6dc] shadow-[6px_6px_0_0_rgba(8,26,26,1)] overflow-hidden w-full relative z-0">
            <div className="p-6 md:p-8">
              <div className="mb-6 block">
                <span className="font-display font-black text-xl md:text-2xl uppercase tracking-tighter px-4 py-2 border-2 border-[#f7e6dc] shadow-[4px_4px_0_0_rgba(8,26,26,0.15)] inline-block transform -rotate-1">
                  Delivery & Payment Details
                </span>
              </div>

              <FormContainer methods={methods} onSubmit={onSubmit}>
                <div className="space-y-6">
                  {!!errorMessage && (
                    <div className="bg-red-50 border-2 border-red-600 text-red-700 rounded-xl p-4 font-bold flex items-center gap-2">
                      <X className="w-5 h-5 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Sub-Group: Customer Information */}
                  <div>
                    <h3 className="font-display font-black uppercase text-sm tracking-tight mb-3">
                      Customer Information
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldText
                          name="customer_name"
                          placeholder="Full Name *"
                        />
                        <FieldText
                          name="customer_contact_info"
                          placeholder="Phone *"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldText
                          name="customer_email"
                          placeholder="Email *"
                          type="email"
                        />
                        {!isLogin && (
                          <div className="relative w-full">
                            <FieldText
                              name="password"
                              placeholder="Password (for new customers)"
                              type={showPassword ? "text" : "password"}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 "
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      {!isLogin && (
                        <span className="text-xs  block -mt-2">
                          Leave empty if you already have an account. New users
                          must set a password.
                        </span>
                      )}
                    </div>
                  </div>

                  <hr className="border-t-2 border-[#f7e6dc]" />

                  {/* Sub-Group: Delivery Address */}
                  <div>
                    <h3 className="font-display font-black uppercase text-sm tracking-tight  mb-3">
                      Delivery Address
                    </h3>
                    <div className="space-y-4">
                      {!showUpayaSelectors && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FieldSelect
                            name="state_id"
                            onChange={(e) => handleSelectState(e.target.value)}
                          >
                            <option value="" className="text-black">Select State</option>
                            {states?.map(({ state_id, state_name }) => (
                              <option key={state_id} value={String(state_id)} className="text-black">
                                {state_name}
                              </option>
                            ))}
                          </FieldSelect>

                          <FieldSelect
                            name="district_id"
                            onChange={(e) => handleSelectDistrict(e.target.value)}
                          >
                            <option value="" className="text-black">Select District</option>
                            {districts?.map(({ district_id, district_name }) => (
                              <option className="text-black"
                                key={district_id}
                                value={String(district_id)}
                              >
                                {district_name}
                              </option>
                            ))}
                          </FieldSelect>
                        </div>
                      )}

                      {showUpayaSelectors && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Location */}
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              Location <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div
                                className={`w-full px-3 py-3 text-sm border rounded-lg focus-within:border-black dark:focus-within:border-[#f7e6dc] transition-colors bg-white dark:bg-[#0a1a1a] flex items-center justify-between cursor-pointer ${upayaLocationError ? "border-red-500" : "border-gray-300 dark:border-white/20"
                                  }`}
                                onClick={() => setIsUpayaLocationDropdownOpen(!isUpayaLocationDropdownOpen)}
                              >
                                <span className={selectedUpayaLocation ? "text-black dark:text-[#f7e6dc]" : "text-gray-500"}>
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
                                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-[#0a1a1a] border border-gray-300 dark:border-white/20 rounded-lg shadow-lg max-h-60 flex flex-col">
                                    <div className="sticky top-0 bg-white dark:bg-[#0a1a1a] p-2 border-b border-gray-200 dark:border-white/10 shrink-0">
                                      <input
                                        type="text"
                                        className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-white/20 rounded-md focus:outline-none focus:border-black dark:focus:border-[#f7e6dc]"
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
                                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 ${String(selectedUpayaLocation) === String(loc.id) ? "bg-gray-50 dark:bg-white/5 font-bold" : ""}`}
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
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              Area <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div
                                className={`w-full px-3 py-3 text-sm border rounded-lg transition-colors flex items-center justify-between ${!selectedUpayaLocation ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-white/5" : "cursor-pointer bg-white dark:bg-[#0a1a1a] focus-within:border-black dark:focus-within:border-[#f7e6dc]"
                                  } ${upayaAreaError ? "border-red-500" : "border-gray-300 dark:border-white/20"}`}
                                onClick={() => {
                                  if (selectedUpayaLocation) {
                                    setIsUpayaAreaDropdownOpen(!isUpayaAreaDropdownOpen);
                                  }
                                }}
                              >
                                <span className={selectedUpayaArea ? "text-black dark:text-[#f7e6dc]" : "text-gray-500"}>
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
                                  <div className="absolute z-20 w-full mt-1 bg-white dark:bg-[#0a1a1a] border border-gray-300 dark:border-white/20 rounded-lg shadow-lg max-h-60 flex flex-col">
                                    <div className="sticky top-0 bg-white dark:bg-[#0a1a1a] p-2 border-b border-gray-200 dark:border-white/10 shrink-0">
                                      <input
                                        type="text"
                                        className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-white/20 rounded-md focus:outline-none focus:border-black dark:focus:border-[#f7e6dc]"
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
                                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 ${String(selectedUpayaArea) === String(area.id) ? "bg-gray-50 dark:bg-white/5 font-bold" : ""}`}
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
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
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
                              className={`w-full px-3 py-3 text-sm border rounded-lg focus:outline-none transition-colors ${isLogin ? "bg-gray-50 dark:bg-white/5 cursor-default" : "focus:border-black dark:focus:border-[#f7e6dc]"} ${upayaReceiverNameError ? "border-red-500" : "border-gray-300 dark:border-white/20"}`}
                            />
                            {upayaReceiverNameError && (
                              <p className="text-xs text-red-500">{upayaReceiverNameError}</p>
                            )}
                          </div>

                          {/* Receiver Contact */}
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
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
                              className={`w-full px-3 py-3 text-sm border rounded-lg focus:outline-none transition-colors ${isLogin ? "bg-gray-50 dark:bg-white/5 cursor-default" : "focus:border-black dark:focus:border-[#f7e6dc]"} ${upayaReceiverContactError ? "border-red-500" : "border-gray-300 dark:border-white/20"}`}
                            />
                            {upayaReceiverContactError && (
                              <p className="text-xs text-red-500">{upayaReceiverContactError}</p>
                            )}
                          </div>
                          {/* Delivery Address */}
                          <div className="flex flex-col gap-1 sm:col-span-2">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
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
                              className={`w-full px-3 py-3 text-sm border rounded-lg focus:outline-none focus:border-black dark:focus:border-[#f7e6dc] transition-colors ${upayaAddressError ? "border-red-500" : "border-gray-300 dark:border-white/20"
                                }`}
                            />
                            {upayaAddressError && (
                              <p className="text-xs text-red-500">{upayaAddressError}</p>
                            )}
                          </div>
                          {/* Landmark (optional) */}
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              Landmark <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                              type="text"
                              value={upayaLandmark}
                              onChange={(e) => setUpayaLandmark(e.target.value)}
                              placeholder="Nearby landmark"
                              className="w-full px-3 py-3 text-sm border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:border-black dark:focus:border-[#f7e6dc] transition-colors"
                            />
                          </div>

                          {/* Client Note (optional) */}
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              Note for delivery <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                              type="text"
                              value={upayaClientNote}
                              onChange={(e) => setUpayaClientNote(e.target.value)}
                              placeholder="Any special instructions"
                              className="w-full px-3 py-3 text-sm border border-gray-300 dark:border-white/20 rounded-lg focus:outline-none focus:border-black dark:focus:border-[#f7e6dc] transition-colors"
                            />
                          </div>
                        </div>
                      )}

                      {!showUpayaSelectors && (
                        <FieldText
                          name="address"
                          placeholder="Detailed Address *"
                          multiline
                          rows={2}
                        />
                      )}
                    </div>
                  </div>

                  <hr className="border-t-2 border-[#f7e6dc]" />

                  {/* Sub-Group: Payment Method */}
                  <div>
                    <h3 className="font-display font-black uppercase text-sm tracking-tight  mb-3">
                      Payment Method
                    </h3>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row gap-3">

                        {/* Fonepay */}
                        <button
                          type="button"
                          disabled={showUpayaSelectors ? !upayaAddress?.trim() : !selectedAddress?.trim()}
                          onClick={() =>
                            setValue("payment_method", "fonepay", {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                          className={`flex-1 font-display font-black uppercase py-3 px-4 border-[3px] rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full
      ${selectedPaymentMethod === "fonepay"
                              ? "border-gray-400-700 bg-gray-100 text-red-700 shadow-[4px_4px_0_0_rgba(8,26,26,1)] "
                              : "border-red-600 bg-red-600 text-white shadow-none  active:shadow-none"
                            }`}
                        >
                          {selectedPaymentMethod === "fonepay" && (
                            <svg
                              className="w-4 h-4 shrink-0"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <circle
                                cx="8"
                                cy="8"
                                r="7"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M4.5 8l2.5 2.5 4.5-4.5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                          <div className="flex flex-row items-end gap-1">

                            <img src="img/fonepay/connect.png" alt="" className="h-5 object-contain" />
                            <img src="img/fonepay/Checkout_by_Fonepay.png" alt="" className="h-5 w-auto object-contain" />
                          </div>
                          Pay via Fonepay
                        </button>
                      </div>
                      {(showUpayaSelectors ? !upayaAddress?.trim() : !selectedAddress?.trim()) && (
                        <span className="text-xs text-red-500 block mt-3">
                          Enter your detailed address to enable Fonepay
                          configurations.
                        </span>
                      )}
                      {selectedPaymentMethod === "fonepay" && (
                        <div className="text-red-600 text-sm font-semibold border border-red-600 p-3 rounded-xl mt-5">
                          You will be prompted to scan a QR code via Fonepay securely after placing your order.
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="border-t-2 border-[#f7e6dc]" />

                  {/* Sub-Group: Order Summary Calculations */}
                  <div className=" border-2 border-[#f7e6dc] rounded-2xl p-4 space-y-3">
                    <h3 className="font-display font-black uppercase text-sm tracking-tight text-[#081a1a] mb-2">
                      Order Calculations Summary
                    </h3>

                    {mode === "cart" && cartCalculation ? (
                      <>
                        {cartCalculation.flash_sale?.has_flash_sale_items && (
                          <div className=" p-3 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-tight">
                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                            <span>
                              You're saving{" "}
                              {fCurrency(
                                cartCalculation.flash_sale
                                  .total_flash_sale_savings,
                              )}{" "}
                              with Flash Sale! (Provisional)
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm font-semibold ">
                          <span>Items ({cartCalculation.items_count}):</span>
                          <span>{fCurrency(cartCalculation.subtotal)}</span>
                        </div>

                        {cartCalculation.discount?.amount > 0 && (
                          <div className="flex justify-between text-sm font-bold text-green-500">
                            <span>
                              Discount (Provisional){" "}
                              {cartCalculation.discount_code?.code
                                ? `(${cartCalculation.discount_code.code})`
                                : ""}
                              :
                            </span>
                            <span>
                              -{fCurrency(cartCalculation.discount.amount)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm font-semibold ">
                          <span>Shipping:</span>
                          <span>
                            {cartCalculation.additional_charges_total > 0
                              ? fCurrency(
                                cartCalculation.additional_charges_total,
                              )
                              : "Free"}
                          </span>
                        </div>

                        <hr className="border-dashed border-[#f7e6dc]" />
                        <div className="flex justify-between items-baseline">
                          <span className="font-display font-black uppercase text-base">
                            Total:
                          </span>
                          <span className="text-xl font-black ">
                            {fCurrency(cartCalculation.total_amount)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm font-semibold ">
                          <span>Subtotal:</span>
                          <span>{fCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold ">
                          <span>Shipping:</span>
                          <span>
                            {logisticCharge
                              ? fCurrency(logisticCharge)
                              : "Free"}
                          </span>
                        </div>
                        <hr className="border-dashed border-[#f7e6dc]   " />
                        <div className="flex justify-between items-baseline">
                          <span className="font-display font-black uppercase text-base">
                            Total:
                          </span>
                          <span className="text-xl font-black ">
                            {fCurrency(totalAmount)}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Coupons inputs configuration system */}
                    {mode === "cart" && isLogin && (
                      <div className="pt-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            {...methods.register("discount_code")}
                            placeholder="Enter discount code"
                            disabled={isApplyingDiscount || isCalculating}
                            className="w-full  border-2 border-[#f7e6dc] rounded-xl px-3 py-2 text-sm font-bold placeholder-gray-400 focus:outline-none uppercase"
                          />
                          {appliedDiscountCode ? (
                            <button
                              type="button"
                              onClick={handleRemoveDiscount}
                              disabled={isCalculating}
                              className="bg-red-700  border-2 border-[#f7e6dc] rounded-xl px-4 py-2 text-xs font-black uppercase tracking-tight shadow-[2px_2px_0_0_rgba(8,26,26,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleApplyDiscount}
                              disabled={isCalculating || isApplyingDiscount}
                              className=" border-2 border-[#f7e6dc] rounded-xl px-4 py-2 text-xs font-black uppercase tracking-tight shadow-[2px_2px_0_0_rgba(8,26,26,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none inline-flex items-center gap-1"
                            >
                              {isApplyingDiscount && (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              )}
                              <span>Apply</span>
                            </button>
                          )}
                        </div>
                        {discountError && (
                          <span className="text-xs text-red-600 font-bold block mt-1">
                            {discountError}
                          </span>
                        )}
                        {appliedDiscountCode &&
                          cartCalculation?.discount_code && (
                            <span className="text-xs text-green-600 font-bold block mt-1">
                              ✓ Code applied: Saved{" "}
                              {fCurrency(
                                cartCalculation.discount_code.calculated_amount,
                              )}
                            </span>
                          )}
                      </div>
                    )}

                    <div className="pt-2">
                      <FieldText
                        name="remarks"
                        placeholder="Special Instructions / Delivery Remarks (optional)"
                        multiline
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Standard Brutalist Form submission controls */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-5 py-3 border-[3px] bg-red-700 text-white font-display font-black uppercase rounded-xl text-sm shadow-[3px_3px_0_0_rgba(8,26,26,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 border-[3px] font-display font-black uppercase rounded-xl text-sm shadow-[3px_3px_0_0_rgba(8,26,26,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 transition-all inline-flex items-center gap-2"
                    >
                      {isSubmitting && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      <span>Place Order</span>
                    </button>
                  </div>
                </div>
              </FormContainer>
            </div>
          </div>
        </>
      )
      }

      {/* Fonepay QR Payment Modal */}
      {
        fonepayModalOpen && (
          <FonepayQRModal
            key={fonepayOrderId || "fonepay-modal"}
            open={fonepayModalOpen}
            fonepayData={fonepayData}
            orderId={fonepayOrderId}
            onClose={() => {
              setFonepayModalOpen(false);
              if (fonepayOrderId) {
                router.push(paths.order.details(fonepayOrderId));
              }
            }}
            onSuccess={(oid) => {
              setFonepayModalOpen(false);
              dispatch(resetCart());
              toast.success("Payment confirmed! Your order is now processing.");
              router.push(paths.order.details(oid));
            }}
            onRetry={async () => {
              if (!fonepayOrderId) return;
              try {
                const fonepayResponse = await initiateFonepayPayment(fonepayOrderId);
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
        )
      }

      {/* OTP System Handling Layout Component */}
      <OtpVerificationDialog
        open={otpDialogOpen}
        onClose={handleCloseOtpDialog}
        email={userEmail}
        expiryMinutes={otpExpiryMinutes}
        onVerify={handleVerifyOtp}
        isVerifying={isVerifying}
        error={otpError}
      />

      {/* Backdrop Layer Screen System */}
      {
        (isSubmitting || isRedirecting) && (
          <div className="fixed inset-0 z-[9999] bg-[#081a1a]/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="bg-white border-[4px] border-[#081a1a] shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 rounded-3xl max-w-sm w-full text-center flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-[#081a1a] animate-spin" />
              <h3 className="font-display font-black uppercase text-lg text-[#081a1a]">
                {isRedirecting
                  ? selectedPaymentMethod === "fonepay"
                    ? "Generating QR..."
                    : "Redirecting to orders..."
                  : "Creating your order..."}
              </h3>
            </div>
          </div>
        )
      }
    </div >
  );
}

// ----------------------------------------------------------------------
// Tailwind Sub-Abstraction Hooks Fields Components To Replace MUI Forms
// ----------------------------------------------------------------------

function FormContainer({ children, methods, onSubmit }) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} noValidate>
        {children}
      </form>
    </FormProvider>
  );
}

function FieldText({ name, placeholder, multiline, rows = 2, type = "text" }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const hasError = !!errors[name];

  const baseClass = `w-full border-[3px] rounded-xl px-4 py-2.5 font-bold text-sm  placeholder-gray-400 outline-none transition-all ${hasError
    ? "border-red-600 focus:border-red-600 shadow-[3px_3px_0_0_rgba(220,38,38,1)]"
    : "border-[#f7e6dc] focus:border-blue-600 focus:shadow-[3px_3px_0_0_rgba(8,26,26,1)]"
    }`;

  return (
    <div className="w-full">
      {multiline ? (
        <textarea
          rows={rows}
          placeholder={placeholder}
          {...register(name)}
          className={baseClass}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          {...register(name)}
          className={baseClass}
        />
      )}
      {hasError && (
        <span className="text-xs font-bold text-red-600 block mt-1 px-1">
          {errors[name]?.message}
        </span>
      )}
    </div>
  );
}

function FieldSelect({ name, children, onChange }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const hasError = !!errors[name];

  const selectRegister = register(name);

  return (
    <div className="w-full">
      <select
        {...selectRegister}
        onChange={(e) => {
          selectRegister.onChange(e);
          if (onChange) onChange(e);
        }}
        className={`w-full  border-[3px] rounded-xl px-4 py-2.5 font-bold text-sm outline-none transition-all appearance-none cursor-pointer ${hasError
          ? "border-red-600 focus:border-red-600 shadow-[3px_3px_0_0_rgba(220,38,38,1)]"
          : "border-[#f7e6dc] focus:border-blue-600 focus:shadow-[3px_3px_0_0_rgba(8,26,26,1)]"
          }`}
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23081a1a' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
          backgroundSize: "1em",
        }}
      >
        {children}
      </select>
      {hasError && (
        <span className="text-xs font-bold text-red-600 block mt-1 px-1">
          {errors[name]?.message}
        </span>
      )}
    </div>
  );
}
