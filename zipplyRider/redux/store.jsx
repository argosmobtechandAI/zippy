import { configureStore } from '@reduxjs/toolkit';
import getDataReducer from './getDataSlice';

const store = configureStore({
    reducer: {
        getData: getDataReducer
    }
});

export default store;