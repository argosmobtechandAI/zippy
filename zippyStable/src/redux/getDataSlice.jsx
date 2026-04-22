import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedStable: null,
}

const getDataSlice = createSlice({
    name: "getData",
    initialState,
    reducers: {
        setSelectedStable: (state, action) => {
            state.selectedStable = action.payload;
        },
    },
});

export const { setSelectedStable } = getDataSlice.actions;
export default getDataSlice.reducer;