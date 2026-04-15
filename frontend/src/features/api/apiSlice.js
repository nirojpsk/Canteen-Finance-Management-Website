import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "/api").trim().replace(/\/$/, "");

const baseQuery = fetchBaseQuery({
    baseUrl: apiBaseUrl,
    credentials: "include",
});

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery,
    tagTypes: ["Admin", "Student", "Income", "Expense", "Dashboard"],
    endpoints: () => ({}),
});

export default apiSlice;
