import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) window.location.href = "/dashboard";
      else window.location.href = "/login";
    }
    check();
  }, []);

  return <p>Finishing login…</p>;
}
