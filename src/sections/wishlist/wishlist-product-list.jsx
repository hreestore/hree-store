import { Table, TableBody } from "@mui/material";

import { Scrollbar } from "@/components/scrollbar";
import { TableHeadCustom } from "@/components/table";

import { WishlistProduct } from "./wishlist-product";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "product", label: "Product" },
  { id: "price", label: "Price" },
  { id: "cartButton" },
  { id: "deleteButton" },
];

// ----------------------------------------------------------------------

export function WishlistProductList({ items, onMoveToCart, onDelete }) {
  return (
    <Scrollbar>
      <Table sx={{ minWidth: 720 }}>
        <TableHeadCustom headCells={TABLE_HEAD} />

        <TableBody>
          {items?.map((row) => (
            <WishlistProduct
              key={row.wishlist_id}
              //
              row={row}
              onMoveToCart={onMoveToCart}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </Scrollbar>
  );
}
