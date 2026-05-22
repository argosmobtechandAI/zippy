import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getRiderApi, getUserApi, getSessionsByRiderApi, getAllStablesApi } from '../api/api';
import { apiFunction } from '../api/apifunction';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchRiderSessions = createAsyncThunk('getData/fetchRiderSessions', async (riderId) => {
    try {
        const response = await apiFunction(getSessionsByRiderApi(riderId), [], {}, 'GET', true);
        return response?.sessions || [];
    } catch (error) {
        console.log(error, "error")
    }
});

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
        if (response?.user) {
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
        }
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

export const fetchStables = createAsyncThunk('getData/fetchStables', async () => {
    try {
        const response = await apiFunction(getAllStablesApi, [], {}, 'GET', false);
        console.log(response, "responseee")
        return response?.stables;
    } catch (error) {
        throw error;
    }
});

const initialState = {
    users: [],
    loading: false,
    error: null,
    user: null,
    rider: null,
    sessions: [],
    stables: null
};

const getDataSlice = createSlice({
    name: "getData",
    initialState,
    reducers: {
        resetData: (state) => {
            state.user = null;
            state.rider = null;
            state.users = [];
            state.sessions = [];
            state.stables = null;
            state.loading = false;
            state.error = null;
        }
    },
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
            .addCase(fetchRiderSessions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRiderSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.sessions = action.payload;
            })
            .addCase(fetchRiderSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchStables.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStables.fulfilled, (state, action) => {
                state.loading = false;
                state.stables = action.payload;
            })
            .addCase(fetchStables.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    }
});

export const { resetData } = getDataSlice.actions;
export default getDataSlice.reducer