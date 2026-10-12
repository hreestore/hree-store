"use client";

import { Box, Card, CardContent, Stack, Typography, Divider } from "@mui/material";

import { CONFIG } from "@/global-config";

import { fCurrency } from "@/utils/format-number";

import { NumberInput } from "@/components/number-input";

// ----------------------------------------------------------------------

export function BuyNowProductDisplay({ product, quantity, onQuantityChange, deliveryCharge = 0 }) {
    if (!product) return null;

    const {
        name,
        featured_image,
        price,
        selling_price,
        flash_sale_products,
    } = product;

    const regularPrice = selling_price?.regularPrice || price;
    const flashSalePrice = selling_price?.flashSalePrice || price;
    const hasFlashSale = flash_sale_products && flash_sale_products.length > 0;

    const finalPrice = hasFlashSale && parseFloat(flashSalePrice) < parseFloat(regularPrice)
        ? flashSalePrice
        : regularPrice;

    const subtotal = quantity * parseFloat(finalPrice);

    return (
        <Card sx={{ boxShadow: 2 }}>
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            component="img"
                            alt={name}
                            src={
                                featured_image
                                    ? `${featured_image}`
                                    : `/assets/placeholder.png`
                            }
                            sx={{
                                width: 100,
                                height: 100,
                                flexShrink: 0,
                                borderRadius: 1,
                                overflow: "hidden",
                                bgcolor: "grey.100",
                                objectFit: "cover",
                            }}
                        />

                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {name}
                            </Typography>

                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                {hasFlashSale && parseFloat(flashSalePrice) < parseFloat(regularPrice) && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: "text.disabled",
                                            textDecoration: "line-through",
                                        }}
                                    >
                                        {fCurrency(regularPrice)}
                                    </Typography>
                                )}
                                <Typography variant="h6" color="error.main" fontWeight={700}>
                                    {fCurrency(finalPrice)}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    <Divider />

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Quantity:
                        </Typography>
                        <NumberInput
                            value={quantity}
                            onChange={(event, value) => onQuantityChange(value)}
                            min={1}
                            max={100}
                            sx={{ maxWidth: 120 }}
                        />
                    </Stack>

                    <Divider />

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                            Subtotal:
                        </Typography>
                        <Typography variant="h6" color={deliveryCharge > 0 ? "text.primary" : "primary.main"} fontWeight={700}>
                            {fCurrency(subtotal)}
                        </Typography>
                    </Stack>

                    {deliveryCharge > 0 && (
                        <>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Delivery Charge:
                                </Typography>
                                <Typography variant="h6" fontWeight={700}>
                                    {fCurrency(deliveryCharge)}
                                </Typography>
                            </Stack>
                            <Divider />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Total:
                                </Typography>
                                <Typography variant="h6" color="primary.main" fontWeight={700}>
                                    {fCurrency(subtotal + deliveryCharge)}
                                </Typography>
                            </Stack>
                        </>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
