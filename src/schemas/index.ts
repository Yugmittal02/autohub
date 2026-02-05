import { z } from 'zod';

// Profile Settings Schema
export const ProfileSchema = z.object({
    shopName: z.string().min(2, "Shop Name must be at least 2 characters"),
    ownerName: z.string().min(2, "Owner Name is required"),
    shopAddress: z.string().optional(),
    shopCity: z.string().optional(),
    shopPincode: z.string().optional(),
    gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST Number format").or(z.literal('')).optional(),
    mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid Mobile Number").optional(),
    email: z.string().email("Invalid Email Address").optional().or(z.literal('')),
});

// Quotation Customer Schema
export const QuotationCustomerSchema = z.object({
    name: z.string().min(1, "Customer Name is required"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits").or(z.literal('')).optional(),
    address: z.string().optional()
});

// Quotation Item Schema
export const QuotationItemSchema = z.object({
    name: z.string().min(1, "Item Name is required"),
    qty: z.number().min(1, "Quantity must be at least 1"),
    rate: z.number().min(0, "Rate cannot be negative"),
});

// Full Quotation Schema
export const QuotationSchema = z.object({
    cust: QuotationCustomerSchema,
    items: z.array(QuotationItemSchema).min(1, "Add at least one item to the quotation"),
    discount: z.number().min(0).optional()
});
