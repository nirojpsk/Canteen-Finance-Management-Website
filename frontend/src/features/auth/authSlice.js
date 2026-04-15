import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    adminInfo: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.adminInfo = action.payload;
        },
        clearCredentials: (state) => {
            state.adminInfo = null;
        },
    },
});

export const {setCredentials, clearCredentials} = authSlice.actions;
export default authSlice.reducer;