import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";

import { Scrollbar } from "@/components/scrollbar";
import { TableHeadCustom } from "@/components/table";

import { CartProduct } from "./cart-product";

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: "product", label: "Product" },
  { id: "price", label: "Price" },
  { id: "quantity", label: "Quantity" },
  { id: "totalAmount", label: "Total Price", align: "right" },
  { id: "" },
];

// ----------------------------------------------------------------------

export function CartProductList({
  items,
  onDeleteCartItem,
  onChangeItemQuantity,
  onMoveToWishlist,
}) {
  return (
    <Scrollbar>
      <Table sx={{ minWidth: 720 }}>
        <TableHeadCustom headCells={TABLE_HEAD} />

        <TableBody>
          {items.map((row, index) => (
            <CartProduct
              key={index}
              row={row}
              onDeleteCartItem={onDeleteCartItem}
              onChangeItemQuantity={onChangeItemQuantity}
              onMoveToWishlist={onMoveToWishlist}
            />
          ))}
        </TableBody>
      </Table>
    </Scrollbar>
  );
}
