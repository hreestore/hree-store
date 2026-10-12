const fs = require('fs');
let c = fs.readFileSync('src/sections/order/order-details-items.jsx', 'utf8');

c = c.replace(
  'const renderThumbnail = (item) => {',
  const getImageUrl = (url) => {
              if (!url) return null;
              if (url.startsWith('http') || url.startsWith('data:')) return url;
              const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
              const cleanAssetsDir = CONFIG.assetsDir.endsWith('/') ? CONFIG.assetsDir.slice(0, -1) : CONFIG.assetsDir;
              return \\\\\\/\\\\\\;
            };

            const renderThumbnail = (item) => {
);

c = c.replace(
  'if (item.tshirtFrontImage || item.tshirt_front_image) {',
  const baseImg = getImageUrl(item.tshirtFrontImage || item.tshirt_front_image);
              const frontImg = getImageUrl(item.frontDesign?.frontImage || item.front_design_image);
              const backImg = getImageUrl(item.backDesign?.frontImage || item.back_design_image);

              if (baseImg) {
);

c = c.replace(/src=\{item\.tshirtFrontImage \|\| item\.tshirt_front_image\}/g, 'src={baseImg}');
c = c.replace(/\{\(item\.frontDesign\?\.frontImage \|\| item\.front_design_image\) && \(/g, '{frontImg && (');
c = c.replace(/src=\{item\.frontDesign\?\.frontImage \|\| item\.front_design_image\}/g, 'src={frontImg}');
c = c.replace(/\{\(item\.backDesign\?\.frontImage \|\| item\.back_design_image\) && \(/g, '{backImg && (');
c = c.replace(/src=\{item\.backDesign\?\.frontImage \|\| item\.back_design_image\}/g, 'src={backImg}');

c = c.replace(
  src={item.item_image || item.featured_image || '/placeholder.jpg'},
  src={getImageUrl(item.item_image || item.featured_image) || '/placeholder.jpg'}
);

fs.writeFileSync('src/sections/order/order-details-items.jsx', c);
