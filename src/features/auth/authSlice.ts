import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Session, User } from "@supabase/supabase-js";

const DEMO_USER_KEY = "northstar-demo-user";

type AuthState = {
  session: Session | null;
  user: User | null;
  isDemo: boolean;
  isReady: boolean;
};

const readDemoUser = (): User | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(DEMO_USER_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<User> | null;
    if (!parsed || !parsed.id || !parsed.email) return null;

    return {
      id: parsed.id,
      email: parsed.email,
      app_metadata: parsed.app_metadata ?? {},
      user_metadata: parsed.user_metadata ?? { full_name: "Demo Operator" },
      aud: parsed.aud ?? "authenticated",
      created_at: parsed.created_at ?? new Date().toISOString(),
      role: parsed.role,
      updated_at: parsed.updated_at,
    } as User;
  } catch {
    return null;
  }
};

const writeDemoUser = (user: User | null) => {
  if (typeof window === "undefined") return;

  if (!user) {
    window.localStorage.removeItem(DEMO_USER_KEY);
    return;
  }

  window.localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
};

const initialState: AuthState = {
  session: null,
  user: readDemoUser(),
  isDemo: !!readDemoUser(),
  isReady: !!readDemoUser(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
      state.user = action.payload?.user ?? null;
      state.isDemo = false;
      state.isReady = true;
      writeDemoUser(null);
    },
    setDemoSession: (state) => {
      state.session = null;
      state.user = {
        id: "demo-user",
        email: "demo@northstar.crm",
        app_metadata: {},
        user_metadata: { full_name: "Demo Operator" },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as User;
      state.isDemo = true;
      state.isReady = true;
      writeDemoUser(state.user);
    },
    clearSession: () => {
      writeDemoUser(null);
      return {
        session: null,
        user: null,
        isDemo: false,
        isReady: true,
      };
    },
  },
});

export const { setSession, setDemoSession, clearSession } = authSlice.actions;

export default authSlice.reducer;
