const fs = require('fs');

let c = fs.readFileSync('src/sections/order/order-details-items.jsx', 'utf8');

let startIndex = c.indexOf('const renderThumbnail = (item) => {');
let endStr = 'className="object-cover"\\n                    unoptimized\\n                  />\\n                </div>\\n              );\\n            };';
let endIndex = c.indexOf(endStr) + endStr.length;

if (startIndex > -1 && endIndex > startIndex) {
  const newCode = \const renderThumbnail = (item) => {
    const getImageUrl = (url) => {
      if (!url) return null;
      if (url.startsWith('http') || url.startsWith('data:')) return url;
      const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
      const cleanAssetsDir = CONFIG.assetsDir.endsWith('/') ? CONFIG.assetsDir.slice(0, -1) : CONFIG.assetsDir;
      return \\\\\\/\\\\\\;
    };

    const baseImg = getImageUrl(item.tshirtFrontImage || item.tshirt_front_image);
    const frontImg = getImageUrl(item.frontDesign?.frontImage || item.front_design_image);
    const backImg = getImageUrl(item.backDesign?.frontImage || item.back_design_image);
    const standardImg = getImageUrl(item.item_image || item.featured_image) || '/assets/placeholder.png';

    // If we have customization data, render composite image
    if (baseImg) {
      return (
        <div className="relative w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center isolate">
          {/* Base T-shirt Image */}
          <img
            src={baseImg}
            alt="T-shirt Layout"
            className="w-full h-auto block z-[-1] relative object-contain"
          />

          {/* Front Design Overlay */}
          {frontImg && (
            <img
              src={frontImg}
              alt="Front Design"
              className="absolute z-[3] object-contain"
              style={{
                left: '17.8%',
                top: '13%',
                width: '30%',
                height: '60%'
              }}
            />
          )}

          {/* Back Design Overlay */}
          {backImg && (
            <img
              src={backImg}
              alt="Back Design"
              className="absolute z-[3] object-contain"
              style={{
                left: '52.2%',
                top: '12%',
                width: '30%',
                height: '60%'
              }}
            />
          )}
        </div>
      );
    }

    // Standard product image fallback
    return (
      <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
        <Image
          src={standardImg}
          alt={item.item_name || item.product_name || item.name || 'Product'}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }; \;

  let replaced = c.substring(0, startIndex) + newCode + c.substring(endIndex);
  fs.writeFileSync('src/sections/order/order-details-items.jsx', replaced);
  console.log('Success');
} else {
  console.log('Failed to find markers.');
}
