import { apiSlice } from "../api/apiSlice";
import { INCOME_URL } from "../../constants/apiConstants";

export const incomeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createIncome: builder.mutation({
      query: (data) => ({
        url: `${INCOME_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Income", "Dashboard", "Student"],
    }),

    getAllIncome: builder.query({
      query: (params = {}) => ({
        url: `${INCOME_URL}`,
        params,
      }),
      providesTags: ["Income"],
    }),

    getIncomeById: builder.query({
      query: (id) => ({
        url: `${INCOME_URL}/${id}`,
      }),
      providesTags: ["Income"],
    }),

    updateIncome: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${INCOME_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Income", "Dashboard", "Student"],
    }),

    deleteIncome: builder.mutation({
      query: (id) => ({
        url: `${INCOME_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Income", "Dashboard", "Student"],
    }),

    getIncomeSummary: builder.query({
      query: (params = {}) => ({
        url: `${INCOME_URL}/summary`,
        params,
      }),
      providesTags: ["Income"],
    }),
  }),
});

export const {
  useCreateIncomeMutation,
  useGetAllIncomeQuery,
  useGetIncomeByIdQuery,
  useUpdateIncomeMutation,
  useDeleteIncomeMutation,
  useGetIncomeSummaryQuery,
} = incomeApiSlice;