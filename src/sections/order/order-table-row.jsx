import { useState } from "react";
import { useBoolean, usePopover } from "@/hooks";
import { useAppSelector } from "@/redux/hooks";
import { selectCartItems } from "@/redux/selectors";

import {
  Box,
  Link,
  Paper,
  Avatar,
  Collapse,
  TableRow,
  TableCell,
  IconButton,
  ListItemText,
  Button,
  MenuList,
  MenuItem,
  Divider,
} from "@mui/material";

import { CONFIG } from "@/global-config";

import { RouterLink } from "@/routes/components";

import { fCurrency } from "@/utils/format-number";
import { fDate, fTime } from "@/utils/format-time";

import { Label } from "@/components/label";
import { Iconify } from "@/components/iconify";
import { CustomPopover } from "@/components/custom-popover";

import { OrderUpdateForm } from "./order-update-form";
import { OrderAddressUpdateForm } from "./order-address-update-form";
import { useGetDesignCombinationShow } from "@/api";
import TshirtCanvas from '@/components/tshirt-canvas';

// ----------------------------------------------------------------------

export function OrderTableRow({ row, detailsHref }) {
  const { order_date, order_id, id, order_items, status, created_at } = row;
  // console.log(row, 'rowwwwwwww') 
  console.log(row, 'rewewew')
  const cartItems = useAppSelector(selectCartItems);

  // Use numeric id if available, otherwise fall back to order_id
  const numericOrderId = id || order_id;

  const collapseRow = useBoolean();

  const openOrderUpdateForm = useBoolean();

  const openOrderAddressUpdateForm = useBoolean();

  const [updateStatus, setUpdateStatus] = useState("");

  const menuActions = usePopover();

  const isOrderDeliveredOrCompleted = ["delivered", "completed"].includes(
    status
  );

  const isOrderCancelledOrReturned = ["returned", "cancelled"].includes(status);

  const handleOrderReturn = (newStatus) => {
    openOrderUpdateForm.onTrue();

    setUpdateStatus(newStatus);

    menuActions.onClose();
  };

  const handleOrderAddressChange = () => {
    openOrderAddressUpdateForm.onTrue();

    menuActions.onClose();
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    const cleanAssetsDir = CONFIG.assetsDir.endsWith('/') ? CONFIG.assetsDir.slice(0, -1) : CONFIG.assetsDir;
    return `${cleanAssetsDir}/${cleanUrl}`;
  };

  const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const enrichItemWithCartData = (orderItem) => {
    // First try: Redux cart (for same session)
    if (cartItems?.length) {
      const orderItemId = orderItem.item_id || orderItem.itemable_id;
      const cartItem = cartItems.find((ci) => {
        const cartItemId = ci.product_id || ci.itemable_id;

        if (!orderItemId || !cartItemId) return false;

        const itemMatch = String(orderItemId) === String(cartItemId);
        const variantMatch = orderItem.item_type === 'ProductVariant'
          ? String(orderItem.item_id) === String(ci.variant_id)
          : true;

        return itemMatch && variantMatch;
      });

      if (cartItem) {
        return {
          ...orderItem,
          tshirtFrontImage: orderItem.tshirt_front_image || cartItem.tshirtFrontImage,
          frontDesign: orderItem.frontDesign || (cartItem.frontDesign && { frontImage: cartItem.frontDesign.frontImage }),
          backDesign: orderItem.backDesign || (cartItem.backDesign && { frontImage: cartItem.backDesign.frontImage }),
          front_design_image: orderItem.front_design_image || cartItem.frontDesign?.frontImage,
          back_design_image: orderItem.back_design_image || cartItem.backDesign?.frontImage,
        };
      }
    }

    // Second try: Session storage (for different sessions)
    try {
      const orderCustomizations = JSON.parse(sessionStorage.getItem('orderCustomizations') || '{}');
      const orderItemId = orderItem.item_id || orderItem.itemable_id;
      const customData = orderCustomizations[orderItemId];

      if (customData) {
        return {
          ...orderItem,
          tshirtFrontImage: orderItem.tshirt_front_image || customData.tshirtFrontImage,
          frontDesign: orderItem.frontDesign || customData.frontDesign,
          backDesign: orderItem.backDesign || customData.backDesign,
          front_design_image: orderItem.front_design_image || customData.front_design_image,
          back_design_image: orderItem.back_design_image || customData.back_design_image,
        };
      }
    } catch (e) {
      console.log('Could not retrieve customizations from session storage');
    }

    return orderItem;
  };

  const rowTotalAmount = toNumber(
    row.total_amount ??
    row.grand_total ??
    row.payable_amount ??
    row.final_amount ??
    row.total
  );

  const renderPrimaryRow = () => (
    <TableRow hover>
      <TableCell>
        <Link component={RouterLink} href={detailsHref} color="inherit">
          {order_id}
        </Link>
      </TableCell>

      <TableCell>
        <ListItemText
          primary={fDate(order_date)}
          secondary={fTime(created_at)}
          slotProps={{
            primary: {
              noWrap: true,
              sx: { typography: "body2" },
            },
            secondary: {
              sx: { mt: 0.5, typography: "caption" },
            },
          }}
        />
      </TableCell>

      <TableCell align="center"> {order_items?.length} </TableCell>

      <TableCell> {fCurrency(rowTotalAmount)} </TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (status === "completed" && "success") ||
            (status === "pending" && "warning") ||
            (status === "cancelled" && "error") ||
            "default"
          }
        >
          {status}
        </Label>
        {row.payment_method && (
          <div className="text-[10px] uppercase font-bold text-gray-500 mt-1">
            {row.payment_method === "fonepay"
              ? "Fonepay"
              : row.payment_method === "cod"
                ? "COD"
                : row.payment_method}
          </div>
        )}
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: "nowrap" }}>
        <Box sx={{ gap: 1, display: "flex", justifyContent: "flex-end" }}>
          <Button
            component={RouterLink}
            href={detailsHref}
            variant="soft"
            color="primary"
          >
            View Details
          </Button>

          <IconButton
            color={collapseRow.value ? "inherit" : "default"}
            onClick={collapseRow.onToggle}
            sx={{ ...(collapseRow.value && { bgcolor: "action.hover" }) }}
          >
            <Iconify icon="eva:arrow-ios-downward-fill" />
          </IconButton>

          {!isOrderCancelledOrReturned && (
            <IconButton
              color={menuActions.open ? "inherit" : "default"}
              onClick={menuActions.onOpen}
            >
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );

  const renderSecondaryRow = () => (
    <TableRow>
      <TableCell sx={{ p: 0, border: "none" }} colSpan={8}>
        <Collapse
          in={collapseRow.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: "background.neutral" }}
        >
          <Paper sx={{ m: 1.5, bgcolor: "transparent" }}>
            {order_items?.map((item, index) => {
              const combinationId = item?.design_combination?.id;
              const { designCombinationShow } = useGetDesignCombinationShow(combinationId);
              const combination = designCombinationShow?.data?.[0];
              const frontCombinationImage = combination?.items?.[0]?.design?.featured_image;
              const backCombinationImage = combination?.items?.[1]?.design?.featured_image;


              const enrichedItem = enrichItemWithCartData(item);
              const productName = enrichedItem.item_name;
              const isHoodieTemplate = productName?.toLowerCase().includes('hoodie');
              const isToteTemplate = productName?.toLowerCase().includes('tote bag');
              const isSweatshirtTemplate = productName?.toLowerCase().includes('sweatshirt');
              const isTshirtTemplate = !isHoodieTemplate && !isToteTemplate && !isSweatshirtTemplate;
              const isSwappedCombination = Boolean(
                item?.swapped_combination ?? item?.customization?.swapped_combination,
              );

              return (
                <Box
                  key={item.order_item_id || `${item.item_id || item.itemable_id || item.product_id}-${index}`}
                  sx={(theme) => ({
                    display: "flex",
                    alignItems: "center",
                    p: theme.spacing(1.5, 2, 1.5, 1.5),
                    "&:not(:last-of-type)": {
                      borderBottom: `solid 2px ${theme?.palette?.background?.neutral || theme?.palette?.divider || '#e5e7eb'}`,
                    },
                  })}
                >
                  {item?.item_image ? (
                    <div className="relative w-28 mr-4 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center isolate" style={{ aspectRatio: '16/11' }}>
                      <TshirtCanvas
                        mockUrl={item?.item_image || ''}
                        frontDesignUrl={frontCombinationImage ? CONFIG.assetsDir + frontCombinationImage : null}
                        backDesignUrl={backCombinationImage ? CONFIG.assetsDir + backCombinationImage : null}
                        isSwapped={isSwappedCombination}
                        isReverseMockup={isHoodieTemplate}
                        className={`transition-transform duration-300 w-full h-full object-cover`}
                        frontConfig={{
                          scale: isHoodieTemplate ? 0.45 : isSweatshirtTemplate ? 0.80 : isToteTemplate ? 0.75 : isTshirtTemplate ? 0.9 : 1,
                          shiftX: isToteTemplate ? 0.115 : isSweatshirtTemplate ? 0.070 : isTshirtTemplate ? 0.055 : -0.03,
                          shiftY: isToteTemplate ? 0.19 : isSweatshirtTemplate ? 0.030 : isTshirtTemplate ? -0.02 : 0.08,
                          rotation: 0
                        }}
                        backConfig={{
                          scale: isHoodieTemplate ? 0.75 : isSweatshirtTemplate ? 0.40 : isToteTemplate ? 0.55 : isTshirtTemplate ? 0.4 : 1,
                          shiftX: isToteTemplate ? -0.11 : isSweatshirtTemplate ? -0.055 : isTshirtTemplate ? -0.05 : 0.020,
                          shiftY: isToteTemplate ? 0.19 : isSweatshirtTemplate ? -0.16 : isTshirtTemplate ? -0.23 : 0.10,
                          rotation: 0
                        }}
                      />
                    </div>
                  ) : (
                    <Avatar
                      src={getImageUrl(enrichedItem.item_image || enrichedItem.featured_image)}
                      variant="rounded"
                      sx={{ width: 48, height: 48, mr: 2 }}
                    />
                  )}

                  <ListItemText
                    primary={enrichedItem.item_name}
                    secondary={enrichedItem.item_sku}
                    slotProps={{
                      primary: {
                        sx: { typography: "inherit" },
                      },
                      secondary: {
                        sx: { mt: 0.5, color: "inherit" },
                      },
                    }}
                  />

                  <div>x{enrichedItem.quantity} </div>

                  <Box sx={{ width: 110, textAlign: "right" }}>
                    {fCurrency(enrichedItem.price)}
                  </Box>
                </Box>
              );
            })}
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: "right-top" } }}
    >
      <MenuList>
        {!isOrderDeliveredOrCompleted && (
          <MenuItem onClick={handleOrderAddressChange}>Change address</MenuItem>
        )}

        {isOrderDeliveredOrCompleted && (
          <MenuItem
            onClick={() => handleOrderReturn("returned")}
            sx={{ color: "error.main" }}
          >
            Return
          </MenuItem>
        )}

        <Divider sx={{ borderStyle: "dashed" }} />

        {!isOrderDeliveredOrCompleted && (
          <MenuItem
            sx={{ color: "error.main" }}
            onClick={() => handleOrderReturn("cancelled")}
          >
            Cancel
          </MenuItem>
        )}
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      {renderPrimaryRow()}

      {renderSecondaryRow()}

      {renderMenuActions()}

      {openOrderUpdateForm.value && (
        <OrderUpdateForm
          open={openOrderUpdateForm.value}
          onClose={openOrderUpdateForm.onFalse}
          //
          orderUpdateData={{
            id: numericOrderId,
            status: updateStatus,
          }}
        />
      )}

      {openOrderAddressUpdateForm.value && (
        <OrderAddressUpdateForm
          open={openOrderAddressUpdateForm.value}
          onClose={openOrderAddressUpdateForm.onFalse}
          //
          orderUpdateData={{
            id: numericOrderId,
          }}
        />
      )}
    </>
  );
}
