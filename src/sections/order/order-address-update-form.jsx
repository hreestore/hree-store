// import { z as zod } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useBoolean } from "@/hooks";

// import {
//   Box,
//   Dialog,
//   Typography,
//   MenuItem,
//   Divider,
//   Button,
// } from "@mui/material";
// import LoadingButton from "@mui/lab/LoadingButton";

// import { useAppSelector } from "@/redux/hooks";

// import { Form, Field, schemaHelper } from "@/components/hook-form";
// import { toast } from "@/components/snackbar";
// import { Iconify } from "@/components/iconify";

// import { useGetStates, updateOrderStatus } from "@/api";

// import { AddressNewForm } from "../address";

// import { useGetMutateOrders, useGetMutateOrderDetail } from "@/api/order";

// export const schema = zod.object({
//   customer_address_id: schemaHelper.nullableInput(
//     zod.string().min(1, { message: "Address is required!" }),
//     {
//       message: "Address is required!",
//     }
//   ),
// });

// export function OrderAddressUpdateForm({ open, onClose, orderUpdateData }) {
//   const openAddressForm = useBoolean();

//   const mutateOrders = useGetMutateOrders();

//   const mutateOrderDetail = useGetMutateOrderDetail(orderUpdateData?.id);

//   const { states } = useGetStates();

//   const { addresses } = useAppSelector((state) => state.profile);

//   const defaultValues = {
//     customer_address_id: "",
//   };

//   const methods = useForm({
//     resolver: zodResolver(schema),
//     defaultValues,
//   });

//   const {
//     handleSubmit,
//     reset,
//     setValue,
//     formState: { isSubmitting },
//   } = methods;

//   const handleAddressAddSuccess = (newAddress) => {
//     openAddressForm.onFalse();

//     setValue("customer_address_id", String(newAddress.address_id));
//   };

//   const onSubmit = handleSubmit(async (data) => {
//     if (!orderUpdateData?.id) {
//       toast.error("Invalid order information. Please try again.");
//       return;
//     }

//     try {
//       const updateData = {
//         customer_address_id: data.customer_address_id,
//       };

//       const response = await updateOrderStatus({
//         id: orderUpdateData.id,
//         ...updateData,
//       });
//       if (!response?.success) {
//         throw response;
//       }

//       onClose();

//       toast.success("Your delivery address has been successfully updated.");

//       reset();

//       mutateOrders();

//       mutateOrderDetail();
//     } catch (error) {
//       const validationErrors = error?.fieldErrors || error?.data;
//       if (validationErrors && typeof validationErrors === 'object') {
//         const errorMessages = Object.values(validationErrors).flat().join(', ');
//         toast.error(errorMessages || error?.message || "Validation failed. Please check your input.");
//       } else {
//         toast.error(error?.message || "Oops! Something went wrong. Please try again.");
//       }
//     }
//   });

//   return (
//     <>
//       <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
//         <Form methods={methods} onSubmit={onSubmit}>
//           <Box sx={{ p: 3, gap: 3, display: "flex", flexDirection: "column" }}>
//             <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//               <Typography variant="h6">Change Delivery Address?</Typography>

//               <Button
//                 variant="outlined"
//                 startIcon={<Iconify icon="mingcute:add-line" />}
//                 onClick={openAddressForm.onTrue}
//               >
//                 Add new
//               </Button>
//             </Box>

//             <Field.Select name="customer_address_id" label="Address">
//               <MenuItem
//                 value=""
//                 sx={{ fontStyle: "italic", color: "text.secondary" }}
//               >
//                 None
//               </MenuItem>

//               <Divider sx={{ borderStyle: "dashed" }} />

//               {addresses?.map((address) => (
//                 <MenuItem
//                   key={address.address_id}
//                   value={String(address.address_id)}
//                 >
//                   {address.address}, {address.district?.district_name}
//                 </MenuItem>
//               ))}
//             </Field.Select>

//             <Box sx={{ gap: 2, display: "flex", justifyContent: "flex-end" }}>
//               <Button variant="outlined" onClick={onClose}>
//                 Close
//               </Button>

