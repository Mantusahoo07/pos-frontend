import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orderId: "",
    customerName: "",
    customerPhone: "",
    guests: 0,
    table: null,
    isAnonymous: false
};

const customerSlice = createSlice({
    name: "customer",
    initialState,
    reducers: {
        setCustomer: (state, action) => {
            const { name, phone, guests } = action.payload;
            state.orderId = `ORD${Date.now()}`;
            state.customerName = name || `Guest ${Math.floor(Math.random() * 1000)}`;
            state.customerPhone = phone || "";
            state.guests = guests;
            state.isAnonymous = !name || name.startsWith("Guest");
        },

        removeCustomer: (state) => {
            state.orderId = "";
            state.customerName = "";
            state.customerPhone = "";
            state.guests = 0;
            state.table = null;
            state.isAnonymous = false;
        },

        updateTable: (state, action) => {
            state.table = action.payload.table;
        },

        updateCustomerName: (state, action) => {
            state.customerName = action.payload;
            state.isAnonymous = false;
        },

        updateCustomerPhone: (state, action) => {
            state.customerPhone = action.payload;
        }
    }
});

export const { 
    setCustomer, 
    removeCustomer, 
    updateTable, 
    updateCustomerName, 
    updateCustomerPhone 
} = customerSlice.actions;

export default customerSlice.reducer;
