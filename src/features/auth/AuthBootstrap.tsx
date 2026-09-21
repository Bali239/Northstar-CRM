import { useEffect } from "react";
import { supabase } from "../../config/supabase";
import { useAppDispatch } from "../../app/hooks";
import { setSession } from "./authSlice";

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => { let active = true; void supabase.auth.getSession().then(({ data }) => { if (active) dispatch(setSession(data.session)); }); const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => dispatch(setSession(session))); return () => { active = false; subscription.subscription.unsubscribe(); }; }, [dispatch]);
  return null;
}