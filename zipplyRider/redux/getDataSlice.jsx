import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getAllUsersApi, getRiderApi, getUserApi } from '../api/api';
import { apiFunction } from '../api/apifunction';

export const fetchUsers = createAsyncThunk('getData/fetchUsers', async () => {
    try {
        const response = await apiFunction(getAllUsersApi, [], {}, 'GET', true);
        return response;
    } catch (error) {
        throw error;

    }
});

export const fetchUser = createAsyncThunk('getData/fetchUser', async () => {

    try {
        const response = await apiFunction(getUserApi, [], {}, 'GET', true);
        console.log(response, "resss")
        return response?.user;
    } catch (error) {
        console.log(error, "error")

    }
});

export const fetchRider = createAsyncThunk('getData/fetchRider', async () => {
    try {
        const response = await apiFunction(getRiderApi, [], {}, 'GET', true);
        return response?.rider;
    } catch (error) {
        throw error;

    }
});

const initialState = {
    users: [],
    loading: false,
    error: null,
    user: null,
    rider: null
};

const getDataSlice = createSlice({
    name: "getData",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchRider.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRider.fulfilled, (state, action) => {
                state.loading = false;
                state.rider = action.payload;
            })
            .addCase(fetchRider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
});

export default getDataSlice.reducer