//               <LoadingButton
//                 color="primary"
//                 type="submit"
//                 variant="contained"
//                 loading={isSubmitting}
//                 loadingIndicator="Updating..."
//               >
//                 Update Address
//               </LoadingButton>
//             </Box>
//           </Box>
//         </Form>
//       </Dialog>

//       <AddressNewForm
//         open={openAddressForm.value}
//         onClose={openAddressForm.onFalse}
//         onAddressAddSuccess={handleAddressAddSuccess}
//         //
//         states={states}
//       />
//     </>
//   );
// }

import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBoolean } from "@/hooks";

import { useAppSelector } from "@/redux/hooks";

import { Form, Field, schemaHelper } from "@/components/hook-form";
import { toast } from "@/components/snackbar";

import { useGetStates, updateOrderStatus } from "@/api";

import { AddressNewForm } from "../address";

import { useGetMutateOrders, useGetMutateOrderDetail } from "@/api/order";

export const schema = zod.object({
  customer_address_id: schemaHelper.nullableInput(
    zod.string().min(1, { message: "Address is required!" }),
    { message: "Address is required!" }
  ),
});

export function OrderAddressUpdateForm({ open, onClose, orderUpdateData }) {
  const openAddressForm = useBoolean();

  const mutateOrders = useGetMutateOrders();
  const mutateOrderDetail = useGetMutateOrderDetail(orderUpdateData?.id);

  const { states } = useGetStates();
  const { addresses } = useAppSelector((state) => state.profile);

  const defaultValues = { customer_address_id: "" };

  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    setValue,
    register,
    formState: { isSubmitting, errors },
  } = methods;

  const handleAddressAddSuccess = (newAddress) => {
    openAddressForm.onFalse();
    setValue("customer_address_id", String(newAddress.address_id));
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!orderUpdateData?.id) {
      toast.error("Invalid order information. Please try again.");
      return;
    }

    try {
      const response = await updateOrderStatus({
        id: orderUpdateData.id,
        customer_address_id: data.customer_address_id,
      });

      if (!response?.success) throw response;

      onClose();
      toast.success("Your delivery address has been successfully updated.");
      reset();
      mutateOrders();
      mutateOrderDetail();
    } catch (error) {
      const validationErrors = error?.fieldErrors || error?.data;
      if (validationErrors && typeof validationErrors === "object") {
        const errorMessages = Object.values(validationErrors).flat().join(", ");
        toast.error(errorMessages || error?.message || "Validation failed. Please check your input.");
      } else {
        toast.error(error?.message || "Oops! Something went wrong. Please try again.");
      }
    }
  });

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        onClick={onClose}
      >
        {/* Dialog panel */}
        <div
          className="relative w-full max-w-md rounded-xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Form methods={methods} onSubmit={onSubmit}>
            <div className="flex flex-col gap-5 p-6">

              {/* Header */}
              <div className="flex items-center justify-between">
                <h6 className="text-base font-semibold text-gray-900">
                  Change Delivery Address?
                </h6>
                <button
                  type="button"
                  onClick={openAddressForm.onTrue}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add new
                </button>
              </div>

              {/* Address Select */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Address
                </label>
                <select
                  {...register("customer_address_id")}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:ring-2 focus:ring-primary-500 ${errors.customer_address_id
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:border-primary-500"
                    }`}
                >
                  <option value="" className="italic text-gray-400">None</option>
                  {/* <option disabled className="border-t border-dashed border-gray-200" /> */}
                  {addresses?.map((address) => (
                    <option
                      key={address.address_id}
                      value={String(address.address_id)}
                    >
                      {address.address}, {address.district?.district_name}
                    </option>
                  ))}
                </select>
                {errors.customer_address_id && (
                  <p className="text-xs text-red-500">
                    {errors.customer_address_id.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Address"
                  )}
                </button>
              </div>

            </div>
          </Form>
        </div>
      </div>

      <AddressNewForm
        open={openAddressForm.value}
        onClose={openAddressForm.onFalse}
        onAddressAddSuccess={handleAddressAddSuccess}
        states={states}
      />
    </>
  );
}