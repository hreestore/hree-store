// import { z as zod } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useState, useEffect } from "react";

// import {
//   Box,
//   Stack,
//   Button,
//   Dialog,
//   MenuItem,
//   Divider,
//   Typography,
// } from "@mui/material";
// import LoadingButton from "@mui/lab/LoadingButton";

// import { Form, Field, schemaHelper } from "@/components/hook-form";
// import { toast } from "@/components/snackbar";

// import { useAppDispatch } from "@/redux/hooks";
// import { setProfileAddresses } from "@/redux/actions";

// import { addAddress } from "@/api/profile";

// // ----------------------------------------------------------------------

// export const NewAddressSchema = zod.object({
//   address: zod.string().min(1, { message: "Address is required!" }),

//   state_id: schemaHelper.nullableInput(
//     zod.string().min(1, { message: "State is required!" }),
//     {
//       message: "State is required!",
//     }
//   ),

//   district_id: schemaHelper.nullableInput(
//     zod.string().min(1, { message: "District is required!" }),
//     {
//       message: "District is required!",
//     }
//   ),
// });

// // ----------------------------------------------------------------------

// export function AddressNewForm({ open, onClose, states, isLogin = true, isInline = false, initialData = null, onAddressAddSuccess }) {
//   const dispatch = useAppDispatch();

//   const [districts, setDistricts] = useState([]);

//   const defaultValues = {
//     state_id: initialData?.state?.state_id ? String(initialData.state.state_id) : "",
//     district_id: initialData?.district?.district_id ? String(initialData.district.district_id) : "",
//     address: initialData?.address || "",
//   };

//   const methods = useForm({
//     mode: "all",
//     resolver: zodResolver(NewAddressSchema),
//     defaultValues,
//   });

//   const {
//     handleSubmit,
//     reset,
//     formState: { isSubmitting },
//   } = methods;

//   // Load districts when initialData has state
//   useEffect(() => {
//     if (initialData?.state?.districts) {
//       setDistricts(initialData.state.districts);
//     }
//   }, [initialData]);

//   const handleSelectState = (stateDistricts) => {
//     setDistricts(stateDistricts);
//   };

//   const onSubmit = handleSubmit(async (data) => {
//     try {
//       if (isLogin) {
//         // Logged-in user: save to backend
//         const response = await addAddress(data);

//         const addresses = response[0].addresses;

//         dispatch(setProfileAddresses(addresses));

//         reset();

//         onClose();

//         onAddressAddSuccess?.(addresses[addresses.length - 1]);

//         toast.success("Address added!");
//       } else {
//         // Guest user: skip API call, just pass data to callback
//         const selectedState = states.find(s => s.state_id === parseInt(data.state_id));
//         const selectedDistrict = districts.find(d => d.district_id === parseInt(data.district_id));

//         const guestAddressData = {
//           address_id: "guest-address",
//           address: data.address,
//           state: selectedState,
//           district: selectedDistrict,
//         };

//         reset();

//         onClose();

//         onAddressAddSuccess?.(guestAddressData);

//         toast.success(initialData ? "Order Details updated!" : "Order Details added!");
//       }
//     } catch (error) {
//       toast.error("Failed to add address!");

//       console.error(error);
//     }
//   });

//   const formContent = (
//     <Form methods={methods} onSubmit={onSubmit}>
//       <Stack spacing={3} sx={{ p: isInline ? 0 : 3 }}>
//         <Typography variant="h6"> {isInline ? "" : "Add a new address"} </Typography>

//         <Box
//           sx={{
//             rowGap: 3,
//             columnGap: 2,
//             display: "grid",
//             gridTemplateColumns: {
//               xs: "repeat(1, 1fr)",
//               sm: "repeat(2, 1fr)",
//             },
//           }}
//         >
//           <Field.Select
//             name="state_id"
//             label="State"
//             placeholder="Choose a state"
//           >
//             <MenuItem
//               value=""
//               sx={{ fontStyle: "italic", color: "text.secondary" }}
//             >
//               None
//             </MenuItem>

//             <Divider sx={{ borderStyle: "dashed" }} />

//             {states?.map(({ state_id, state_name, districts }) => (
//               <MenuItem
//                 key={state_id}
//                 value={String(state_id)}
//                 onClick={() => handleSelectState(districts)}
//               >
//                 {state_name}
//               </MenuItem>
//             ))}
//           </Field.Select>

//           <Field.Select
//             name="district_id"
//             label="District"
//             placeholder="Choose a District"
//           >
//             <MenuItem
//               value=""
//               sx={{ fontStyle: "italic", color: "text.secondary" }}
//             >
//               None
//             </MenuItem>

//             <Divider sx={{ borderStyle: "dashed" }} />

//             {districts?.map(({ district_id, district_name }) => (
//               <MenuItem key={district_id} value={String(district_id)}>
//                 {district_name}
//               </MenuItem>
//             ))}
//           </Field.Select>
//         </Box>

//         <Field.Text name="address" label="Address" />

