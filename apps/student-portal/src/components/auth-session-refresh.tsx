"use client";

import { useEffect } from "react";
import { createClient } from "@scalex/db/client";

const REFRESH_MS = 4 * 60 * 1000;

/**
 * Keeps the Supabase browser session alive so token expiry (~1h, or shorter
 * project JWT TTL) does not bounce mid-navigation to /login.
 */
export function AuthSessionRefresh() {
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      /* cookie writes happen inside the browser client */
    });

    void supabase.auth.getSession();

    const id = window.setInterval(() => {
      void supabase.auth.getSession();
    }, REFRESH_MS);

    return () => {
      subscription.unsubscribe();
      window.clearInterval(id);
    };
  }, []);

  return null;
}
