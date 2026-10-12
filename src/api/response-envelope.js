const DEFAULT_ERROR_MESSAGE = "Something went wrong!";

const isObject = (value) => value !== null && typeof value === "object";

const isValidationMap = (value) => {
  if (!isObject(value) || Array.isArray(value)) return false;
  return Object.values(value).some((entry) => Array.isArray(entry));
};

export const normalizeEnvelope = (response, fallbackMessage = "") => {
  if (isObject(response) && ("success" in response || "status" in response)) {
    return {
      status: Number(response.status) || (response.success ? 200 : 400),
      success: Boolean(response.success),
      message: response.message || fallbackMessage || "",
      data: response.data ?? null,
      raw: response,
    };
  }

  return {
    status: 200,
    success: true,
    message: fallbackMessage || "",
    data: response ?? null,
    raw: response,
  };
};

export const normalizeApiError = (error, fallbackMessage = DEFAULT_ERROR_MESSAGE) => {
  const status = Number(error?.status) || 500;
  const data = error?.data ?? null;

  const envelopeLikeMessage =
    typeof error?.message === "string"
      ? error.message
      : typeof error?.error === "string"
        ? error.error
        : null;

  const message =
    envelopeLikeMessage ||
    (isValidationMap(data) ? "Validation failed" : null) ||
    fallbackMessage;

  const fieldErrors = isValidationMap(data)
    ? data
    : isValidationMap(error?.errors)
      ? error.errors
      : null;

  return {
    status,
    success: false,
    message,
    data,
    fieldErrors,
    raw: error,
  };
};
