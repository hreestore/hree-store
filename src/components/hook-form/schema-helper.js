export const schemaHelper = {
  /**
   * Creates a nullable input field that transforms empty strings to null
   * and validates that the field is not null with a custom message
   *
   * @param {ZodSchema} schema - The base Zod schema to wrap
   * @param {Object} options - Options object
   * @param {string} options.message - Error message when field is null/empty
   * @returns {ZodSchema} Transformed Zod schema
   */
  nullableInput: (schema, options = {}) => {
    return schema
      .nullable()
      .transform((val) => {
        if (val === '' || val === null || val === undefined) {
          return null;
        }
        return val;
      })
      .refine((val) => val !== null, {
        message: options.message || 'This field is required',
      });
  },
};
