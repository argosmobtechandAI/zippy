import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CartItemType = 'pack' | 'level';

export interface CartItem {
    key: CartItemType;
    type: CartItemType;
    id: string;
    name: string;
    amount: number;
    gst?: number;
    pricingOption?: 'monthlyPrice' | 'weekdaysPrice' | 'weekendPrice';
}

interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const incoming = action.payload;
            // Remove existing item of the same type before adding
            state.items = state.items.filter(item => item.type !== incoming.type);
            state.items.push(incoming);
        },
        removeFromCart: (state, action: PayloadAction<CartItemType>) => {
            state.items = state.items.filter(item => item.type !== action.payload);
        },
        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
