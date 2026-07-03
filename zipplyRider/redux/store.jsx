import { configureStore } from '@reduxjs/toolkit';
import getDataReducer from './getDataSlice';
import cartReducer from './cartSlice';

const store = configureStore({
    reducer: {
        getData: getDataReducer,
        cart: cartReducer,
    }
});

export default store;