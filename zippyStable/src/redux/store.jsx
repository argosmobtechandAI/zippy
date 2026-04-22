import { configureStore } from "@reduxjs/toolkit";
import getDataReducer from "./getDataSlice";


const store = configureStore({
    reducer: {
        getDataReducer
    }
})

export default store;