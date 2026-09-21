import { useEffect } from "react";

import { useAppDispatch } from "../../app/hooks";
import { supabase } from "../../config/supabase";
import { setDemoSession, setSession } from "./authSlice";

function readPersistedDemoState() {
  if (typeof window === "undefined") return false;

  try {
    const raw = window.localStorage.getItem("northstar-demo-user");
    return Boolean(raw);
  } catch {
    return false;
  }
}

export function AuthBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let active = true;

    if (readPersistedDemoState()) {
      dispatch(setDemoSession());
      return () => {
        active = false;
      };
    }

    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        dispatch(setSession(data.session));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return null;
}
