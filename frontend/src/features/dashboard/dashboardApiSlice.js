import { apiSlice } from "../api/apiSlice";
import { DASHBOARD_URL } from "../../constants/apiConstants";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: () => ({
        url: `${DASHBOARD_URL}/summary`,
      }),
      providesTags: ["Dashboard"],
    }),

    getDashboardStatsByPeriod: builder.query({
      query: (params = {}) => ({
        url: `${DASHBOARD_URL}/stats`,
        params,
      }),
      providesTags: ["Dashboard"],
    }),

    getRecentTransactions: builder.query({
      query: () => ({
        url: `${DASHBOARD_URL}/recent-transactions`,
      }),
      providesTags: ["Dashboard"],
    }),

    getDashboardOverview: builder.query({
      query: (params = {}) => ({
        url: `${DASHBOARD_URL}/overview`,
        params,
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetDashboardStatsByPeriodQuery,
  useGetRecentTransactionsQuery,
  useGetDashboardOverviewQuery,
} = dashboardApiSlice;
