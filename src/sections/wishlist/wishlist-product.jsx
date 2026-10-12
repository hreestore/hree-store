import {
  Box,
  Link,
  Avatar,
  TableRow,
  TableCell,
  IconButton,
  Button,
  Typography,
} from "@mui/material";

import { CONFIG } from "@/global-config";

import { RouterLink } from "@/routes/components";
import { paths } from "@/routes/paths";

import { fCurrency } from "@/utils/format-number";

import { Iconify } from "@/components/iconify";

// ----------------------------------------------------------------------

export function WishlistProduct({ row, onMoveToCart, onDelete }) {
  const { wishlist_id, product_name, slug, product_image, price, variant_id, variant_name } = row;

  const { regularPrice, flashSalePrice } = price || {};

  // const shouldUseFlashSalePrice = Number(flashSalePrice) < Number(regularPrice);

  return (
    <TableRow>
      <TableCell>
        <Box sx={{ gap: 2, display: "flex", alignItems: "center" }}>
          <Avatar
            variant="rounded"
            alt={product_name}
            src={`${product_image}`}
            sx={{ width: 64, height: 64 }}
          />

          <Link
            component={RouterLink}
            href={paths.product.details(slug)}
            sx={{ color: "inherit", typography: "subtitle2", maxWidth: 240 }}
          >
            {product_name}
          </Link>
        </Box>
      </TableCell>

      <TableCell>
        {/* {shouldUseFlashSalePrice ? ( */}
        {/* <Box
            sx={{
              gap: 0.5,
              display: "flex",
              typography: "body2",
            }}
          >
            <Box
              component="span"
              sx={{ color: "text.disabled", textDecoration: "line-through" }}
            >
              {fCurrency(regularPrice)}
            </Box>

            <Box component="span">{fCurrency(flashSalePrice)}</Box>
          </Box>
        ) : ( */}
        <Typography variant="body2">{fCurrency(price)}</Typography>
        {/* )} */}
      </TableCell>

      <TableCell align="right">
        <Button
          variant="outlined"
          color="primary"
          onClick={() => onMoveToCart(row)}
        >
          Add to Cart
        </Button>
      </TableCell>

      <TableCell align="right" sx={{ px: 1 }}>
        <IconButton color="error" onClick={() => onDelete(wishlist_id)}>
          <Iconify icon="solar:trash-bin-trash-bold" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
