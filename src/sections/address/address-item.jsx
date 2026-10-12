export function AddressItem({
  addressItem,
  selectedAddress,
  action,
  className,
  ...other
}) {
  const { address_id, address, district, state } = addressItem;

  return (
    <div
      className={[
        "relative flex flex-col gap-4 md:flex-row md:items-end border-[#f7e6dc] border-2 rounded-xl lg:p-6 p-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...other}
    >
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center">
          <span className="text-sm font-semibold">
            {address}, {district?.district_name}
          </span>

          {selectedAddress === address_id && (
            <span className="ml-2 inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700">
              Selected
            </span>
          )}
        </div>

        <span className="text-sm ">
          {state?.state_name}
        </span>
      </div>

      {action && action}
    </div>
  );
}