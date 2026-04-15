import { apiSlice } from "../api/apiSlice";
import { EXPENSES_URL } from "../../constants/apiConstants";

export const expenseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createExpense: builder.mutation({
      query: (data) => ({
        url: `${EXPENSES_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Expense", "Dashboard"],
    }),

    getAllExpenses: builder.query({
      query: (params = {}) => ({
        url: `${EXPENSES_URL}`,
        params,
      }),
      providesTags: ["Expense"],
    }),

    getExpenseById: builder.query({
      query: (id) => ({
        url: `${EXPENSES_URL}/${id}`,
      }),
      providesTags: ["Expense"],
    }),

    updateExpense: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${EXPENSES_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Expense", "Dashboard"],
    }),

    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `${EXPENSES_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expense", "Dashboard"],
    }),

    getExpenseSummary: builder.query({
      query: (params = {}) => ({
        url: `${EXPENSES_URL}/summary`,
        params,
      }),
      providesTags: ["Expense"],
    }),
  }),
});

export const {
  useCreateExpenseMutation,
  useGetAllExpensesQuery,
  useGetExpenseByIdQuery,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseSummaryQuery,
} = expenseApiSlice;