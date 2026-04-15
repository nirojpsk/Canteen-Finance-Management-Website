import apiSlice from "../api/apiSlice";
import { clearCredentials, setCredentials } from "./authSlice";
import { AUTH_URL } from "../../constants/apiConstants";

const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        loginAdmin: builder.mutation({
            query: (data) => ({
                url: `${AUTH_URL}/login`,
                method: "POST",
                body: data,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data?.admin) {
                        dispatch(setCredentials(data.admin));
                    }
                } catch {
                    dispatch(clearCredentials());
                }
            },
        }),
        logoutAdmin: builder.mutation({
            query: () => ({
                url: `${AUTH_URL}/logout`,
                method: "POST",
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } finally {
                    dispatch(clearCredentials());
                    dispatch(apiSlice.util.resetApiState());
                }
            },
        }),
        getAdminProfile: builder.query({
            query: () => ({
                url: `${AUTH_URL}/me`,
            }),
            providesTags: ["Admin"],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data?.admin) {
                        dispatch(setCredentials(data.admin));
                    }
                } catch {
                    dispatch(clearCredentials());
                }
            },
        }),
        updateAdminProfile: builder.mutation({
            query: (data) => ({
                url: `${AUTH_URL}/profile`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Admin"],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data?.admin) {
                        dispatch(setCredentials(data.admin));
                    }
                } catch {
                    // Keep the current profile in place if a profile edit fails.
                }
            },
        }),

        changeAdminPassword: builder.mutation({
            query: (data) => ({
                url: `${AUTH_URL}/change-password`,
                method: "PUT",
                body: data,
            }),
        }),
    }),
});

export const {
    useLoginAdminMutation,
    useLogoutAdminMutation,
    useGetAdminProfileQuery,
    useUpdateAdminProfileMutation,
    useChangeAdminPasswordMutation,
} = authApiSlice;
