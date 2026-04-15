export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error.data?.message ||
    error.error ||
    error.message ||
    fallback
  );
};

export default getErrorMessage;
