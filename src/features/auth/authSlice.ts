import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Session, User } from "@supabase/supabase-js";

type AuthState = { session: Session | null; user: User | null; isDemo: boolean; isReady: boolean };
const initialState: AuthState = { session: null, user: null, isDemo: false, isReady: false };
const authSlice = createSlice({ name: "auth", initialState, reducers: {
  setSession: (state, action: PayloadAction<Session | null>) => { state.session = action.payload; state.user = action.payload?.user ?? null; state.isDemo = false; state.isReady = true; },
  setDemoSession: (state) => { state.session = null; state.user = { id: "demo-user", email: "demo@northstar.crm", app_metadata: {}, user_metadata: { full_name: "Demo Operator" }, aud: "authenticated", created_at: new Date().toISOString() }; state.isDemo = true; state.isReady = true; },
  clearSession: () => initialState,
} });
export const { setSession, setDemoSession, clearSession } = authSlice.actions;
export default authSlice.reducer;