import { z as zod } from "zod";

export const updateProfileSchema = zod.object({
  full_name: zod.string().min(1, { message: "Name is required!" }),

  email: zod
    .string()
    .min(1, { message: "Email is required!" })
    .email({ message: "Email must be a valid email address!" }),

  featured_image: zod
    .custom()
    .optional()
    .transform((data, ctx) => {
      if (!data) return data;

      const hasFile =
        data instanceof File || (typeof data === "string" && !!data.length);

      if (!hasFile) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: "Profile image is required!",
        });

        return null;
      }

      return data;
    }),

  phone_number: zod
    .string()
    .min(1, { message: "Contact number is required!" })
    .regex(/^\d{10}$/, {
      message: "Contact number must be exactly 10 digits!",
    }),

  addresses: zod.array(zod.any()).optional(),
});

export const changePassWordSchema = zod
  .object({
    old_password: zod
      .string()
      .min(1, { message: "Password is required!" })
      .min(8, { message: "Password must be at least 8 characters!" }),

    new_password: zod
      .string()
      .min(1, { message: "New password is required!" })
      .min(8, { message: "Password must be at least 8 characters!" }),

    confirm_new_password: zod
      .string()
      .min(1, { message: "Confirm password is required!" })
      .min(8, { message: "Password must be at least 8 characters!" }),
  })
  .refine((data) => data.old_password !== data.new_password, {
    message: "New password must be different than old password",
    path: ["new_password"],
  })

  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Passwords do not match!",
    path: ["confirm_new_password"],
  });
