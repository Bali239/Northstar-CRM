import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ContactFilters } from "./contactTypes";
const initialState: ContactFilters = { search: "", status: "all", source: "all", sort: "newest" };
const contactsUiSlice = createSlice({ name: "contactsUi", initialState, reducers: { setFilter: <K extends keyof ContactFilters>(state: ContactFilters, action: PayloadAction<{ key: K; value: ContactFilters[K] }>) => { state[action.payload.key] = action.payload.value; }, resetFilters: () => initialState } });
export const { setFilter, resetFilters } = contactsUiSlice.actions;
export default contactsUiSlice.reducer;