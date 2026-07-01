import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout as logoutStore } from "./store";

// Same idea as before: any page can call useSession() to find out who is
// logged in, and get auto-redirected to /login if nobody is.
// The only change from the Next.js version is useNavigate() instead of
// useRouter() - that's react-router-dom's equivalent for redirecting.
export function useSession() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      navigate("/login", { replace: true });
      return;
    }
    setUser(current);
    setReady(true);
  }, [navigate]);

  function logout() {
    logoutStore();
    navigate("/login", { replace: true });
  }

  return { user, ready, logout };
}
