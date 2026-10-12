import { useGetSizeCatalogue } from "@/api/size-catalogue";
import { motion } from "motion/react";
import { CONFIG } from "@/global-config";
import { Ruler } from "lucide-react";

// ----------------------------------------------------------------------
// Step 3: Size Selection Component
// ----------------------------------------------------------------------

export default function Step3Size({
  extractVariantTypes,
  getAvailableValuesForType,
  selectedVariantValues,
  handleVariantSelection,
  selectedProduct,
  productDetails,
}) {
  const categoryId = selectedProduct?.category_id || selectedProduct?.id;
  const { sizeCatalogue } = useGetSizeCatalogue(categoryId);

  // Helper function: Get all possible values for a variant type regardless of other selections
  const getAllValuesForType = (variantTypeId) => {
    if (!productDetails?.variants || productDetails.variants.length === 0)
      return [];

    const valuesMap = new Map();
    productDetails.variants.forEach((variant) => {
      const targetValue = variant.variant_values?.find(
        (vv) => vv.variant_type.id === variantTypeId,
      );
      if (targetValue && !valuesMap.has(targetValue.value)) {
        valuesMap.set(targetValue.value, targetValue);
      }
    });

    return Array.from(valuesMap.values());
  };

  // console.log('sizeCatalogue in Step3Size.jsx', sizeCatalogue);
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="mb-6"
    >
      <div className="mb-4">
        <h2 className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tighter mb-2 lg:mb-4 leading-none">
          Select <span className="text-[#711a20]">Size</span>
        </h2>
      </div>

      {/* Dynamic Variant Type Sections */}
      {extractVariantTypes
        .filter((vt) => vt.name.toLowerCase() !== "color")
        .map((variantType) => {
          const availableValues = getAvailableValuesForType(variantType.id);
          const allValues = getAllValuesForType(variantType.id);
          // Fallback to availableValues if allValues couldn't be generated for some reason
          const displayValues =
            allValues.length > 0 ? allValues : availableValues;
          const selectedValue = selectedVariantValues[variantType.id];

          return (
            // <div key={variantType.id} className="space-y-6 lg:space-y-8">
            /* Size Chart Image based on Selected Category */
            /* {variantType.name.toLowerCase() === 'size' && (() => {
                            if (!sizeCatalogue) return null;

                            // Handle both array and object responses
                            const catalogue = Array.isArray(sizeCatalogue) ? sizeCatalogue[0] : sizeCatalogue;
                            if (!catalogue) return null;

                            // const sizeImage = catalogue?.image || catalogue?.web_image;
                            // console.log(sizeImage, 'sizeImage');
                            // if (!sizeImage) return null;

                            return (
                                <img
                                    src={catalogue.image}
                                    alt={catalogue.name || "Size Chart"}
                                    title={catalogue.name || "Size Chart"}
                                    className="lg:w-[70%] object-contain"
                                />
                            );
                        })()} */
            <div key={variantType.id} className="space-y-6 lg:space-y-8">
              {variantType.name.toLowerCase() === "size" &&
                (() => {
                  // 1. Safely extract the array.
                  // If it has a 'data' property use that, otherwise if it's already an array use it directly, else fallback to an empty array.
                  const rawCatalogueData = sizeCatalogue?.data || (Array.isArray(sizeCatalogue) ? sizeCatalogue : []);
                  // Flatten in case the API returns an array inside an array
                  const catalogueData = Array.isArray(rawCatalogueData) ? rawCatalogueData.flat() : rawCatalogueData;
                  console.log('catalogueData:', catalogueData);
                  // 2. Check if we have any items to render
                  const hasCatalogueData = catalogueData.length > 0;

                  return (
                    <div className="w-full mb-3">
                      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm ">
                        <table className="w-full text-left text-sm">
                          <thead className=" text-xs uppercase font-black tracking-wider ">
                            <tr>
                              <th className="px-4 py-3">Size</th>
                              <th className="px-4 py-3">Chest</th>
                              <th className="px-4 py-3">Length</th>
                              <th className="px-4 py-3">Sleeve</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 ">
                            {/* 3. Map over the extracted array */}
                            {hasCatalogueData ? (
                              catalogueData.map((row) => (
                                <tr
                                  key={row.id}
                                  className="hover:bg-[#711a20] hover:text-[#f7e6dc]
                                   transition-colors"
                                >
                                  <td className="px-4 py-3 font-bold ">
                                    {row.size}
                                  </td>
                                  <td className="px-4 py-3 ">
                                    {row.chest}
                                  </td>
                                  <td className="px-4 py-3 ">
                                    {row.length}
                                  </td>
                                  <td className="px-4 py-3 ">
                                    {row.sleeve}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="px-4 py-6 text-center ">
                                  Size chart data not available.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                    </div>
                  );
                })()}
              <div className="flex justify-between items-start">

                <div className="flex flex-wrap gap-3 lg:gap-3">
                  {displayValues.map((variantValue) => {
                    const isAvailable = availableValues.some(
                      (av) => av.value === variantValue.value,
                    );
                    const isSelected =
                      selectedValue?.value === variantValue.value;

                    return (
                      <button
                        key={variantValue.id}
                        disabled={!isAvailable}
                        onClick={() =>
                          isAvailable &&
                          handleVariantSelection(variantType, isSelected ? null : variantValue)
                        }
                        className={`relative w-12 h-12 lg:w-12 lg:h-12 rounded-2xl lg:rounded-2xl font-display font-black text-xl lg:text-xl transition-all duration-500 border-2 lg:border-4 ${!isAvailable
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : isSelected
                            ? "bg-[#081a1a] text-[#ffffff] border-[#081a1a] scale-110 shadow-xl lg:shadow-2xl"
                            : "bg-[#ffffff] text-[#081a1a] border-[#081a1a]/5 hover:border-[#081a1a]/20"
                          }`}
                      >
                        <span className={!isAvailable ? "opacity-50" : ""}>
                          {variantValue.value}
                        </span>
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-2xl">
                            <div className="w-[150%] h-[2px] bg-red-400 rotate-[-45deg] origin-center -translate-y-0.5"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}

                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest  flex items-center justify-end gap-2">
                  <Ruler /> Size Guide
                </h3>
              </div>
            </div>
          );
        })}
    </motion.div>
  );
}
