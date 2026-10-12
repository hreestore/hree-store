import { useState } from "react";
import { Plus, MapPin, Trash2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setProfileAddresses } from "@/redux/actions";

import { toast } from "@/components/snackbar";

import { AddressNewForm } from "../address";

import { useGetStates, removeAddress } from "@/api";

export function ProfileAddress() {
  const [addressFormOpen, setAddressFormOpen] = useState(false);

  const dispatch = useAppDispatch();

  const { addresses } = useAppSelector((state) => state.profile);

  const { states } = useGetStates();

  const handleDelete = async (id) => {
    try {
      await removeAddress(id);

      const updatedAddresses = addresses.filter(
        (address) => address.address_id !== id
      );

      dispatch(setProfileAddresses(updatedAddresses));

      toast.success("Address deleted!");
    } catch (error) {
      toast.error("Couldn't remove address! Try again.");
    }
  };

  const renderNoAddress = () => (
    <div className="col-span-full">
      <div className=" rounded-[2.5rem] p-12 text-center shadow-sm border border-[#f7e6dc]">
        <div className="w-20 h-20  rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-10 h-10 " />
        </div>
        <h3 className="text-2xl font-display font-black uppercase tracking-tighter mb-2">
          Address not found
        </h3>
        <p className=" text-sm">
          Please, add your address to proceed the checkout process!
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-display font-black uppercase tracking-tighter">
              Your addresses
            </h2>
            <p className=" mt-1 text-sm">
              Manage your shipping address
            </p>
          </div>

          <button
            onClick={() => setAddressFormOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-4  rounded-full font-bold uppercase tracking-tight text-sm hover:bg-[#711a20] transition-all"
          >
            <Plus className="w-5 h-5" />
            New address
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {!!addresses?.length
            ? addresses.map((address) => (
              <AddressItem
                key={address.address_id}
                addressItem={address}
                onDelete={() => handleDelete(address.address_id)}
              />
            ))
            : renderNoAddress()}
        </div>
      </div>

      <AddressNewForm
        open={addressFormOpen}
        onClose={() => setAddressFormOpen(false)}
        states={states}
      />
    </>
  );
}

// ----------------------------------------------------------------------

export function AddressItem({ addressItem, onDelete }) {
  const { address, district, state } = addressItem;

  return (
    <div className=" rounded-[2.5rem] p-6 shadow-sm border border-[#f7e6dc] hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10  rounded-full flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 " />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold  mb-1 text-sm">
            {address}, {district?.district_name}
          </h3>
          <p className="text-sm ">{state?.state_name}</p>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-full font-bold uppercase tracking-tight text-xs hover:bg-red-100 transition-all border border-red-200"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
}
