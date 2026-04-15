import { apiSlice } from "../api/apiSlice";
import { STUDENTS_URL } from "../../constants/apiConstants";

export const studentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createStudent: builder.mutation({
      query: (data) => ({
        url: `${STUDENTS_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Student", "Dashboard"],
    }),

    getAllStudents: builder.query({
      query: (params = {}) => ({
        url: `${STUDENTS_URL}`,
        params,
      }),
      providesTags: ["Student"],
    }),

    getStudentById: builder.query({
      query: (id) => ({
        url: `${STUDENTS_URL}/${id}`,
      }),
      providesTags: ["Student"],
    }),

    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${STUDENTS_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Student", "Dashboard"],
    }),

    toggleStudentStatus: builder.mutation({
      query: (id) => ({
        url: `${STUDENTS_URL}/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["Student", "Dashboard"],
    }),

    getStudentIncomeHistory: builder.query({
      query: ({ id, ...params }) => ({
        url: `${STUDENTS_URL}/${id}/history`,
        params,
      }),
      providesTags: ["Student", "Income"],
    }),
  }),
});

export const {
  useCreateStudentMutation,
  useGetAllStudentsQuery,
  useGetStudentByIdQuery,
  useUpdateStudentMutation,
  useToggleStudentStatusMutation,
  useGetStudentIncomeHistoryQuery,
} = studentApiSlice;