//         <Box sx={{ display: "flex", gap: 1, justifyContent: isInline ? "flex-start" : "flex-end" }}>
//           {!isInline && (
//             <Button color="inherit" variant="outlined" onClick={onClose}>
//               Cancel
//             </Button>
//           )}

//           <LoadingButton
//             type="submit"
//             variant="contained"
//             loading={isSubmitting}
//             fullWidth={isInline}
//             size={isInline ? "large" : "medium"}
//           >
//             {isInline ? "Continue" : "Add Address"}
//           </LoadingButton>
//         </Box>
//       </Stack>
//     </Form>
//   );

//   if (isInline) {
//     return formContent;
//   }

//   return (
//     <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose} sx={{ borderRadius: 10 }}>
//       {formContent}
//     </Dialog>
//   );
// }


import { z as zod } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";

import { toast } from "@/components/snackbar";
import { useAppDispatch } from "@/redux/hooks";
import { setProfileAddresses } from "@/redux/actions";
import { addAddress } from "@/api/profile";

// ----------------------------------------------------------------------

export const NewAddressSchema = zod.object({
  address: zod.string().min(1, { message: "Address is required!" }),
  state_id: zod.string().min(1, { message: "State is required!" }),
  district_id: zod.string().min(1, { message: "District is required!" }),
});

// ----------------------------------------------------------------------

export function AddressNewForm({ open, onClose, states, isLogin = true, isInline = false, initialData = null, onAddressAddSuccess }) {
  const dispatch = useAppDispatch();
  const [districts, setDistricts] = useState([]);

  const defaultValues = {
    state_id: initialData?.state?.state_id ? String(initialData.state.state_id) : "",
    district_id: initialData?.district?.district_id ? String(initialData.district.district_id) : "",
    address: initialData?.address || "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: "all",
    resolver: zodResolver(NewAddressSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialData?.state?.districts) {
      setDistricts(initialData.state.districts);
    }
  }, [initialData]);

  const handleSelectState = (e) => {
    const stateId = e.target.value;
    setValue("state_id", stateId, { shouldValidate: true });
    setValue("district_id", "", { shouldValidate: false });
    const selected = states?.find((s) => String(s.state_id) === stateId);
    setDistricts(selected?.districts || []);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isLogin) {
        const response = await addAddress(data);
        const addresses = response[0].addresses;
        dispatch(setProfileAddresses(addresses));
        reset();
        onClose();
        onAddressAddSuccess?.(addresses[addresses.length - 1]);
        toast.success("Address added!");
      } else {
        const selectedState = states.find((s) => s.state_id === parseInt(data.state_id));
        const selectedDistrict = districts.find((d) => d.district_id === parseInt(data.district_id));
        const guestAddressData = {
          address_id: "guest-address",
          address: data.address,
          state: selectedState,
          district: selectedDistrict,
        };
        reset();
        onClose();
        onAddressAddSuccess?.(guestAddressData);
        toast.success(initialData ? "Order Details updated!" : "Order Details added!");
      }
    } catch (error) {
      toast.error("Failed to add address!");
      console.error(error);
    }
  });

  const formContent = (
    <form onSubmit={onSubmit}>
      <div className={`flex flex-col gap-5 ${isInline ? "p-0" : "p-6"}`}>
        {!isInline && (
          <h6 className="text-base font-semibold">Add a new address</h6>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
          {/* State */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700">State *</label>
            <select
              onChange={handleSelectState}
              defaultValue={defaultValues.state_id}
              className={`w-full px-3 py-3 text-sm border rounded-lg focus:outline-none focus:border-black transition-colors ${errors.state_id ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="">Choose a state</option>
              {states?.map(({ state_id, state_name }) => (
                <option key={state_id} value={String(state_id)}>
                  {state_name}
                </option>
              ))}
            </select>
            {errors.state_id && (
              <p className="text-xs text-red-500">{errors.state_id.message}</p>
            )}
          </div>

          {/* District */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-700">District *</label>
            <select
              {...register("district_id")}
              disabled={!districts.length}
              className={`w-full px-3 py-3 text-sm border rounded-lg focus:outline-none focus:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 ${errors.district_id ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="">Choose a district</option>
              {districts?.map(({ district_id, district_name }) => (
                <option key={district_id} value={String(district_id)}>
                  {district_name}
                </option>
              ))}
            </select>
            {errors.district_id && (
              <p className="text-xs text-red-500">{errors.district_id.message}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-700">Address *</label>
          <input
            {...register("address")}
            type="text"
            placeholder="Enter your address"
            className={`w-full px-3 py-3 text-sm border rounded-lg focus:outline-none focus:border-black transition-colors ${errors.address ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.address && (
            <p className="text-xs text-red-500">{errors.address.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className={`flex gap-2 ${isInline ? "justify-start" : "justify-end"}`}>
          {!isInline && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${isInline ? "w-full py-3" : ""
              }`}
          >
            {isSubmitting && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
            )}
            {isInline ? "Continue" : "Add Address"}
          </button>
        </div>
      </div>
    </form>
  );

  if (isInline) return formContent;

  // Dialog backdrop
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {formContent}
      </div>
    </div>
  );
}