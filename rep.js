const fs = require('fs');

function replaceProductList() {
    const file = 'src/sections/cart/cart-product-list.jsx';
    let text = fs.readFileSync(file, 'utf8');

    // Remove MUI table imports
    text = text.replace(/import Table from "@mui\/material\/Table";\r?\n/, '');
    text = text.replace(/import TableBody from "@mui\/material\/TableBody";\r?\n/, '');
    text = text.replace(/import { TableHeadCustom } from "@\/components\/table";\r?\n/, '');
    text = text.replace(/const TABLE_HEAD = [\s\S]*?];\r?\n\r?\n/, '');

    const replacement = `export function CartProductList({
  items,
  onDeleteCartItem,
  onChangeItemQuantity,
  onMoveToWishlist,
}) {
  return (
    <Scrollbar>
      <div className="flex flex-col min-w-[720px]">
        <div className="flex items-center px-6 py-4 bg-gray-50/50 border-b border-[#081a1a]/5 text-[10px] font-black uppercase tracking-[0.2em] text-[#081a1a]/60">
          <div className="flex-1">Product</div>
          <div className="w-32">Price</div>
          <div className="w-32 text-center">Quantity</div>
          <div className="w-32 text-right">Total Price</div>
          <div className="w-32"></div>
        </div>

        <div className="flex flex-col">
          {items.map((row, index) => (
            <CartProduct
              key={index}
              row={row}
              onDeleteCartItem={onDeleteCartItem}
              onChangeItemQuantity={onChangeItemQuantity}
              onMoveToWishlist={onMoveToWishlist}
            />
          ))}
        </div>
      </div>
    </Scrollbar>
  );
}`;

    const startIdx = text.indexOf('export function CartProductList');
    if (startIdx !== -1) {
        text = text.substring(0, startIdx) + replacement;
        fs.writeFileSync(file, text);
        console.log('Updated cart-product-list.jsx');
    }
}

function replaceProduct() {
    const file = 'src/sections/cart/cart-product.jsx';
    if (!fs.existsSync(file)) return;
    let text = fs.readFileSync(file, 'utf8');

    // replace imports
    text = text.replace(/import\s+\{\s*Box,\s*Avatar,\s*TableRow,\s*TableCell,\s*IconButton,\s*Link,\s*Button,\s*Typography,\s*Chip,\s*Stack,\s*\}\s*from\s*"@mui\/material";/, 'import { Box, Avatar, Link, Typography, Chip, Stack } from "@mui/material";');

    const replacement = `  return (
    <div className="flex items-center px-6 py-4 border-b border-[#081a1a]/5 hover:bg-gray-50/30 transition-colors last:border-b-0">
      <div className="flex-1 flex items-center gap-4">
        {renderThumbnail()}

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              component={RouterLink}
              href={paths.product.details(slug)}
              className="font-display font-black uppercase tracking-tight text-sm text-[#081a1a] hover:text-[#711a20] transition-colors !no-underline"
            >
              {productName}
            </Link>
            {isFlashSale && (
              <Chip
                icon={<Iconify icon="solar:fire-bold" width={16} />}
                label="Flash Sale"
                size="small"
                color="error"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </div>
          {isFlashSale && flashSaleRemaining > 0 && (
            <Typography variant="caption" sx={{ color: 'warning.dark', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Iconify icon="solar:clock-circle-bold" width={14} />
              {flashSaleRemaining} left at this price
            </Typography>
          )}
        </div>
      </div>

      <div className="w-32 flex flex-col justify-center">
        {isFlashSale && regularPriceValue > priceValue ? (
          <>
            <span className="text-[11px] text-gray-400 line-through font-medium">
              {fCurrency(regularPriceValue)}
            </span>
            <span className="text-sm font-bold text-red-600">
              {fCurrency(priceValue)}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
              Save {fCurrency(regularPriceValue - priceValue)}
            </span>
          </>
        ) : (
          <span className="text-sm font-bold text-[#081a1a]">
            {fCurrency(priceValue)}
          </span>
        )}
      </div>

      <div className="w-32 flex justify-center">
        <NumberInput
          hideDivider
          value={Number(quantity)}
          onChange={(event, quantity) =>
            onChangeItemQuantity(cart_id, quantity)
          }
          min={1}
        />
      </div>

      <div className="w-32 text-right text-sm font-black text-[#081a1a]">
        {fCurrency(priceValue * quantity)}
      </div>

      <div className="w-32 flex items-center justify-end gap-2 pl-4">
        {isLogin && !isProductInWishlist && (
          <button
            onClick={() => onMoveToWishlist(row)}
            className="text-[9px] font-black uppercase tracking-widest text-[#081a1a]/60 hover:text-[#081a1a] border border-[#081a1a]/10 hover:border-[#081a1a] px-2 py-1.5 rounded-lg transition-all whitespace-nowrap hidden sm:block"
          >
            Wishlist
          </button>
        )}

        <button 
          onClick={() => onDeleteCartItem(cart_id)}
          className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all flex-shrink-0"
          title="Remove item"
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
        </button>
      </div>
    </div>
  );
}`;

    const startIdx = text.indexOf('  return (');
    if (startIdx !== -1) {
        text = text.substring(0, startIdx) + replacement;
        fs.writeFileSync(file, text);
        console.log('Updated cart-product.jsx');
    }
}

replaceProductList();
replaceProduct();