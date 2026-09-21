import { configureStore } from "@reduxjs/toolkit";
import { contactsApi } from "../features/contacts/contactsApi";
import authReducer from "../features/auth/authSlice";
import contactsUiReducer from "../features/contacts/contactsUiSlice";

export const adminstore = configureStore({
  reducer: { auth: authReducer, contactsUi: contactsUiReducer, [contactsApi.reducerPath]: contactsApi.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(contactsApi.middleware),
});

export type RootState = ReturnType<typeof adminstore.getState>;
export type AppDispatch = typeof adminstore.dispatch;